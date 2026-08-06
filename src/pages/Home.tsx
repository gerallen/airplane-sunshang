import { PlaneView } from '@/components/plane-view/PlaneView';
import { LeftPanel } from '@/components/ui/LeftPanel';
import { RightPanel } from '@/components/ui/RightPanel';
import { AppProvider } from '@/context/AppContext';

function HomeContent() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex"
      style={{ backgroundColor: '#0A0A0C' }}
    >
      {/* Left Panel */}
      <div className="flex-shrink-0" style={{ width: 320, zIndex: 10 }}>
        <LeftPanel />
      </div>

      {/* Center - 2D Plane View */}
      <div className="flex-1 relative">
        <PlaneView />
      </div>

      {/* Right Panel */}
      <RightPanel />

      {/* Bottom hint */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full border pointer-events-none"
        style={{
          backgroundColor: 'rgba(14, 14, 18, 0.9)',
          borderColor: '#1E1E22',
          color: '#5A5A60',
          fontSize: '12px',
          fontFamily: '"Inter", "Noto Sans SC", sans-serif',
          zIndex: 5,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        点击机轮查看详细损伤报告
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <HomeContent />
    </AppProvider>
  );
}
