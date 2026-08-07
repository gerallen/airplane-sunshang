import { useMemo } from 'react';
import { WOUND_TYPE_MAP, WOUND_POSITION_MAP, SEVERITY_MAP, SEVERITY_STYLE } from '@/data/woundMeta';
import type { TireData } from '@/types/aircraft';

interface Props {
  tire: TireData;
}

const TYPE_COLORS: Record<string, string> = {
  cut: '#FF3B30', puncture: '#FFD60A', wear: '#00D2FF', bulge: '#FF9500', crack: '#AF52DE',
};

const POSITION_COLORS: Record<string, string> = {
  tread: '#00D2FF', sidewall: '#FFD60A', shoulder: '#FF3B30', bead: '#AF52DE',
};

const MONTH_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export function DamageChart({ tire }: Props) {
  const damageHistory = tire.damageHistory ?? [];
  const monthlyStats = tire.monthlyStats ?? [];

  const typeStats = useMemo(() => {
    const stats: Record<string, number> = {};
    for (const d of damageHistory) stats[d.type] = (stats[d.type] || 0) + 1;
    return stats;
  }, [damageHistory]);

  const positionStats = useMemo(() => {
    const stats: Record<string, number> = {};
    for (const d of damageHistory) stats[d.position] = (stats[d.position] || 0) + 1;
    return stats;
  }, [damageHistory]);

  const maxMonthly = Math.max(...monthlyStats, 1);

  return (
    <div className="space-y-5">
      {/* Monthly Trend */}
      <div>
        <h4 className="text-xs font-medium mb-2.5" style={{ color: '#8A8A93' }}>月度损伤趋势 (过去12个月)</h4>
        <div className="flex items-end gap-1 h-24">
          {monthlyStats.map((count, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-sm transition-all"
                style={{
                  height: `${(count / maxMonthly) * 100}%`,
                  minHeight: count > 0 ? '4px' : '0px',
                  backgroundColor: count > 2 ? '#FF3B30' : count > 0 ? '#FFD60A' : '#2A2A2E',
                  opacity: count > 0 ? 0.9 : 0.3,
                }} />
              <span className="text-[9px]" style={{ color: '#8A8A93' }}>{MONTH_LABELS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Type Distribution */}
      {Object.keys(typeStats).length > 0 && (
        <BarGroup title="损伤类型分布" stats={typeStats} labelMap={WOUND_TYPE_MAP} colorMap={TYPE_COLORS} />
      )}

      {/* Position Distribution */}
      {Object.keys(positionStats).length > 0 && (
        <BarGroup title="损伤位置分布" stats={positionStats} labelMap={WOUND_POSITION_MAP} colorMap={POSITION_COLORS} />
      )}

      {/* History */}
      {damageHistory.length > 0 ? (
        <div>
          <h4 className="text-xs font-medium mb-2.5" style={{ color: '#8A8A93' }}>历史损伤记录</h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
            {damageHistory.map((d, i) => {
              const sev = SEVERITY_STYLE[d.severity];
              return (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg" style={{ backgroundColor: '#1A1A1E' }}>
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: sev.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium" style={{ color: '#FFFFFF' }}>{WOUND_TYPE_MAP[d.type]}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: sev.bg, color: sev.color }}>
                        {SEVERITY_MAP[d.severity]}
                      </span>
                    </div>
                    <div className="text-xs mt-0.5 truncate" style={{ color: '#8A8A93' }}>{d.description}</div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px]" style={{ color: '#6A6A70' }}>{WOUND_POSITION_MAP[d.position]}</span>
                      <span className="text-[10px]" style={{ color: '#6A6A70' }}>{d.date}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#AAAAAF' }}>
                        尺寸 {d.size}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

// ===== Sub-components =====

function BarGroup({ title, stats, labelMap, colorMap }: {
  title: string; stats: Record<string, number>; labelMap: Record<string, string>; colorMap: Record<string, string>;
}) {
  const max = Math.max(1, ...Object.values(stats));
  return (
    <div>
      <h4 className="text-xs font-medium mb-2.5" style={{ color: '#8A8A93' }}>{title}</h4>
      <div className="space-y-2">
        {Object.entries(stats).map(([key, count]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-xs w-10 flex-shrink-0" style={{ color: '#8A8A93' }}>{labelMap[key]}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#1A1A1E' }}>
              <div className="h-full rounded-full" style={{ width: `${(count / max) * 100}%`, backgroundColor: colorMap[key] ?? '#8A8A93' }} />
            </div>
            <span className="text-xs w-6 text-right font-medium" style={{ color: colorMap[key] ?? '#FFFFFF' }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center py-6 rounded-lg" style={{ backgroundColor: '#1A1A1E' }}>
      <span className="text-sm" style={{ color: '#6A6A70' }}>该机轮暂无损伤记录</span>
    </div>
  );
}
