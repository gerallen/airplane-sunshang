import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Plane } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { aircraftModels, getStatusColor, getStatusText } from '@/data/aircraftData';
import { DamageChart } from './DamageChart';
import { WoundPanel } from './WoundPanel';
import type { FlightRecord } from '@/types/record';

interface RightPanelProps {
  record?: FlightRecord;
}

export function RightPanel({ record }: RightPanelProps) {
  const { selectedModelId, selectedTireId, setSelectedTireId } = useApp();

  const model = aircraftModels.find(a => a.id === selectedModelId) || aircraftModels[0];
  const tire = selectedTireId ? model.tires.find(t => t.id === selectedTireId) : null;

  const handleClose = () => {
    setSelectedTireId(null);
  };

  return (
    <AnimatePresence>
      {record && (
        <motion.div
          initial={{ x: 380, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 380, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="flex-shrink-0 h-full flex flex-col"
          style={{
            width: 380,
            backgroundColor: '#0E0E10',
            borderLeft: '1px solid #1E1E22',
            zIndex: 10,
          }}
        >
          {/* Record Header */}
          <div className="p-4 border-b flex-shrink-0" style={{ borderColor: '#1E1E22' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <span className="text-lg font-bold tracking-tight" style={{ color: '#FFFFFF' }}>{record.aircraftNo}</span>
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
            </div>

            <div className="text-sm" style={{ color: '#6A6A70' }}>{record.modelName}</div>

            <div className="flex items-center gap-4 mt-3">
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
          </div>

          {/* Content: show record wounds by default, or tire detail when a tire is clicked */}
          <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarWidth: 'thin' }}>
            {tire ? (
              /* Tire detail view */
              <>
                <div className="p-4 border-b" style={{ borderColor: '#1E1E22' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold" style={{ color: '#FFFFFF' }}>{tire.id}</span>
                      <span className="text-sm ml-2" style={{ color: '#6A6A70' }}>{tire.label}</span>
                    </div>
                    <button
                      onClick={handleClose}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ backgroundColor: '#1A1A1E' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2A2A2E')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1A1A1E')}
                    >
                      <X className="w-4 h-4" style={{ color: '#8A8A93' }} />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-2.5">
                    <span className="text-xs" style={{ color: '#6A6A70' }}>历史损伤 <span style={{ color: '#FFFFFF' }}>{tire.damageCount ?? 0}</span></span>
                    <span className="text-xs" style={{ color: '#6A6A70' }}>上次检查 <span style={{ color: '#FFFFFF' }}>{tire.lastInspect ?? '暂无'}</span></span>
                  </div>
                </div>
                <div className="p-4">
                  <DamageChart tire={tire} />
                </div>
              </>
            ) : (
              /* Record wound view */
              <WoundPanel record={record} />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
