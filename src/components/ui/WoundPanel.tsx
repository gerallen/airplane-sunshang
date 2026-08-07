import { useMemo } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getStatusColor, getStatusText } from '@/data/aircraftData';
import { WOUND_TYPE_MAP, WOUND_POSITION_MAP, SEVERITY_MAP, SEVERITY_STYLE } from '@/data/woundMeta';
import { formatWoundSize, type FlightRecord } from '@/types/record';

interface WoundPanelProps {
  record: FlightRecord;
}

export function WoundPanel({ record }: WoundPanelProps) {
  const { wounds, status, landingRunway, taxiRoute, parkingStand } = record;

  const grouped = useMemo(() => {
    const map: Record<string, typeof wounds> = {};
    for (const w of wounds) {
      (map[w.tireId] ??= []).push(w);
    }
    return map;
  }, [wounds]);

  const maxCount = useMemo(
    () => Math.max(1, ...Object.values(grouped).map(ws => ws.length)),
    [grouped]
  );

  const statusColor = getStatusColor(status);
  const StatusIcon = status === 'critical' ? AlertTriangle : status === 'warning' ? AlertCircle : CheckCircle2;

  // Empty state
  if (wounds.length === 0) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2.5 p-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 210, 255, 0.08)' }}>
          <CheckCircle2 className="w-4 h-4" style={{ color: '#00D2FF' }} />
          <span className="text-sm font-medium" style={{ color: '#00D2FF' }}>状态良好</span>
        </div>
        <div className="p-4 rounded-lg text-center border" style={{ backgroundColor: '#111114', borderColor: '#1E1E22' }}>
          <span className="text-xs" style={{ color: '#5A5A60' }}>暂无损伤记录</span>
        </div>
        <InfoRow label="降落跑道" value={landingRunway} valueColor="#FFD60A" />
        <InfoRow label="滑行路线" value={taxiRoute} />
        <InfoRow label="停机位" value={parkingStand} />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Status header */}
      <div className="flex items-center gap-2.5 p-3 rounded-lg" style={{ backgroundColor: `${statusColor}10` }}>
        <StatusIcon className="w-4 h-4" style={{ color: statusColor }} />
        <span className="text-xs font-medium" style={{ color: statusColor }}>
          {getStatusText(status)} · {wounds.length}处伤口
        </span>
      </div>

      {/* Flight info */}
      <div className="space-y-2.5 p-3.5 rounded-lg border" style={{ backgroundColor: '#111114', borderColor: '#1E1E22' }}>
        <InfoRow label="降落跑道" value={landingRunway} valueColor="#FFD60A" />
        <InfoRow label="滑行路线" value={taxiRoute} />
        <InfoRow label="停机位" value={parkingStand} />
        <InfoRow label="涉及轮胎" value={Object.keys(grouped).join('、')} />
      </div>

      {/* Wounds grouped by tire */}
      <div className="space-y-3">
        {Object.entries(grouped).map(([tireId, ws]) => (
          <div key={tireId} className="rounded-lg border overflow-hidden" style={{ borderColor: '#1E1E22', backgroundColor: '#111114' }}>
            <div className="px-3.5 py-2.5 flex items-center gap-2.5" style={{ backgroundColor: '#0E0E10' }}>
              <span className="text-xs font-bold font-mono" style={{ color: '#00D2FF' }}>{tireId}</span>
              <Badge count={ws.length} />
            </div>
            <div className="divide-y" style={{ borderColor: '#1A1A1E' }}>
              {ws.map((w, i) => {
                const s = SEVERITY_STYLE[w.severity];
                return (
                  <div key={i} className="px-3.5 py-3">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-xs font-medium" style={{ color: '#FFFFFF' }}>{formatWoundSize(w.size)}</span>
                      <Pill label={WOUND_TYPE_MAP[w.type]} />
                      <Pill label={WOUND_POSITION_MAP[w.position]} />
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: s.bg, color: s.color }}>
                        {SEVERITY_MAP[w.severity]}
                      </span>
                    </div>
                    <div className="text-xs leading-relaxed" style={{ color: '#8A8A93' }}>{w.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Distribution bar chart */}
      <div>
        <h4 className="text-xs font-medium mb-3 tracking-wide" style={{ color: '#6A6A70' }}>各轮胎伤口分布</h4>
        <div className="space-y-2.5">
          {Object.entries(grouped).map(([tireId, ws]) => (
            <Bar key={tireId} label={tireId} value={ws.length} max={maxCount} />
          ))}
        </div>
      </div>

      {/* Advice */}
      <Advice status={status} />
    </div>
  );
}

// ===== Sub-components =====

function InfoRow({ label, value, valueColor = '#FFFFFF' }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span style={{ color: '#6A6A70' }}>{label}</span>
      <span style={{ color: valueColor }}>{value}</span>
    </div>
  );
}

function Badge({ count }: { count: number }) {
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,59,48,0.12)', color: '#FF3B30' }}>
      {count}处伤口
    </span>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#8A8A93' }}>
      {label}
    </span>
  );
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs w-14 flex-shrink-0 font-mono" style={{ color: '#6A6A70' }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#1A1A1E' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(value / max) * 100}%`, backgroundColor: '#FF3B30' }} />
      </div>
      <span className="text-xs w-4 text-right font-medium" style={{ color: '#FF3B30' }}>{value}</span>
    </div>
  );
}

function Advice({ status }: { status: FlightRecord['status'] }) {
  const config = {
    critical: { Icon: AlertTriangle, color: '#FF3B30', text: '建议立即更换受损机轮' },
    warning:  { Icon: AlertCircle,  color: '#FFD60A', text: '建议加强监控，安排近期检查' },
    normal:   { Icon: CheckCircle2, color: '#00D2FF', text: '状态良好，按正常周期维护' },
  }[status];
  const { Icon, color, text } = config;
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-lg border" style={{ backgroundColor: '#0E0E10', borderColor: '#1E1E22' }}>
      <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
      <span className="text-xs" style={{ color }}>{text}</span>
    </div>
  );
}
