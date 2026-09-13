import { useState, useCallback } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { departureOptions, runwayOptions } from '@/data/fleetData';
import { WOUND_TYPE_OPTIONS, WOUND_POSITION_OPTIONS } from '@/data/woundMeta';
import { formatWoundSize, type FlightRecord, type TireWound, type WoundSize } from '@/types/record';

interface Props {
  open: boolean;
  aircraftNo: string;
  tireIds: string[];
  onClose: () => void;
  onAdd: (record: Omit<FlightRecord, 'id'>) => void;
}

/** 当前时间，datetime-local 格式（精确到分） */
function nowLocal(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
function todayLocal(): string {
  return nowLocal().slice(0, 10);
}
function nowTime(): string {
  return nowLocal().slice(11, 16);
}

function getStatusByWounds(wounds: TireWound[]): FlightRecord['status'] {
  if (wounds.length === 0) return 'normal';
  if (wounds.length >= 5) return 'critical';
  return 'warning';
}

export function AddRecordDialog({ open, aircraftNo, tireIds, onClose, onAdd }: Props) {
  // --- Base info ---
  const [date, setDate] = useState(todayLocal());
  const [airline, setAirline] = useState('');
  const [flightNo, setFlightNo] = useState('');
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [landingRunway, setLandingRunway] = useState('');
  const [landingTime, setLandingTime] = useState(nowTime());
  const [taxiRoute, setTaxiRoute] = useState('');
  const [parkingStand, setParkingStand] = useState('');

  // --- Event handling info ---
  const [lastInspectTime, setLastInspectTime] = useState(nowLocal());
  const [fodAlarm, setFodAlarm] = useState<boolean | null>(null);
  const [reportTime, setReportTime] = useState(nowLocal());
  const [arriveTime, setArriveTime] = useState(nowLocal());
  const [finishTime, setFinishTime] = useState(nowLocal());
  const [lastRunwayInspectTime, setLastRunwayInspectTime] = useState(nowLocal());
  const [lastTaxiwayInspectTime, setLastTaxiwayInspectTime] = useState(nowLocal());

  // --- Wound list ---
  const [wounds, setWounds] = useState<TireWound[]>([]);

  // --- Current wound draft ---
  const emptyDraft: TireWound = {
    tireId: '', category: '', size: {}, type: 'cut', position: 'tread', attachment: '无附着物', description: '',
  };
  const [draft, setDraft] = useState<TireWound>(emptyDraft);

  const resetAll = useCallback(() => {
    setDate(todayLocal());
    setAirline(''); setFlightNo('');
    setDeparture(''); setArrival(''); setLandingRunway(''); setLandingTime(nowTime());
    setTaxiRoute(''); setParkingStand('');
    setLastInspectTime(nowLocal()); setFodAlarm(null);
    setReportTime(nowLocal()); setArriveTime(nowLocal()); setFinishTime(nowLocal());
    setLastRunwayInspectTime(nowLocal()); setLastTaxiwayInspectTime(nowLocal());
    setWounds([]);
    setDraft(emptyDraft);
  }, []);

  const updateDraft = useCallback((patch: Partial<TireWound>) => {
    setDraft(prev => ({ ...prev, ...patch }));
  }, []);

  const hasSize = (s: WoundSize) => s.length !== undefined || s.width !== undefined || s.depth !== undefined;
  const isOther = draft.tireId === '其他';

  const addWound = useCallback(() => {
    if (!draft.tireId || !hasSize(draft.size)) return;
    if (isOther && !draft.category?.trim()) return;
    setWounds(prev => [...prev, {
      ...draft,
      category: isOther ? draft.category?.trim() : undefined,
      description: draft.description || WOUND_TYPE_OPTIONS.find(o => o.value === draft.type)?.label || '',
    }]);
    setDraft(emptyDraft);
  }, [draft, isOther]);

  const removeWound = useCallback((idx: number) => {
    setWounds(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !departure || !landingRunway) return;

    onAdd({
      date, departure, landingRunway,
      taxiRoute: taxiRoute || '—',
      parkingStand: parkingStand || '—',
      airline: airline || undefined,
      flightNo: flightNo || undefined,
      arrival: arrival || undefined,
      landingTime: landingTime || undefined,
      lastInspectTime: lastInspectTime || undefined,
      fodAlarm: fodAlarm ?? undefined,
      reportTime: reportTime || undefined,
      arriveTime: arriveTime || undefined,
      finishTime: finishTime || undefined,
      lastRunwayInspectTime: lastRunwayInspectTime || undefined,
      lastTaxiwayInspectTime: lastTaxiwayInspectTime || undefined,
      wounds,
      status: getStatusByWounds(wounds),
    });
    resetAll();
    onClose();
  }, [date, departure, landingRunway, taxiRoute, parkingStand, airline, flightNo, arrival, landingTime,
    lastInspectTime, fodAlarm, reportTime, arriveTime, finishTime,
    lastRunwayInspectTime, lastTaxiwayInspectTime, wounds, onAdd, resetAll, onClose]);

  if (!open) return null;

  const canAddWound = Boolean(draft.tireId && hasSize(draft.size) && (!isOther || draft.category?.trim()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="w-[480px] max-h-[92vh] overflow-y-auto rounded-xl border p-5" style={{ backgroundColor: '#111114', borderColor: '#2A2A2E' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold" style={{ color: '#FFFFFF' }}>录入损伤记录</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#2A2A2E]">
            <X className="w-4 h-4" style={{ color: '#8A8A93' }} />
          </button>
        </div>
        <p className="text-xs mb-4" style={{ color: '#5A5A60' }}>
          飞机编号 <span className="font-mono font-semibold" style={{ color: '#00D2FF' }}>{aircraftNo}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date + Airline */}
          <div className="flex gap-3">
            <Field label="日期" required>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[#00D2FF]"
                style={inputStyle} />
            </Field>
            <Field label="航空公司">
              <input type="text" value={airline} onChange={e => setAirline(e.target.value)}
                placeholder="如 顺丰航空"
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none placeholder:text-[#5A5A60] focus:border-[#00D2FF]"
                style={inputStyle} />
            </Field>
          </div>

          {/* Flight no + landing time */}
          <div className="flex gap-3">
            <Field label="航班号">
              <input type="text" value={flightNo} onChange={e => setFlightNo(e.target.value)}
                placeholder="如 O3182"
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none placeholder:text-[#5A5A60] focus:border-[#00D2FF]"
                style={inputStyle} />
            </Field>
            <Field label="落地时间">
              <input type="time" value={landingTime} onChange={e => setLandingTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[#00D2FF]"
                style={inputStyle} />
            </Field>
          </div>

          {/* Departure + Arrival */}
          <div className="flex gap-3">
            <Field label="起飞地" required>
              <select value={departure} onChange={e => setDeparture(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[#00D2FF] appearance-none"
                style={inputStyle}>
                <option value="">请选择</option>
                {departureOptions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="到达机场">
              <select value={arrival} onChange={e => setArrival(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[#00D2FF] appearance-none"
                style={inputStyle}>
                <option value="">请选择</option>
                {departureOptions.filter(d => d !== departure).map(d => <option key={d} value={d}>{d}</option>)}
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

          {/* Taxi route + Parking stand */}
          <div className="flex gap-3">
            <Field label="降落滑行路线">
              <input type="text" value={taxiRoute} onChange={e => setTaxiRoute(e.target.value)}
                placeholder="如 19L-C5-C-D6-D-L6-358"
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none placeholder:text-[#5A5A60] focus:border-[#00D2FF]"
                style={inputStyle} />
            </Field>
            <Field label="停机位">
              <input type="text" value={parkingStand} onChange={e => setParkingStand(e.target.value)}
                placeholder="如 358"
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none placeholder:text-[#5A5A60] focus:border-[#00D2FF]"
                style={inputStyle} />
            </Field>
          </div>

          {/* ── 事件处置信息 ── */}
          <div className="border-t pt-4 space-y-3" style={{ borderColor: '#2A2A2E' }}>
            <div className="text-xs font-medium" style={{ color: '#00D2FF' }}>事件处置信息</div>

            <Field label="上次检查时间">
              <input type="datetime-local" value={lastInspectTime} onChange={e => setLastInspectTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[#00D2FF]"
                style={inputStyle} />
            </Field>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#8A8A93' }}>FOD 期间是否有报警</label>
              <div className="flex gap-2">
                {([['yes', '有报警', true], ['no', '无报警', false]] as const).map(([key, label, val]) => (
                  <button key={key} type="button" onClick={() => setFodAlarm(val)}
                    className="flex-1 py-2 rounded-lg text-xs font-medium border transition-colors"
                    style={{
                      borderColor: fodAlarm === val ? (val ? '#FF3B30' : '#00D2FF') : '#2A2A2E',
                      backgroundColor: fodAlarm === val ? (val ? 'rgba(255,59,48,0.1)' : 'rgba(0,210,255,0.08)') : 'transparent',
                      color: fodAlarm === val ? (val ? '#FF3B30' : '#00D2FF') : '#8A8A93',
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Field label="事件通报时间">
                <input type="datetime-local" value={reportTime} onChange={e => setReportTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[#00D2FF]"
                  style={inputStyle} />
              </Field>
              <Field label="到达处理时间">
                <input type="datetime-local" value={arriveTime} onChange={e => setArriveTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[#00D2FF]"
                  style={inputStyle} />
              </Field>
              <Field label="事件处理结束通报时间">
                <input type="datetime-local" value={finishTime} onChange={e => setFinishTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[#00D2FF]"
                  style={inputStyle} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="上次跑道巡查时间">
                <input type="datetime-local" value={lastRunwayInspectTime} onChange={e => setLastRunwayInspectTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[#00D2FF]"
                  style={inputStyle} />
              </Field>
              <Field label="滑行道检查时间">
                <input type="datetime-local" value={lastTaxiwayInspectTime} onChange={e => setLastTaxiwayInspectTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[#00D2FF]"
                  style={inputStyle} />
              </Field>
            </div>
          </div>

          {/* ── Wounds Section ── */}
          <div className="border-t pt-4" style={{ borderColor: '#2A2A2E' }}>
            <div className="text-xs font-medium mb-3" style={{ color: '#00D2FF' }}>
              伤口信息（可选） · 已添加 {wounds.length} 处伤口
            </div>

            {/* Added wounds list */}
            {wounds.length > 0 && (
              <div className="space-y-1.5 mb-4 max-h-40 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                {wounds.map((w, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: '#1A1A1E' }}>
                    <span className="text-xs font-bold font-mono" style={{ color: '#00D2FF' }}>
                      {w.tireId === '其他' ? `其他·${w.category ?? ''}` : w.tireId}
                    </span>
                    <span className="text-xs" style={{ color: '#C8C8CD' }}>{formatWoundSize(w.size)}</span>
                    <MiniPill label={WOUND_TYPE_OPTIONS.find(o => o.value === w.type)?.label ?? w.type} />
                    {w.tireId !== '其他' && (
                      <MiniPill label={WOUND_POSITION_OPTIONS.find(o => o.value === w.position)?.label ?? w.position} />
                    )}
                    <span className="text-[10px] flex-1 truncate" style={{ color: '#8A8A93' }}>{w.description}</span>
                    <button type="button" onClick={() => removeWound(i)}
                      className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#2A2A2E]">
                      <Trash2 className="w-3 h-3" style={{ color: '#FF3B30' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Draft wound form */}
            <div className="space-y-2.5 p-3 rounded-lg border" style={{ borderColor: '#1E1E22', backgroundColor: '#0E0E10' }}>
              <span className="text-xs" style={{ color: '#8A8A93' }}>添加伤口</span>

              {/* Damage target quick-select */}
              <div className="flex gap-2 flex-wrap">
                {[...tireIds, '其他'].map(id => (
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

              {/* 其他 → category required */}
              {isOther && (
                <input type="text" value={draft.category ?? ''} onChange={e => updateDraft({ category: e.target.value })}
                  placeholder="损伤类目（必填），如 轮毂 / 刹车组件 / 起落架舱门"
                  className="w-full px-2 py-2 rounded border text-xs outline-none placeholder:text-[#5A5A60] focus:border-[#FFD60A]"
                  style={{ ...inputStyle, borderColor: 'rgba(255,214,10,0.4)' }} />
              )}

              {/* Size (mm, 长/宽/深) */}
              <div className="grid grid-cols-3 gap-2">
                {([['length', '长'], ['width', '宽'], ['depth', '深']] as const).map(([dim, label]) => (
                  <div key={dim} className="relative">
                    <input
                      type="number" min={0} value={draft.size[dim] ?? ''}
                      onChange={e => {
                        const v = e.target.value === '' ? undefined : Math.max(0, Number(e.target.value));
                        updateDraft({ size: { ...draft.size, [dim]: v } });
                      }}
                      placeholder={`${label} (mm)`}
                      className="w-full px-2 py-2 rounded border text-xs outline-none placeholder:text-[#5A5A60] focus:border-[#00D2FF]"
                      style={inputStyle} />
                  </div>
                ))}
              </div>

              {/* Type / Position */}
              <div className="grid grid-cols-2 gap-2">
                <Select value={draft.type} onChange={v => updateDraft({ type: v as TireWound['type'] })} options={WOUND_TYPE_OPTIONS} />
                {!isOther && (
                  <Select value={draft.position} onChange={v => updateDraft({ position: v as TireWound['position'] })} options={WOUND_POSITION_OPTIONS} />
                )}
              </div>

              {/* Attachment */}
              <input type="text" value={draft.attachment ?? ''} onChange={e => updateDraft({ attachment: e.target.value })}
                placeholder="伤口附着物，如 无附着物"
                className="w-full px-2 py-2 rounded border text-xs outline-none placeholder:text-[#5A5A60] focus:border-[#00D2FF]"
                style={inputStyle} />

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
