export interface VersionControlCommit {
  id: string
  parentIds: string[]
  timestamp: number
  author: {
    name: string
    avatar?: string
    initials: string
  }
  message: string
  tags: string[]
  canvasState: string // JSON stringified canvas state
  thumbnail: string // Base64 image data
  changes: ChangesSummary
  conflictResolutions?: ConflictResolution[]
}

export interface ChangesSummary {
  added: number
  modified: number
  deleted: number
  details: string[]
}

export interface Branch {
  id: string
  name: string
  headCommitId: string
  createdAt: number
  createdBy: string
}

export interface ConflictResolution {
  objectId: string
  conflictType: "position" | "style" | "content" | "deleted"
  resolution: "keep_a" | "keep_b" | "manual"
  resolvedBy: string
}

export interface MergeConflict {
  objectId: string
  objectType: string
  conflictType: "position" | "style" | "content" | "deleted"
  branchA: {
    value: any
    commitId: string
  }
  branchB: {
    value: any
    commitId: string
  }
}

export class VersionControlStorage {
  private static COMMITS_KEY = "canvas_vc_commits"
  private static BRANCHES_KEY = "canvas_vc_branches"
  private static CURRENT_BRANCH_KEY = "canvas_vc_current_branch"

  static getCommits(): VersionControlCommit[] {
    const data = localStorage.getItem(this.COMMITS_KEY)
    return data ? JSON.parse(data) : []
  }

  static saveCommits(commits: VersionControlCommit[]): void {
    localStorage.setItem(this.COMMITS_KEY, JSON.stringify(commits))
  }

  static getBranches(): Branch[] {
    const data = localStorage.getItem(this.BRANCHES_KEY)
    return data ? JSON.parse(data) : [this.getDefaultBranch()]
  }

  static saveBranches(branches: Branch[]): void {
    localStorage.setItem(this.BRANCHES_KEY, JSON.stringify(branches))
  }

  static getCurrentBranch(): string {
    return localStorage.getItem(this.CURRENT_BRANCH_KEY) || "main"
  }

  static setCurrentBranch(branchId: string): void {
    localStorage.setItem(this.CURRENT_BRANCH_KEY, branchId)
  }

  static getDefaultBranch(): Branch {
    return {
      id: "main",
      name: "main",
      headCommitId: "",
      createdAt: Date.now(),
      createdBy: "system",
    }
  }

  static generateCommitId(): string {
    return `commit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  static generateBranchId(): string {
    return `branch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
