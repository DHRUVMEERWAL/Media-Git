import dynamic from 'next/dynamic';

const CanvasEditor = dynamic(async () => (await import('@/components/canvas-editor')).default, {
  ssr: false,
});



export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <CanvasEditor />
    </div>
  )
}
