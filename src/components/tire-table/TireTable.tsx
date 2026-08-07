import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { aircraftModels, getStatusColor, getStatusText, daysSince } from '@/data/aircraftData';
import { TireHistoryDialog } from './TireHistoryDialog';
import type { FlightRecord } from '@/types/record';
import type { TireData } from '@/types/aircraft';

interface TireTableProps {
  record?: FlightRecord;
}

/** 迷你趋势图（近12个月损伤频率 sparkline） */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const W = 96, H = 28, bw = W / 12;
  return (
    <svg width={W} height={H} className="block">
      {data.map((v, i) => {
        const h = v > 0 ? Math.max(3, (v / max) * (H - 4)) : 1.5;
        return (
          <rect
            key={i}
            x={i * bw + 1}
            y={H - h}
            width={bw - 2}
            height={h}
            rx={1}
            fill={v > 0 ? color : '#2A2A2E'}
            opacity={v > 0 ? 0.9 : 0.5}
          />
        );
      })}
    </svg>
  );
}

export function TireTable({ record }: TireTableProps) {
  const { selectedModelId } = useApp();
  const model = aircraftModels.find(a => a.id === selectedModelId) || aircraftModels[0];
  const [dialogTire, setDialogTire] = useState<TireData | null>(null);

  // 本次航班各轮胎新增伤口数
  const woundCountByTire = useMemo(() => {
    const map: Record<string, number> = {};
    record?.wounds.forEach(w => { map[w.tireId] = (map[w.tireId] || 0) + 1; });
    return map;
  }, [record]);

  const thCls = 'text-left text-xs font-medium px-4 py-3 whitespace-nowrap';
  const thStyle = { color: '#5A5A60' };

  return (
    <div className="h-full overflow-auto p-6" style={{ scrollbarWidth: 'thin' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header: 机号 + 机型 */}
        <div className="mb-5 flex items-center gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold tracking-tight font-mono" style={{ color: '#FFFFFF' }}>
                {record?.aircraftNo ?? '—'}
              </span>
              {record && (
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
              )}
            </div>
            <div className="text-sm mt-1" style={{ color: '#8A8A93' }}>
              {record?.modelName ?? `${model.manufacturer} ${model.name}`}
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs" style={{ color: '#5A5A60' }}>机轮总数</div>
            <div className="text-lg font-bold" style={{ color: '#00D2FF' }}>{model.tireCount}</div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#0E0E10', borderColor: '#1E1E22' }}>
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ backgroundColor: '#111114', borderBottom: '1px solid #1E1E22' }}>
                <th className={thCls} style={thStyle}>机轮</th>
                <th className={thCls} style={thStyle}>状态</th>
                <th className={thCls} style={thStyle}>上次损伤</th>
                <th className={thCls} style={thStyle}>距今</th>
                <th className={thCls} style={thStyle}>当次航班</th>
                <th className={thCls} style={thStyle}>飞机编号</th>
                <th className={thCls} style={{ ...thStyle, textAlign: 'right' }}>历史次数</th>
                <th className={thCls} style={thStyle}>近12个月趋势</th>
              </tr>
            </thead>
            <tbody>
              {model.tires.map((tire) => {
                const latest = tire.damageHistory?.[0];
                const statusColor = getStatusColor(tire.status);
                const newWounds = woundCountByTire[tire.id] ?? 0;
                const days = latest ? daysSince(latest.date) : null;
                const daysColor = days === null ? '#5A5A60' : days <= 30 ? '#FF3B30' : days <= 90 ? '#FFD60A' : '#00D2FF';

                return (
                  <tr
                    key={tire.id}
                    onClick={() => setDialogTire(tire)}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid #16161A' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#111114')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* 机轮 */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: statusColor, boxShadow: `0 0 6px ${statusColor}40` }} />
                        <span className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                          {tire.id}
                          {newWounds > 0 && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded font-medium"
                              style={{ backgroundColor: 'rgba(255,59,48,0.12)', color: '#FF3B30', border: '1px solid rgba(255,59,48,0.25)' }}>
                              本次+{newWounds}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    {/* 状态 */}
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                        style={{ backgroundColor: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}25` }}>
                        {getStatusText(tire.status)}
                      </span>
                    </td>
                    {/* 上次损伤 */}
                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: latest ? '#FFFFFF' : '#5A5A60' }}>
                      {latest ? latest.date : '无记录'}
                    </td>
                    {/* 距今 */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {days !== null && (
                        <span className="text-sm font-semibold" style={{ color: daysColor }}>
                          {days === 0 ? '今天' : `${days} 天`}
                        </span>
                      )}
                    </td>
                    {/* 当次航班 */}
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: '#8A8A93' }}>
                      {latest?.departure ? (
                        <span>
                          {latest.departure}
                          <span style={{ color: '#5A5A60' }}> → </span>
                          <span className="font-mono" style={{ color: '#FFD60A' }}>{latest.runway}</span>
                        </span>
                      ) : '—'}
                    </td>
                    {/* 飞机编号 */}
                    <td className="px-4 py-3 text-sm font-mono whitespace-nowrap" style={{ color: '#8A8A93' }}>
                      {latest?.aircraftNo ?? '—'}
                    </td>
                    {/* 历史次数 */}
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold"
                        style={{ color: (tire.damageCount ?? 0) >= 5 ? '#FF3B30' : (tire.damageCount ?? 0) > 0 ? '#FFD60A' : '#5A5A60' }}>
                        {tire.damageCount ?? 0}
                      </span>
                    </td>
                    {/* 趋势 */}
                    <td className="px-4 py-3">
                      <Sparkline data={tire.monthlyStats ?? []} color={statusColor} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer hint */}
        <p className="text-xs mt-3" style={{ color: '#5A5A60' }}>
          「当次航班」为该轮胎最近一次损伤所对应的航班（起飞地 → 降落跑道）；标红「本次+N」表示当前选中航班新发现的伤口；点击任意行查看该机轮完整损伤履历。
        </p>
      </div>

      {/* Tire history dialog */}
      <TireHistoryDialog tire={dialogTire} onClose={() => setDialogTire(null)} />
    </div>
  );
}
