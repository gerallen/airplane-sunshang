import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { DamageChart } from '@/components/ui/DamageChart';
import { getStatusColor, getStatusText } from '@/data/aircraftData';
import type { TireData } from '@/types/aircraft';

interface TireHistoryDialogProps {
  tire: TireData | null;
  onClose: () => void;
}

export function TireHistoryDialog({ tire, onClose }: TireHistoryDialogProps) {
  return (
    <AnimatePresence>
      {tire && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 12, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-xl border overflow-hidden"
            style={{ backgroundColor: '#0E0E10', borderColor: '#2A2A2E' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ borderColor: '#1E1E22' }}>
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: getStatusColor(tire.status), boxShadow: `0 0 8px ${getStatusColor(tire.status)}50` }} />
                <span className="text-lg font-bold" style={{ color: '#FFFFFF' }}>{tire.id}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: `${getStatusColor(tire.status)}15`,
                    color: getStatusColor(tire.status),
                    border: `1px solid ${getStatusColor(tire.status)}25`,
                  }}>
                  {getStatusText(tire.status)}
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ backgroundColor: '#1A1A1E' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2A2A2E')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1A1A1E')}
              >
                <X className="w-4 h-4" style={{ color: '#8A8A93' }} />
              </button>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-5 px-5 py-3 border-b flex-shrink-0" style={{ borderColor: '#1E1E22' }}>
              <span className="text-xs" style={{ color: '#6A6A70' }}>
                历史损伤 <span className="font-semibold" style={{ color: '#FFFFFF' }}>{tire.damageCount ?? 0}</span> 次
              </span>
              <span className="text-xs" style={{ color: '#6A6A70' }}>
                上次检查 <span style={{ color: '#FFFFFF' }}>{tire.lastInspect ?? '暂无'}</span>
              </span>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 min-h-0" style={{ scrollbarWidth: 'thin' }}>
              <DamageChart tire={tire} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
