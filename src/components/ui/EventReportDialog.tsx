import { useMemo, useState } from 'react';
import { X, Copy, Check, Megaphone } from 'lucide-react';
import type { Aircraft, FlightRecord } from '@/types';
import { generateEventReport } from '@/utils/eventReport';

interface Props {
  open: boolean;
  aircraft: Aircraft;
  record?: FlightRecord;
  onClose: () => void;
}

export function EventReportDialog({ open, aircraft, record, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const text = useMemo(
    () => (record ? generateEventReport(aircraft, record) : ''),
    [aircraft, record]
  );

  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard API 不可用时退化为选中文本
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
      <div className="w-[560px] max-h-[88vh] flex flex-col rounded-xl border" style={{ backgroundColor: '#111114', borderColor: '#2A2A2E' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ borderColor: '#2A2A2E' }}>
          <div className="flex items-center gap-2.5">
            <Megaphone className="w-4 h-4" style={{ color: '#FFD60A' }} />
            <h2 className="text-base font-semibold" style={{ color: '#FFFFFF' }}>事件通报</h2>
            {record && (
              <span className="text-xs font-mono" style={{ color: '#5A5A60' }}>{record.id}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all"
              style={{
                borderColor: copied ? 'rgba(0,210,255,0.4)' : '#2A2A2E',
                color: copied ? '#00D2FF' : '#8A8A93',
                backgroundColor: copied ? 'rgba(0,210,255,0.08)' : 'transparent',
              }}>
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '已复制' : '复制全文'}
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#2A2A2E]">
              <X className="w-4 h-4" style={{ color: '#8A8A93' }} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: 'thin' }}>
          {record ? (
            <pre className="whitespace-pre-wrap text-sm leading-7" style={{ color: '#C8C8CD', fontFamily: 'inherit' }}>
              {text}
            </pre>
          ) : (
            <p className="text-sm text-center py-10" style={{ color: '#5A5A60' }}>暂无可生成通报的检查记录</p>
          )}
        </div>
      </div>
    </div>
  );
}
