import { fabric } from "fabric";
import {
  type VersionControlCommit,
  type Branch,
  type ChangesSummary,
  type MergeConflict,
  type ConflictResolution,
  VersionControlStorage,
} from "./version-control";

export class VersionControlManager {
  private canvas: fabric.Canvas;
  private currentUser = {
    name: "Designer",
    initials: "D",
    avatar: undefined,
  };

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
  }

  async createCommit(message: string, tags: string[] = []): Promise<VersionControlCommit> {
    const commits = VersionControlStorage.getCommits();
    const branches = VersionControlStorage.getBranches();
    const currentBranchId = VersionControlStorage.getCurrentBranch();
    const currentBranch = branches.find((b) => b.id === currentBranchId);

    const parentIds = currentBranch?.headCommitId ? [currentBranch.headCommitId] : [];
    const canvasState = JSON.stringify(this.canvas.toJSON());
    const thumbnail = await this.generateThumbnail();
    const changes = this.calculateChanges(parentIds[0]);

    const commit: VersionControlCommit = {
      id: VersionControlStorage.generateCommitId(),
      parentIds,
      timestamp: Date.now(),
      author: this.currentUser,
      message,
      tags,
      canvasState,
      thumbnail,
      changes,
    };

    commits.push(commit);
    VersionControlStorage.saveCommits(commits);

    if (currentBranch) {
      currentBranch.headCommitId = commit.id;
      VersionControlStorage.saveBranches(branches);
    }

    return commit;
  }

  createBranch(name: string, fromCommitId?: string): Branch {
    const branches = VersionControlStorage.getBranches();
    const currentBranchId = VersionControlStorage.getCurrentBranch();
    const currentBranch = branches.find((b) => b.id === currentBranchId);

    const branch: Branch = {
      id: VersionControlStorage.generateBranchId(),
      name,
      headCommitId: fromCommitId || currentBranch?.headCommitId || "",
      createdAt: Date.now(),
      createdBy: this.currentUser.name,
    };

    branches.push(branch);
    VersionControlStorage.saveBranches(branches);
    return branch;
  }

  switchToBranch(branchId: string): void {
    const branches = VersionControlStorage.getBranches();
    const branch = branches.find((b) => b.id === branchId);

    if (branch) {
      VersionControlStorage.setCurrentBranch(branchId);
      if (branch.headCommitId) {
        this.revertToCommit(branch.headCommitId);
      }
    }
  }

  revertToCommit(commitId: string): void {
    const commits = VersionControlStorage.getCommits();
    const commit = commits.find((c) => c.id === commitId);

    if (commit) {
      this.canvas.loadFromJSON(commit.canvasState, () => {
        this.canvas.renderAll();
      });
    }
  }

  detectMergeConflicts(branchAId: string, branchBId: string): MergeConflict[] {
    const commits = VersionControlStorage.getCommits();
    const branches = VersionControlStorage.getBranches();

    const branchA = branches.find((b) => b.id === branchAId);
    const branchB = branches.find((b) => b.id === branchBId);

    if (!branchA?.headCommitId || !branchB?.headCommitId) return [];

    const commitA = commits.find((c) => c.id === branchA.headCommitId);
    const commitB = commits.find((c) => c.id === branchB.headCommitId);

    if (!commitA || !commitB) return [];

    const stateA = JSON.parse(commitA.canvasState);
    const stateB = JSON.parse(commitB.canvasState);

    return this.compareCanvasStates(stateA, stateB, commitA.id, commitB.id);
  }

  private compareCanvasStates(stateA: any, stateB: any, commitAId: string, commitBId: string): MergeConflict[] {
    const conflicts: MergeConflict[] = [];
    const objectsA = new Map(stateA.objects?.map((obj: any) => [obj.id || obj.uuid, obj]) || []);
    const objectsB = new Map(stateB.objects?.map((obj: any) => [obj.id || obj.uuid, obj]) || []);

    for (const [id, objA] of objectsA) {
      const objB = objectsB.get(id);
      if (objB) {
        const conflictsFound = this.detectObjectConflicts(objA, objB, commitAId, commitBId);
        conflicts.push(...conflictsFound);
      }
    }

    return conflicts;
  }

  private detectObjectConflicts(objA: any, objB: any, commitAId: string, commitBId: string): MergeConflict[] {
    const conflicts: MergeConflict[] = [];
    const id = objA.id || objA.uuid;

    if (objA.left !== objB.left || objA.top !== objB.top) {
      conflicts.push({
        objectId: id,
        objectType: objA.type,
        conflictType: "position",
        branchA: { value: { left: objA.left, top: objA.top }, commitId: commitAId },
        branchB: { value: { left: objB.left, top: objB.top }, commitId: commitBId },
      });
    }

    if (objA.fill !== objB.fill || objA.stroke !== objB.stroke) {
      conflicts.push({
        objectId: id,
        objectType: objA.type,
        conflictType: "style",
        branchA: { value: { fill: objA.fill, stroke: objA.stroke }, commitId: commitAId },
        branchB: { value: { fill: objB.fill, stroke: objB.stroke }, commitId: commitBId },
      });
    }

    if (objA.type === "text" && objA.text !== objB.text) {
      conflicts.push({
        objectId: id,
        objectType: objA.type,
        conflictType: "content",
        branchA: { value: objA.text, commitId: commitAId },
        branchB: { value: objB.text, commitId: commitBId },
      });
    }

    return conflicts;
  }

  async mergeBranches(branchAId: string, branchBId: string, resolutions: ConflictResolution[]): Promise<VersionControlCommit> {
    const branches = VersionControlStorage.getBranches();
    const branchA = branches.find((b) => b.id === branchAId);
    const branchB = branches.find((b) => b.id === branchBId);

    if (!branchA || !branchB) throw new Error("Branch not found");

    const mergedState = await this.applyMergeResolutions(branchA.headCommitId, branchB.headCommitId, resolutions);

    this.canvas.loadFromJSON(mergedState, () => {
      this.canvas.renderAll();
    });

    const mergeCommit = await this.createCommit(`Merge ${branchB.name} into ${branchA.name}`, ["merge"]);
    mergeCommit.parentIds = [branchA.headCommitId, branchB.headCommitId];
    mergeCommit.conflictResolutions = resolutions;

    const commits = VersionControlStorage.getCommits();
    const commitIndex = commits.findIndex((c) => c.id === mergeCommit.id);
    if (commitIndex >= 0) {
      commits[commitIndex] = mergeCommit;
      VersionControlStorage.saveCommits(commits);
    }

    return mergeCommit;
  }

  private async applyMergeResolutions(commitAId: string, commitBId: string, resolutions: ConflictResolution[]): Promise<string> {
    const commits = VersionControlStorage.getCommits();
    const commitA = commits.find((c) => c.id === commitAId);
    const commitB = commits.find((c) => c.id === commitBId);

    if (!commitA || !commitB) throw new Error("Commit not found");

    const stateA = JSON.parse(commitA.canvasState);
    const stateB = JSON.parse(commitB.canvasState);

    const mergedState = { ...stateA };
    const objectsA = new Map(stateA.objects?.map((obj: any) => [obj.id || obj.uuid, obj]) || []);
    const objectsB = new Map(stateB.objects?.map((obj: any) => [obj.id || obj.uuid, obj]) || []);

    for (const resolution of resolutions) {
      const objA = objectsA.get(resolution.objectId);
      const objB = objectsB.get(resolution.objectId);

      if (resolution.resolution === "keep_b" && objB) {
        const index = mergedState.objects.findIndex((obj: any) => (obj.id || obj.uuid) === resolution.objectId);
        if (index >= 0) {
          mergedState.objects[index] = objB;
        }
      }
    }

    return JSON.stringify(mergedState);
  }

  private async generateThumbnail(): Promise<string> {
    return this.canvas.toDataURL({
      format: "png",
      quality: 0.8,
      multiplier: 0.2,
    });
  }

  private calculateChanges(parentCommitId?: string): ChangesSummary {
    const objects = this.canvas.getObjects();
    return {
      added: objects.length,
      modified: 0,
      deleted: 0,
      details: [`${objects.length} objects on canvas`],
    };
  }

  getCommitHistory(): VersionControlCommit[] {
    return VersionControlStorage.getCommits().sort((a, b) => b.timestamp - a.timestamp);
  }

  getBranches(): Branch[] {
    return VersionControlStorage.getBranches();
  }

  getCurrentBranch(): Branch | undefined {
    const branches = this.getBranches();
    const currentBranchId = VersionControlStorage.getCurrentBranch();
    return branches.find((b) => b.id === currentBranchId);
  }
}