import { Calendar, MapPin, Plane, Route, CircleParking, Clock, BellRing, BellOff, Megaphone, UserCheck, Flag } from 'lucide-react';
import { getStatusColor, getStatusText } from '@/data/aircraftData';
import { WoundPanel } from './WoundPanel';
import type { FlightRecord } from '@/types';

interface RightPanelProps {
  /** 最新一条检查记录 */
  record?: FlightRecord;
}

function fmtTime(t?: string): string {
  if (!t) return '—';
  return t.replace('T', ' ');
}

function TimeRow({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value?: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[11px]" style={{ color: '#5A5A60' }}>{label}</span>
      </div>
      <span className="text-xs font-mono" style={{ color: highlight ? '#FFD60A' : '#8A8A93' }}>{fmtTime(value)}</span>
    </div>
  );
}

export function RightPanel({ record }: RightPanelProps) {
  return (
    <div
      className="flex-shrink-0 h-full flex flex-col"
      style={{
        width: 380,
        backgroundColor: '#0E0E10',
        borderLeft: '1px solid #1E1E22',
        zIndex: 10,
      }}
    >
      {!record ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-xs text-center" style={{ color: '#5A5A60' }}>
            暂无检查记录<br />点击右上角「录入损伤记录」添加
          </p>
        </div>
      ) : (
        <>
          {/* Latest record header */}
          <div className="p-4 border-b flex-shrink-0" style={{ borderColor: '#1E1E22' }}>
            <div className="text-xs font-medium mb-2.5 tracking-wide" style={{ color: '#5A5A60' }}>最新检查记录</div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-sm font-bold tracking-tight font-mono" style={{ color: '#FFFFFF' }}>{record.id}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: `${getStatusColor(record.status)}15`,
                  color: getStatusColor(record.status),
                  border: `1px solid ${getStatusColor(record.status)}25`,
                }}
              >
                {getStatusText(record.status)}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" style={{ color: '#5A5A60' }} />
                <span className="text-xs" style={{ color: '#5A5A60' }}>{record.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" style={{ color: '#5A5A60' }} />
                <span className="text-xs" style={{ color: '#5A5A60' }}>{record.departure}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5" style={{ color: '#FFD60A' }} />
                <span className="text-xs font-mono" style={{ color: '#FFD60A' }}>{record.landingRunway}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Route className="w-3.5 h-3.5" style={{ color: '#5A5A60' }} />
                <span className="text-xs font-mono" style={{ color: '#8A8A93' }}>{record.taxiRoute}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CircleParking className="w-3.5 h-3.5" style={{ color: '#5A5A60' }} />
                <span className="text-xs font-mono" style={{ color: '#8A8A93' }}>{record.parkingStand}</span>
              </div>
            </div>
          </div>

          {/* Event handling timeline */}
          <div className="p-4 border-b flex-shrink-0" style={{ borderColor: '#1E1E22' }}>
            <div className="text-xs font-medium mb-2 tracking-wide" style={{ color: '#5A5A60' }}>事件处置</div>
            <TimeRow icon={<Clock className="w-3.5 h-3.5" style={{ color: '#5A5A60' }} />} label="上次检查时间" value={record.lastInspectTime} />
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-1.5">
                {record.fodAlarm
                  ? <BellRing className="w-3.5 h-3.5" style={{ color: '#FF3B30' }} />
                  : <BellOff className="w-3.5 h-3.5" style={{ color: '#5A5A60' }} />}
                <span className="text-[11px]" style={{ color: '#5A5A60' }}>FOD 期间报警</span>
              </div>
              <span className="text-xs font-medium" style={{ color: record.fodAlarm ? '#FF3B30' : '#8A8A93' }}>
                {record.fodAlarm === undefined ? '—' : record.fodAlarm ? '有报警' : '无报警'}
              </span>
            </div>
            <TimeRow icon={<Megaphone className="w-3.5 h-3.5" style={{ color: '#5A5A60' }} />} label="事件通报时间" value={record.reportTime} highlight />
            <TimeRow icon={<UserCheck className="w-3.5 h-3.5" style={{ color: '#5A5A60' }} />} label="到达处理时间" value={record.arriveTime} highlight />
            <TimeRow icon={<Flag className="w-3.5 h-3.5" style={{ color: '#5A5A60' }} />} label="处理结束通报时间" value={record.finishTime} highlight />
          </div>

          <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarWidth: 'thin' }}>
            <WoundPanel record={record} />
          </div>
        </>
      )}
    </div>
  );
}
