import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Eye, Plane, Search, AlertTriangle, AlertCircle, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react';
import { initialRecords } from '@/data/recordData';
import { getStatusColor, getStatusText } from '@/data/aircraftData';
import { AddRecordDialog } from '@/components/ui/AddRecordDialog';
import type { FlightRecord } from '@/types/record';

type SortKey = 'date' | 'modelName' | 'aircraftNo';
type SortDir = 'asc' | 'desc';

export default function TablePage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<FlightRecord[]>(initialRecords);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let data = records;
    if (q) {
      data = data.filter(r =>
        r.date.includes(q) ||
        r.modelName.toLowerCase().includes(q) ||
        r.aircraftNo.toLowerCase().includes(q)
      );
    }
    data = [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [records, search, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleViewDetail = (record: FlightRecord) => {
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(record))));
    navigate(`/detail/${record.modelId}/${record.id}?r=${b64}`);
  };

  const handleAdd = (record: FlightRecord) => {
    setRecords(prev => [record, ...prev]);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 inline ml-1" />
      : <ChevronDown className="w-3.5 h-3.5 inline ml-1" />;
  };

  return (
    <div className="w-screen h-screen flex flex-col" style={{ backgroundColor: '#0A0A0C' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: '#1E1E22', backgroundColor: '#0E0E10' }}>
        <div className="flex items-center gap-3">
          <Plane className="w-5 h-5" style={{ color: '#00D2FF' }} />
          <h1 className="text-base font-semibold tracking-tight" style={{ color: '#FFFFFF' }}>机轮损伤管理系统</h1>
        </div>
        <button onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{ backgroundColor: '#00D2FF', color: '#0A0A0C' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <Plus className="w-4 h-4" /> 录入
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col px-6 py-4">
        {/* Search bar */}
        <div className="flex items-center gap-3 mb-4 flex-shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#5A5A60' }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="搜索日期 / 机型 / 飞机编号..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm outline-none transition-all"
              style={{ backgroundColor: '#111114', borderColor: '#1E1E22', color: '#FFFFFF' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#00D2FF')}
              onBlur={e => (e.currentTarget.style.borderColor = '#1E1E22')}
            />
          </div>
          <span className="text-xs" style={{ color: '#5A5A60' }}>共 {filtered.length} 条记录</span>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto rounded-xl border" style={{ borderColor: '#1E1E22', backgroundColor: '#0E0E10' }}>
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10" style={{ backgroundColor: '#111114' }}>
              <tr style={{ borderBottom: '1px solid #1E1E22' }}>
                {(['date', 'modelName', 'aircraftNo'] as [SortKey, SortKey, SortKey]).map(key => (
                  <th key={key} onClick={() => handleSort(key)}
                    className="text-left px-4 py-3 font-medium cursor-pointer select-none transition-colors"
                    style={{ color: '#6A6A70' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#00D2FF')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#6A6A70')}
                  >
                    {{ date: '日期', modelName: '机型', aircraftNo: '飞机编号' }[key]}
                    <SortIcon col={key} />
                  </th>
                ))}
                <th className="text-left px-4 py-3 font-medium" style={{ color: '#6A6A70' }}>状态</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: '#6A6A70' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(record => {
                const color = getStatusColor(record.status);
                const Icon = record.status === 'critical' ? AlertTriangle : record.status === 'warning' ? AlertCircle : CheckCircle2;
                return (
                  <tr key={record.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid #1A1A1E' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#111114')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td className="px-4 py-3" style={{ color: '#FFFFFF' }}>{record.date}</td>
                    <td className="px-4 py-3" style={{ color: '#8A8A93' }}>{record.modelName}</td>
                    <td className="px-4 py-3 font-mono" style={{ color: '#00D2FF' }}>{record.aircraftNo}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full"
                        style={{ backgroundColor: `${color}12`, color: color, border: `1px solid ${color}20` }}>
                        <Icon className="w-3 h-3" />{getStatusText(record.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleViewDetail(record)}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all"
                        style={{ borderColor: '#1E1E22', color: '#6A6A70' }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = '#00D2FF';
                          e.currentTarget.style.color = '#00D2FF';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = '#1E1E22';
                          e.currentTarget.style.color = '#6A6A70';
                        }}
                      >
                        <Eye className="w-3.5 h-3.5" /> 查看详情
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex items-center justify-center py-16" style={{ color: '#5A5A60' }}>
              暂无匹配记录
            </div>
          )}
        </div>
      </div>
      <AddRecordDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onAdd={handleAdd} />
    </div>
  );
}
