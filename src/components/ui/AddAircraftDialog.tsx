import { useState } from 'react';
import { X, Plus, Plane } from 'lucide-react';
import { aircraftModels, getModelName } from '@/data/aircraftData';
import type { Aircraft } from '@/types';

interface Props {
  open: boolean;
  existingNos: string[];
  onClose: () => void;
  onAdd: (aircraftNo: string, modelId: string) => Aircraft | null;
}

const inputStyle: React.CSSProperties = {
  backgroundColor: '#1A1A1E',
  borderColor: '#2A2A2E',
  color: '#FFFFFF',
};

export function AddAircraftDialog({ open, existingNos, onClose, onAdd }: Props) {
  const [aircraftNo, setAircraftNo] = useState('');
  const [modelId, setModelId] = useState(aircraftModels[0].id);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const no = aircraftNo.toUpperCase().trim();
    if (!/^B-?\d{3,4}$/.test(no)) {
      setError('机号格式如 B-2445');
      return;
    }
    if (existingNos.includes(no)) {
      setError('该机号已存在');
      return;
    }
    onAdd(no, modelId);
    setAircraftNo('');
    setModelId(aircraftModels[0].id);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="w-[400px] rounded-xl border p-5" style={{ backgroundColor: '#111114', borderColor: '#2A2A2E' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold" style={{ color: '#FFFFFF' }}>新增飞机</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#2A2A2E]">
            <X className="w-4 h-4" style={{ color: '#8A8A93' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#8A8A93' }}>
              飞机编号 <span style={{ color: '#FF3B30' }}>*</span>
            </label>
            <input
              type="text" value={aircraftNo}
              onChange={e => { setAircraftNo(e.target.value); setError(''); }}
              placeholder="如 B-2445" required autoFocus
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none placeholder:text-[#5A5A60] focus:border-[#00D2FF]"
              style={inputStyle} />
            {error && <p className="text-xs mt-1.5" style={{ color: '#FF3B30' }}>{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#8A8A93' }}>
              机型 <span style={{ color: '#FF3B30' }}>*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {aircraftModels.map(m => (
                <button
                  key={m.id} type="button"
                  onClick={() => setModelId(m.id)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all"
                  style={{
                    borderColor: modelId === m.id ? '#00D2FF' : '#2A2A2E',
                    backgroundColor: modelId === m.id ? 'rgba(0,210,255,0.08)' : '#1A1A1E',
                    color: modelId === m.id ? '#00D2FF' : '#8A8A93',
                  }}
                >
                  <Plane className="w-4 h-4" />
                  <span>{m.name}</span>
                  <span className="text-[10px] ml-auto" style={{ color: '#5A5A60' }}>{m.tireCount}轮</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium border hover:opacity-80"
              style={{ backgroundColor: '#1A1A1E', borderColor: '#2A2A2E', color: '#8A8A93' }}>取消</button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-lg text-sm font-medium hover:opacity-80 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#00D2FF', color: '#111114' }}>
              <Plus className="w-4 h-4" />
              确认添加
            </button>
          </div>
        </form>
        <p className="text-[11px] mt-3" style={{ color: '#5A5A60' }}>
          添加后机轮清单将按 {getModelName(modelId)} 的构型自动生成
        </p>
      </div>
    </div>
  );
}
