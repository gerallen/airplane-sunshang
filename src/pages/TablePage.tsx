import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Plane, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { getModelName, daysSince } from '@/data/aircraftData';
import { lastDamageEvent } from '@/data/fleetData';
import { useFleet } from '@/context/FleetContext';
import { AddAircraftDialog } from '@/components/ui/AddAircraftDialog';

type SortKey = 'aircraftNo' | 'model' | 'lastEvent';
type SortDir = 'asc' | 'desc';

export default function TablePage() {
  const navigate = useNavigate();
  const { fleet, addAircraft } = useFleet();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('aircraftNo');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [dialogOpen, setDialogOpen] = useState(false);

  const rows = useMemo(() => {
    return fleet.map(a => {
      const event = lastDamageEvent(a);
      return {
        aircraft: a,
        modelName: getModelName(a.modelId),
        eventDate: event?.date ?? null,
        eventDays: event ? daysSince(event.date) : null,
        eventDeparture: event?.departure ?? null,
        eventRunway: event?.landingRunway ?? null,
        eventStand: event?.parkingStand ?? null,
      };
    });
  }, [fleet]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let data = rows;
    if (q) {
      data = data.filter(r =>
        r.aircraft.aircraftNo.toLowerCase().includes(q) ||
        r.modelName.toLowerCase().includes(q)
      );
    }
    const keyOf = (r: typeof rows[number]): string => {
      switch (sortKey) {
        case 'aircraftNo': return r.aircraft.aircraftNo;
        case 'model': return r.modelName;
        case 'lastEvent': return r.eventDate ?? '';
      }
    };
    return [...data].sort((a, b) => {
      const av = keyOf(a), bv = keyOf(b);
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rows, search, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 inline ml-1" />
      : <ChevronDown className="w-3.5 h-3.5 inline ml-1" />;
  };

  const COL_LABELS: Record<SortKey, string> = {
    aircraftNo: '飞机编号',
    model: '机型',
    lastEvent: '上次事发时间',
  };

  return (
    <div className="w-screen h-screen flex flex-col" style={{ backgroundColor: '#0A0A0C' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: '#1E1E22', backgroundColor: '#0E0E10' }}>
        <div className="flex items-center gap-3">
          <Plane className="w-5 h-5" style={{ color: '#00D2FF' }} />
          <h1 className="text-base font-semibold tracking-tight" style={{ color: '#FFFFFF' }}>航空器损伤管理系统</h1>
        </div>
        <button onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{ backgroundColor: '#00D2FF', color: '#0A0A0C' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <Plus className="w-4 h-4" /> 新增飞机
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col px-6 py-4">
        {/* Search bar */}
        <div className="flex items-center gap-3 mb-4 flex-shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#5A5A60' }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="搜索飞机编号 / 机型..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm outline-none transition-all"
              style={{ backgroundColor: '#111114', borderColor: '#1E1E22', color: '#FFFFFF' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#00D2FF')}
              onBlur={e => (e.currentTarget.style.borderColor = '#1E1E22')}
            />
          </div>
          <span className="text-xs" style={{ color: '#5A5A60' }}>共 {filtered.length} 架飞机</span>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto rounded-xl border" style={{ borderColor: '#1E1E22', backgroundColor: '#0E0E10' }}>
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10" style={{ backgroundColor: '#111114' }}>
              <tr style={{ borderBottom: '1px solid #1E1E22' }}>
                {(['aircraftNo', 'model', 'lastEvent'] as SortKey[]).map(key => (
                  <th key={key} onClick={() => handleSort(key)}
                    className="text-left px-4 py-3 font-medium cursor-pointer select-none transition-colors whitespace-nowrap"
                    style={{ color: '#6A6A70' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#00D2FF')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#6A6A70')}
                  >
                    {COL_LABELS[key]}
                    <SortIcon col={key} />
                  </th>
                ))}
                <th className="text-left px-4 py-3 font-medium whitespace-nowrap" style={{ color: '#6A6A70' }}>上次事发起飞地</th>
                <th className="text-left px-4 py-3 font-medium whitespace-nowrap" style={{ color: '#6A6A70' }}>上次事发降落跑道</th>
                <th className="text-left px-4 py-3 font-medium whitespace-nowrap" style={{ color: '#6A6A70' }}>上次事发停机位</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.aircraft.id}
                  className="transition-colors cursor-pointer"
                  style={{ borderBottom: '1px solid #1A1A1E' }}
                  onClick={() => navigate(`/detail/${r.aircraft.id}`)}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#111114')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td className="px-4 py-3 font-mono font-semibold whitespace-nowrap" style={{ color: '#00D2FF' }}>{r.aircraft.aircraftNo}</td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: '#8A8A93' }}>{r.modelName}</td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: '#8A8A93' }}>
                    {r.eventDate ? (
                      <span>
                        {r.eventDate}
                        <span className="text-xs ml-1.5" style={{ color: r.eventDays !== null && r.eventDays <= 7 ? '#FFD60A' : '#5A5A60' }}>
                          ({r.eventDays === 0 ? '今天' : `${r.eventDays}天前`})
                        </span>
                      </span>
                    ) : <span style={{ color: '#5A5A60' }}>暂无事发记录</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: '#8A8A93' }}>{r.eventDeparture ?? '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {r.eventRunway
                      ? <span className="font-mono" style={{ color: '#FFD60A' }}>{r.eventRunway}</span>
                      : <span style={{ color: '#5A5A60' }}>—</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono" style={{ color: '#8A8A93' }}>{r.eventStand ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex items-center justify-center py-16" style={{ color: '#5A5A60' }}>
              暂无匹配飞机
            </div>
          )}
        </div>
      </div>
      <AddAircraftDialog
        open={dialogOpen}
        existingNos={fleet.map(a => a.aircraftNo)}
        onClose={() => setDialogOpen(false)}
        onAdd={(no, modelId) => addAircraft(no, modelId)}
      />
    </div>
  );
}
