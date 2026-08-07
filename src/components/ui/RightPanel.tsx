import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Plane, Route, CircleParking } from 'lucide-react';
import { getStatusColor, getStatusText } from '@/data/aircraftData';
import { WoundPanel } from './WoundPanel';
import type { FlightRecord } from '@/types/record';

interface RightPanelProps {
  record?: FlightRecord;
}

export function RightPanel({ record }: RightPanelProps) {
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

            <div className="flex items-center gap-4 mt-3 flex-wrap">
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

            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Route className="w-3.5 h-3.5" style={{ color: '#5A5A60' }} />
                <span className="text-xs font-mono" style={{ color: '#8A8A93' }}>{record.taxiRoute}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CircleParking className="w-3.5 h-3.5" style={{ color: '#5A5A60' }} />
                <span className="text-xs font-mono" style={{ color: '#8A8A93' }}>{record.parkingStand}</span>
              </div>
            </div>
          </div>

          {/* Content: record wounds */}
          <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarWidth: 'thin' }}>
            <WoundPanel record={record} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
