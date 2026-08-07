import { useParams, useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { AppProvider } from '@/context/AppContext';
import { TireTable } from '@/components/tire-table/TireTable';
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

      {/* Center - Tire Table */}
      <div className="flex-1 relative min-w-0">
        <TireTable record={record} />
      </div>

      {/* Right Panel - shows record detail */}
      <RightPanel record={record} />
    </div>
  );
}

export default function DetailPage() {
  const { modelId } = useParams<{ modelId: string }>();

  return (
    <AppProvider initialModelId={(modelId || 'b737').toLowerCase()}>
      <DetailContent />
    </AppProvider>
  );
}
