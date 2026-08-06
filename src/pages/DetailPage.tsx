import { useParams, useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { AppProvider } from '@/context/AppContext';
import { PlaneView } from '@/components/plane-view/PlaneView';
import { LeftPanel } from '@/components/ui/LeftPanel';
import { RightPanel } from '@/components/ui/RightPanel';
import type { FlightRecord } from '@/types/record';

function DetailContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Decode record from URL query param
  const record: FlightRecord | undefined = (() => {
    const b64 = searchParams.get('r');
    if (!b64) return undefined;
    try {
      const json = decodeURIComponent(escape(atob(b64)));
      return JSON.parse(json) as FlightRecord;
    } catch {
      return undefined;
    }
  })();

  return (
    <div className="relative w-screen h-screen overflow-hidden flex" style={{ backgroundColor: '#0A0A0C' }}>
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all"
        style={{ backgroundColor: 'rgba(14,14,18,0.9)', borderColor: '#1E1E22', color: '#5A5A60', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#00D2FF';
          e.currentTarget.style.color = '#00D2FF';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = '#1E1E22';
          e.currentTarget.style.color = '#5A5A60';
        }}
      >
        <ArrowLeft className="w-4 h-4" />
        返回列表
      </button>

      {/* Left Panel */}
      <div className="flex-shrink-0" style={{ width: 320, zIndex: 10 }}>
        <LeftPanel />
      </div>

      {/* Center - Plane View */}
      <div className="flex-1 relative">
        <PlaneView />
      </div>

      {/* Right Panel - shows record detail */}
      <RightPanel record={record} />

      {/* Bottom hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full border pointer-events-none"
        style={{ backgroundColor: 'rgba(14,14,18,0.9)', borderColor: '#1E1E22', color: '#5A5A60', fontSize: '12px', zIndex: 5, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        点击机轮查看详细损伤报告
      </div>
    </div>
  );
}

export default function DetailPage() {
  const { modelId } = useParams<{ modelId: string }>();

  return (
    <AppProvider initialModelId={modelId || 'A320'}>
      <DetailContent />
    </AppProvider>
  );
}
