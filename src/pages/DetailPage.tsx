import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, ClipboardPlus, Plane } from 'lucide-react';
import { useFleet } from '@/context/FleetContext';
import { getModel, getModelName } from '@/data/aircraftData';
import { TireTable } from '@/components/tire-table/TireTable';
import { RightPanel } from '@/components/ui/RightPanel';
import { AddRecordDialog } from '@/components/ui/AddRecordDialog';
import { EventReportDialog } from '@/components/ui/EventReportDialog';

export function DetailPage() {
  const { aircraftId } = useParams<{ aircraftId: string }>();
  const navigate = useNavigate();
  const { getAircraft, addRecord } = useFleet();

  const aircraft = getAircraft(aircraftId || '');
  const [addOpen, setAddOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const latestRecord = aircraft?.records[0];

  if (!aircraft) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: '#0A0A0C' }}>
        <p style={{ color: '#8A8A93' }}>未找到该飞机</p>
        <button onClick={() => navigate('/')}
          className="px-4 py-2 rounded-lg text-sm"
          style={{ backgroundColor: '#1A1A1E', color: '#00D2FF', border: '1px solid #2A2A2E' }}>
          返回列表
        </button>
      </div>
    );
  }

  const model = getModel(aircraft.modelId);
  const tireIds = model.tires.map(t => t.id);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0C' }}>
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: '#1E1E22', backgroundColor: '#0E0E10' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#1A1A1E] border"
            style={{ borderColor: '#2A2A2E' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: '#8A8A93' }} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(0,210,255,0.1)' }}>
              <Plane className="w-5 h-5" style={{ color: '#00D2FF' }} />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-lg font-bold font-mono" style={{ color: '#FFFFFF' }}>{aircraft.aircraftNo}</h1>
                <span className="text-sm font-medium" style={{ color: '#00D2FF' }}>{getModelName(aircraft.modelId)}</span>
              </div>
              <p className="text-xs" style={{ color: '#5A5A60' }}>
                {model.tireCount} 个机轮 · {aircraft.records.length} 条检查记录
              </p>
            </div>
          </div>
        </div>
        <button onClick={() => setAddOpen(true)}
          className="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90"
          style={{ backgroundColor: '#00D2FF', color: '#111114' }}>
          <ClipboardPlus className="w-4 h-4" />
          录入损伤记录
        </button>
      </div>

      {/* Body */}
      <div className="flex" style={{ height: 'calc(100vh - 77px)' }}>
        {/* Left: tire table */}
        <div className="flex-1 min-w-0">
          <TireTable aircraft={aircraft} selectedRecord={latestRecord} onShowReport={() => setReportOpen(true)} />
        </div>

        {/* Right: latest record detail */}
        <RightPanel record={latestRecord} />
      </div>

      <AddRecordDialog
        open={addOpen}
        aircraftNo={aircraft.aircraftNo}
        tireIds={tireIds}
        onClose={() => setAddOpen(false)}
        onAdd={(record) => { addRecord(aircraft.id, record); }}
      />

      <EventReportDialog
        open={reportOpen}
        aircraft={aircraft}
        record={latestRecord}
        onClose={() => setReportOpen(false)}
      />
    </div>
  );
}
