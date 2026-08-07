import { useState, useCallback } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { aircraftModels } from '@/data/aircraftData';
import { departureOptions, runwayOptions } from '@/data/recordData';
import { WOUND_TYPE_OPTIONS, WOUND_POSITION_OPTIONS, SEVERITY_OPTIONS, SEVERITY_STYLE } from '@/data/woundMeta';
import type { FlightRecord, TireWound } from '@/types/record';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (record: FlightRecord) => void;
}

const DEFAULT_STATUS: Record<number, FlightRecord['status']> = {
  0: 'normal',
  1: 'warning',
  2: 'warning',
  3: 'warning',
  4: 'warning',
  5: 'warning',
};

function getStatusByCount(n: number): FlightRecord['status'] {
  return DEFAULT_STATUS[n] ?? (n >= 6 ? 'critical' : 'warning');
}

export function AddRecordDialog({ open, onClose, onAdd }: Props) {
  // --- Base info ---
  const [date, setDate] = useState('');
  const [departure, setDeparture] = useState('');
  const [landingRunway, setLandingRunway] = useState('');
  const [modelId, setModelId] = useState('a320');
  const [aircraftNo, setAircraftNo] = useState('');

  // --- Wound list ---
  const [wounds, setWounds] = useState<TireWound[]>([]);

  // --- Current wound draft ---
  const [draft, setDraft] = useState<TireWound>({
    tireId: '', size: '', type: 'cut', position: 'tread', severity: 'low', description: '',
  });

  const model = aircraftModels.find(m => m.id === modelId);
  const tireIds = model?.tires.map(t => t.id) ?? [];

  const resetAll = useCallback(() => {
    setDate(''); setDeparture(''); setLandingRunway('');
    setModelId('a320'); setAircraftNo(''); setWounds([]);
    setDraft({ tireId: '', size: '', type: 'cut', position: 'tread', severity: 'low', description: '' });
  }, []);

  const updateDraft = useCallback((patch: Partial<TireWound>) => {
    setDraft(prev => ({ ...prev, ...patch }));
  }, []);

  const addWound = useCallback(() => {
    if (!draft.tireId || !draft.size) return;
    setWounds(prev => [...prev, {
      ...draft,
      description: draft.description || WOUND_TYPE_OPTIONS.find(o => o.value === draft.type)?.label || '',
    }]);
    setDraft({ tireId: '', size: '', type: 'cut', position: 'tread', severity: 'low', description: '' });
  }, [draft]);

  const removeWound = useCallback((idx: number) => {
    setWounds(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !departure || !aircraftNo || !landingRunway) return;

    onAdd({
      id: `F${String(Date.now()).slice(-6)}`,
      date, departure, landingRunway, modelId,
      modelName: model ? `${model.manufacturer} ${model.name}` : modelId,
      aircraftNo: aircraftNo.toUpperCase(),
      wounds,
      status: getStatusByCount(wounds.length),
    });
    resetAll();
    onClose();
  }, [date, departure, landingRunway, modelId, aircraftNo, model, wounds, onAdd, resetAll, onClose]);

  if (!open) return null;

  const canAddWound = Boolean(draft.tireId && draft.size);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="w-[480px] max-h-[92vh] overflow-y-auto rounded-xl border p-5" style={{ backgroundColor: '#111114', borderColor: '#2A2A2E' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold" style={{ color: '#FFFFFF' }}>录入新记录</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#2A2A2E]">
            <X className="w-4 h-4" style={{ color: '#8A8A93' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date + Departure */}
          <div className="flex gap-3">
            <Field label="日期" required>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[#00D2FF]"
                style={inputStyle} />
            </Field>
            <Field label="起飞地" required>
              <select value={departure} onChange={e => setDeparture(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[#00D2FF] appearance-none"
                style={inputStyle}>
                <option value="">请选择</option>
                {departureOptions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
          </div>

          {/* Runway */}
          <Field label="降落跑道" required>
            <select value={landingRunway} onChange={e => setLandingRunway(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[#00D2FF] appearance-none"
              style={inputStyle}>
              <option value="">请选择</option>
              {runwayOptions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>

          {/* Model + Aircraft No */}
          <div className="flex gap-3">
            <Field label="机型" required>
              <select value={modelId}
                onChange={e => { setModelId(e.target.value); updateDraft({ tireId: '' }); }}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[#00D2FF] appearance-none"
                style={inputStyle}>
                {aircraftModels.map(m => <option key={m.id} value={m.id}>{m.manufacturer} {m.name}</option>)}
              </select>
            </Field>
            <Field label="飞机编号" required>
              <input type="text" value={aircraftNo} onChange={e => setAircraftNo(e.target.value)}
                placeholder="如 B-2378" required
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none placeholder:text-[#5A5A60] focus:border-[#00D2FF]"
                style={inputStyle} />
            </Field>
          </div>

          {/* ── Wounds Section ── */}
          <div className="border-t pt-4" style={{ borderColor: '#2A2A2E' }}>
            <div className="text-xs font-medium mb-3" style={{ color: '#00D2FF' }}>
              伤口信息（可选） · 已添加 {wounds.length} 处伤口
            </div>

            {/* Added wounds list */}
            {wounds.length > 0 && (
              <div className="space-y-1.5 mb-4 max-h-40 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                {wounds.map((w, i) => {
                  const sev = SEVERITY_STYLE[w.severity];
                  return (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: '#1A1A1E' }}>
                      <span className="text-xs font-bold font-mono" style={{ color: '#00D2FF' }}>{w.tireId}</span>
                      <span className="text-xs" style={{ color: '#C8C8CD' }}>{w.size}</span>
                      <MiniPill label={WOUND_TYPE_OPTIONS.find(o => o.value === w.type)?.label ?? w.type} />
                      <MiniPill label={WOUND_POSITION_OPTIONS.find(o => o.value === w.position)?.label ?? w.position} />
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: sev.bg, color: sev.color }}>
                        {SEVERITY_OPTIONS.find(o => o.value === w.severity)?.label ?? w.severity}
                      </span>
                      <span className="text-[10px] flex-1 truncate" style={{ color: '#8A8A93' }}>{w.description}</span>
                      <button type="button" onClick={() => removeWound(i)}
                        className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#2A2A2E]">
                        <Trash2 className="w-3 h-3" style={{ color: '#FF3B30' }} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Draft wound form */}
            <div className="space-y-2.5 p-3 rounded-lg border" style={{ borderColor: '#1E1E22', backgroundColor: '#0E0E10' }}>
              <span className="text-xs" style={{ color: '#8A8A93' }}>添加伤口</span>

              {/* Tire quick-select */}
              <div className="flex gap-2 flex-wrap">
                {tireIds.map(id => (
                  <button key={id} type="button" onClick={() => updateDraft({ tireId: id })}
                    className="text-[11px] px-2.5 py-1 rounded border transition-colors"
                    style={{
                      borderColor: draft.tireId === id ? '#00D2FF' : '#2A2A2E',
                      backgroundColor: draft.tireId === id ? 'rgba(0,210,255,0.1)' : 'transparent',
                      color: draft.tireId === id ? '#00D2FF' : '#8A8A93',
                    }}>
                    {id}
                  </button>
                ))}
              </div>

              {/* Size / Type / Position / Severity */}
              <div className="grid grid-cols-4 gap-2">
                <input type="text" value={draft.size} onChange={e => updateDraft({ size: e.target.value })}
                  placeholder="尺寸" className="w-full px-2 py-2 rounded border text-xs outline-none placeholder:text-[#5A5A60] focus:border-[#00D2FF]"
                  style={inputStyle} />
                <Select value={draft.type} onChange={v => updateDraft({ type: v as TireWound['type'] })} options={WOUND_TYPE_OPTIONS} />
                <Select value={draft.position} onChange={v => updateDraft({ position: v as TireWound['position'] })} options={WOUND_POSITION_OPTIONS} />
                <Select value={draft.severity} onChange={v => updateDraft({ severity: v as TireWound['severity'] })} options={SEVERITY_OPTIONS} />
              </div>

              <input type="text" value={draft.description} onChange={e => updateDraft({ description: e.target.value })}
                placeholder="描述（可选）" className="w-full px-2 py-2 rounded border text-xs outline-none placeholder:text-[#5A5A60] focus:border-[#00D2FF]"
                style={inputStyle} />

              <button type="button" onClick={addWound} disabled={!canAddWound}
                className="w-full py-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  borderColor: canAddWound ? '#00D2FF' : '#2A2A2E',
                  color: canAddWound ? '#00D2FF' : '#6A6A70',
                  backgroundColor: canAddWound ? 'rgba(0,210,255,0.05)' : 'transparent',
                }}>
                <Plus className="w-3.5 h-3.5" />
                添加此伤口
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium border hover:opacity-80"
              style={{ backgroundColor: '#1A1A1E', borderColor: '#2A2A2E', color: '#8A8A93' }}>取消</button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-lg text-sm font-medium hover:opacity-80 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#00D2FF', color: '#111114' }}>
              <Plus className="w-4 h-4" />
              确认录入
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== Shared style & sub-components =====

const inputStyle: React.CSSProperties = {
  backgroundColor: '#1A1A1E',
  borderColor: '#2A2A2E',
  color: '#FFFFFF',
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex-1">
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#8A8A93' }}>
        {label} {required && <span style={{ color: '#FF3B30' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-2 py-2 rounded border text-xs outline-none focus:border-[#00D2FF] appearance-none"
      style={inputStyle}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function MiniPill({ label }: { label: string }) {
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#AAAAAF' }}>
      {label}
    </span>
  );
}
