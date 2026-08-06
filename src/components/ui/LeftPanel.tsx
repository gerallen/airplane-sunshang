import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane,
  ChevronDown,
  RotateCcw,
  CircleDot,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { aircraftModels, getStatusColor, getStatusText } from '@/data/aircraftData';

export function LeftPanel() {
  const {
    selectedModelId,
    selectedTireId,
    setSelectedModelId,
    setSelectedTireId,
    resetView,
  } = useApp();

  const [isModelOpen, setIsModelOpen] = useState(false);

  const model = aircraftModels.find(a => a.id === selectedModelId) || aircraftModels[0];
  const totalDamages = model.tires.reduce((sum, t) => sum + t.damageCount, 0);
  const criticalCount = model.tires.filter(t => t.status === 'critical').length;
  const warningCount = model.tires.filter(t => t.status === 'warning').length;

  return (
    <div
      className="h-full flex flex-col gap-3 p-4 overflow-hidden"
      style={{
        backgroundColor: '#0E0E10',
        borderRight: '1px solid #1E1E22',
      }}
    >
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <Plane className="w-5 h-5 flex-shrink-0" style={{ color: '#00D2FF' }} />
          <h1
            className="text-base font-semibold tracking-tight"
            style={{ color: '#FFFFFF', fontFamily: '"Inter", "Noto Sans SC", sans-serif' }}
          >
            机轮损伤可视化
          </h1>
        </div>
        <p className="text-xs" style={{ color: '#5A5A60' }}>
          点击机轮查看详细损伤报告
        </p>
      </div>

      {/* Model Selector */}
      <div className="flex-shrink-0">
        <label className="text-xs font-medium mb-1.5 block tracking-wide" style={{ color: '#5A5A60' }}>
          选择机型
        </label>
        <button
          onClick={() => setIsModelOpen(!isModelOpen)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all"
          style={{
            backgroundColor: '#111114',
            borderColor: '#1E1E22',
            color: '#FFFFFF',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#2A2A2E')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E1E22')}
        >
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 flex-shrink-0" style={{ color: '#00D2FF' }} />
            <span className="text-sm font-medium">{model.manufacturer} {model.name}</span>
          </div>
          <ChevronDown
            className="w-4 h-4 transition-transform flex-shrink-0"
            style={{
              color: '#5A5A60',
              transform: isModelOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </button>

        <AnimatePresence>
          {isModelOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-1.5 space-y-0.5">
                {aircraftModels.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedModelId(m.id);
                      setIsModelOpen(false);
                      resetView();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all"
                    style={{
                      backgroundColor: m.id === selectedModelId ? 'rgba(0, 210, 255, 0.08)' : 'transparent',
                      color: m.id === selectedModelId ? '#00D2FF' : '#FFFFFF',
                    }}
                    onMouseEnter={e => {
                      if (m.id !== selectedModelId) {
                        e.currentTarget.style.backgroundColor = '#111114';
                      }
                    }}
                    onMouseLeave={e => {
                      if (m.id !== selectedModelId) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <Plane className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium">{m.manufacturer} {m.name}</div>
                      <div className="text-xs" style={{ color: '#5A5A60' }}>
                        {m.tireCount}个机轮
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Overview Stats */}
      <div className="flex-shrink-0 rounded-xl p-3.5 border" style={{ backgroundColor: '#111114', borderColor: '#1E1E22' }}>
        <label className="text-xs font-medium mb-2.5 block tracking-wide" style={{ color: '#5A5A60' }}>
          损伤概览
        </label>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2.5 rounded-lg" style={{ backgroundColor: '#0E0E10' }}>
            <div className="text-lg font-bold" style={{ color: '#FFFFFF' }}>{model.tireCount}</div>
            <div className="text-xs mt-0.5" style={{ color: '#5A5A60' }}>机轮总数</div>
          </div>
          <div className="text-center p-2.5 rounded-lg" style={{ backgroundColor: '#0E0E10' }}>
            <div className="text-lg font-bold" style={{ color: totalDamages > 0 ? '#FFD60A' : '#00D2FF' }}>
              {totalDamages}
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#5A5A60' }}>损伤记录</div>
          </div>
          <div className="text-center p-2.5 rounded-lg" style={{ backgroundColor: '#0E0E10' }}>
            <div className="text-lg font-bold" style={{ color: criticalCount > 0 ? '#FF3B30' : '#00D2FF' }}>
              {criticalCount}
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#5A5A60' }}>严重告警</div>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#00D2FF' }} />
              <span style={{ color: '#5A5A60' }}>正常</span>
            </div>
            <span className="font-medium" style={{ color: '#00D2FF' }}>
              {model.tires.filter(t => t.status === 'normal').length} 个
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#FFD60A' }} />
              <span style={{ color: '#5A5A60' }}>预警</span>
            </div>
            <span className="font-medium" style={{ color: '#FFD60A' }}>
              {warningCount} 个
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <CircleDot className="w-3.5 h-3.5" style={{ color: '#FF3B30' }} />
              <span style={{ color: '#5A5A60' }}>严重</span>
            </div>
            <span className="font-medium" style={{ color: '#FF3B30' }}>
              {criticalCount} 个
            </span>
          </div>
        </div>
      </div>

      {/* Tire List */}
      <div className="flex-1 flex flex-col min-h-0">
        <label className="text-xs font-medium mb-2 block tracking-wide" style={{ color: '#5A5A60' }}>
          机轮列表
        </label>
        <div className="space-y-1 overflow-y-auto pr-1 flex-1" style={{ scrollbarWidth: 'thin' }}>
          {model.tires.map((tire) => {
            const statusColor = getStatusColor(tire.status);
            const isSelected = selectedTireId === tire.id;
            return (
              <button
                key={tire.id}
                onClick={() => {
                  if (isSelected) {
                    resetView();
                  } else {
                    setSelectedTireId(tire.id);
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all"
                style={{
                  backgroundColor: isSelected ? 'rgba(0, 210, 255, 0.08)' : '#111114',
                  border: isSelected ? '1px solid rgba(0, 210, 255, 0.25)' : '1px solid transparent',
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#1A1A1E';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#111114';
                  }
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: statusColor, boxShadow: `0 0 6px ${statusColor}35` }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: isSelected ? '#00D2FF' : '#FFFFFF' }}>
                    {tire.id}
                  </div>
                  <div className="text-xs truncate" style={{ color: '#5A5A60' }}>
                    {tire.label}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-medium" style={{ color: statusColor }}>
                    {getStatusText(tire.status)}
                  </div>
                  <div className="text-xs" style={{ color: '#5A5A60' }}>
                    {tire.damageCount}处损伤
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset button */}
      <div className="flex-shrink-0">
        <button
          onClick={resetView}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all"
          style={{ backgroundColor: '#111114', color: '#FFFFFF', border: '1px solid #1E1E22' }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#2A2A2E';
            e.currentTarget.style.backgroundColor = '#1A1A1E';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#1E1E22';
            e.currentTarget.style.backgroundColor = '#111114';
          }}
        >
          <RotateCcw className="w-4 h-4" />
          重置选择
        </button>
      </div>
    </div>
  );
}
