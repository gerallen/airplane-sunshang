import { useMemo, useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { aircraftModels, getStatusColor } from '@/data/aircraftData';

/**
 * 布局说明：
 * 统一坐标系 = 机轮数据单位（约等于实际米数）。
 * 屏幕 x = -position[2]（+z 为左舷），屏幕 y = -position[0]（机头向上）。
 * 机身半长由机轮纵向分布决定：最前机轮（前轮）位于距中心 85% 处，
 * 使前轮贴近机头、最后排机轮贴近机尾；翼展按图形自身宽高比（510:540）跟随。
 * viewBox 直接取内容包围盒 + 留白，任何窗口尺寸下都完整显示。
 */
export function PlaneView() {
  const { selectedModelId, selectedTireId, setSelectedTireId } = useApp();
  const [hoveredTireId, setHoveredTireId] = useState<string | null>(null);

  const model = aircraftModels.find(a => a.id === selectedModelId) || aircraftModels[0];

  const layout = useMemo(() => {
    const xs = model.tires.map(t => t.position[0]);
    const zs = model.tires.map(t => t.position[2]);
    const maxX = Math.max(...xs);
    const minX = Math.min(...xs);
    const maxAbsZ = Math.max(...zs.map(z => Math.abs(z)), 1);
    const midX = (maxX + minX) / 2;

    // 机身半长：最前/最后机轮距分布中心 85% 处
    const halfLen = Math.max((maxX - midX) / 0.85, (midX - minX) / 0.85, 8);
    // 图形半长 270 图形单位 → halfLen 机轮单位；半翼展 255 图形单位同比跟随
    const planeScale = halfLen / 270;
    const halfSpan = 255 * planeScale;

    // 轮廓中心对齐机轮分布中心（z 数据左右对称，x 不一定对称）
    const ccx = 0;
    const ccy = -midX;

    // 内容包围盒 + 留白
    const pad = halfSpan * 0.12 + 1;
    const minCX = Math.min(-maxAbsZ, ccx - halfSpan) - pad;
    const maxCX = Math.max(maxAbsZ, ccx + halfSpan) + pad;
    const minCY = Math.min(-maxX, ccy - halfLen) - pad;
    const maxCY = Math.max(-minX, ccy + halfLen) + pad;
    const w = maxCX - minCX;
    const h = maxCY - minCY;

    // 相对尺寸单位：点、字、描边都按包围盒宽度缩放，保证各机型屏幕观感一致
    const u = w / 100;

    return { ccx, ccy, planeScale, halfLen, minCX, minCY, w, h, u };
  }, [model]);

  const { ccx, ccy, planeScale, halfLen, minCX, minCY, w, h, u } = layout;
  const tireR = u * 1.5;

  const handleSelect = useCallback((id: string) => {
    setSelectedTireId(selectedTireId === id ? null : id);
  }, [selectedTireId, setSelectedTireId]);

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#0A0A0C' }}>
      <svg viewBox={`${minCX} ${minCY} ${w} ${h}`} className="w-full h-full" style={{ maxWidth: '100%', maxHeight: '100%' }}>
        <defs>
          {/* Grid pattern */}
          <pattern id="grid" width={5 * u} height={5 * u} patternUnits="userSpaceOnUse">
            <path d={`M ${5 * u} 0 L 0 0 0 ${5 * u}`} fill="none" stroke="#151518" strokeWidth={0.08 * u} />
          </pattern>

          {/* Glow filter for active elements */}
          <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation={0.5 * u} result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Soft glow for selection */}
          <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation={0.3 * u} result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Gradient for fuselage */}
          <linearGradient id="fuselageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#131316" />
            <stop offset="50%" stopColor="#0E0E10" />
            <stop offset="100%" stopColor="#131316" />
          </linearGradient>

          {/* Gradient for wings */}
          <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0E0E10" />
            <stop offset="50%" stopColor="#111114" />
            <stop offset="100%" stopColor="#0E0E10" />
          </linearGradient>
        </defs>

        {/* Background grid */}
        <rect x={minCX} y={minCY} width={w} height={h} fill="url(#grid)" />

        {/* Center crosshair - subtle */}
        <g stroke="#2A2A30" strokeWidth={0.12 * u}>
          <line x1={ccx - 1.75 * u} y1={ccy} x2={ccx + 1.75 * u} y2={ccy} />
          <line x1={ccx} y1={ccy - 1.75 * u} x2={ccx} y2={ccy + 1.75 * u} />
        </g>

        {/* ========== AIRCRAFT SVG SILHOUETTE ========== */}
        <g transform={`translate(${ccx}, ${ccy}) scale(${planeScale}) translate(-400, -330)`}>

          {/* Fuselage main body */}
          <path
            d="M400,60 C425,70 432,90 435,115 L440,185 L442,285 L442,365 L440,455 C435,495 430,525 425,545 L420,555 L510,570 L505,585 L400,600 L295,585 L290,570 L380,555 L375,545 C370,525 365,495 360,455 L358,365 L358,285 L360,185 L365,115 C368,90 375,70 400,60 Z"
            fill="url(#fuselageGrad)"
            stroke="#3A3A42"
            strokeWidth="1.2"
            opacity="0.92"
          />

          {/* Left wing */}
          <path
            d="M358,365 L155,400 L145,420 L160,440 L358,415 Z"
            fill="url(#wingGrad)"
            stroke="#3A3A42"
            strokeWidth="1"
            opacity="0.88"
          />

          {/* Right wing */}
          <path
            d="M442,365 L645,400 L655,420 L640,440 L442,415 Z"
            fill="url(#wingGrad)"
            stroke="#3A3A42"
            strokeWidth="1"
            opacity="0.88"
          />

          {/* Left engine nacelle */}
          <ellipse cx="218" cy="420" rx="38" ry="16" fill="#0E0E10" stroke="#3A3A42" strokeWidth="0.8" opacity="0.85" />
          <ellipse cx="218" cy="420" rx="28" ry="10" fill="none" stroke="#2E2E35" strokeWidth="0.6" opacity="0.6" />

          {/* Right engine nacelle */}
          <ellipse cx="582" cy="420" rx="38" ry="16" fill="#0E0E10" stroke="#3A3A42" strokeWidth="0.8" opacity="0.85" />
          <ellipse cx="582" cy="420" rx="28" ry="10" fill="none" stroke="#2E2E35" strokeWidth="0.6" opacity="0.6" />

          {/* Horizontal stabilizer - left */}
          <path
            d="M380,555 L290,570 L295,585 L375,575 Z"
            fill="#0E0E10"
            stroke="#3A3A42"
            strokeWidth="0.8"
            opacity="0.8"
          />

          {/* Horizontal stabilizer - right */}
          <path
            d="M420,555 L510,570 L505,585 L425,575 Z"
            fill="#0E0E10"
            stroke="#3A3A42"
            strokeWidth="0.8"
            opacity="0.8"
          />

          {/* Vertical stabilizer (top view) */}
          <path
            d="M394,515 L406,515 L402,595 L398,595 Z"
            fill="#0E0E10"
            stroke="#3A3A42"
            strokeWidth="0.8"
            opacity="0.8"
          />

          {/* ===== Blueprint detail lines ===== */}

          {/* Centerline - fuselage */}
          <line x1="400" y1="60" x2="400" y2="600" stroke="#2A2A30" strokeWidth="0.7" strokeDasharray="5,4" opacity="0.7" />

          {/* Wing centerlines */}
          <line x1="145" y1="420" x2="358" y2="390" stroke="#2A2A30" strokeWidth="0.5" strokeDasharray="4,3" opacity="0.4" />
          <line x1="655" y1="420" x2="442" y2="390" stroke="#2A2A30" strokeWidth="0.5" strokeDasharray="4,3" opacity="0.4" />

          {/* Fuselage station markers */}
          {[150, 220, 290, 360, 430, 500, 570].map((y, i) => (
            <g key={i}>
              <line x1="395" y1={y} x2="405" y2={y} stroke="#2E2E35" strokeWidth="0.5" opacity="0.5" />
            </g>
          ))}

          {/* Wing station markers */}
          {[180, 250, 320].map((x, i) => (
            <g key={`wl-${i}`}>
              <line x1={x} y1="415" x2={x} y2="425" stroke="#2E2E35" strokeWidth="0.4" opacity="0.4" />
            </g>
          ))}
          {[480, 550, 620].map((x, i) => (
            <g key={`wr-${i}`}>
              <line x1={x} y1="415" x2={x} y2="425" stroke="#2E2E35" strokeWidth="0.4" opacity="0.4" />
            </g>
          ))}
        </g>

        {/* Nose direction label */}
        <text x={ccx} y={ccy - halfLen - 0.6 * u} textAnchor="middle" fill="#4A4A52" fontSize={1.7 * u} fontFamily="'Roboto Mono', monospace" letterSpacing={0.3 * u} opacity="0.8">NOSE ↑</text>

        {/* Tire dots */}
        {model.tires.map(tire => (
          <TireDot
            key={tire.id}
            tire={tire}
            pos={{ x: -tire.position[2], y: -tire.position[0] }}
            isSelected={selectedTireId === tire.id}
            isHovered={hoveredTireId === tire.id}
            radius={tireR}
            u={u}
            topBound={minCY}
            onSelect={handleSelect}
            onHover={setHoveredTireId}
          />
        ))}

        {/* Legend */}
        <Legend x={minCX + w - 21 * u} y={minCY + 1.5 * u} u={u} />
      </svg>
    </div>
  );
}

// ===== TireDot =====

import type { TireData } from '@/types/aircraft';

interface TireDotProps {
  tire: TireData;
  pos: { x: number; y: number };
  isSelected: boolean;
  isHovered: boolean;
  radius: number;
  u: number;
  topBound: number;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

function TireDot({ tire, pos, isSelected, isHovered, radius, u, topBound, onSelect, onHover }: TireDotProps) {
  const color = getStatusColor(tire.status);
  const r = isSelected ? radius + 0.45 * u : isHovered ? radius + 0.3 * u : radius;
  // 空间不足时 tooltip 翻转到点的下方，避免被裁切
  const tipY0 = pos.y - r - 7.2 * u < topBound ? pos.y + r + 3 * u : pos.y - r - 7.2 * u;

  return (
    <g
      onClick={() => onSelect(tire.id)}
      onMouseEnter={() => onHover(tire.id)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: 'pointer' }}
    >
      {/* Selection pulse ring - animated */}
      {isSelected && (
        <>
          <circle cx={pos.x} cy={pos.y} r={r + 0.9 * u} fill="none" stroke={color} strokeWidth={0.18 * u} opacity="0.25">
            <animate attributeName="r" values={`${r + 0.6 * u};${r + 1.8 * u};${r + 0.6 * u}`} dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.35;0.1;0.35" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={pos.x} cy={pos.y} r={r + 0.45 * u} fill="none" stroke={color} strokeWidth={0.22 * u} opacity="0.5" filter="url(#softGlow)" />
        </>
      )}

      {/* Hover ring */}
      {isHovered && !isSelected && (
        <circle cx={pos.x} cy={pos.y} r={r + 0.75 * u} fill="none" stroke="#FFFFFF" strokeWidth={0.12 * u} opacity="0.2" />
      )}

      {/* Status glow for warning/critical */}
      {(tire.status === 'warning' || tire.status === 'critical') && !isSelected && (
        <circle cx={pos.x} cy={pos.y} r={r + 0.6 * u} fill="none" stroke={color} strokeWidth={0.15 * u} opacity="0.15" filter="url(#softGlow)">
          <animate attributeName="opacity" values="0.1;0.25;0.1" dur="2.5s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Main dot */}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={r}
        fill={isSelected ? color : '#141418'}
        stroke={isSelected ? '#FFFFFF' : color}
        strokeWidth={isSelected ? 0.32 * u : 0.26 * u}
        filter={isSelected ? 'url(#glow)' : undefined}
      />

      {/* Inner highlight */}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={r * 0.45}
        fill={isSelected ? '#FFFFFF' : color}
        opacity={isSelected ? 0.9 : 0.35}
      />

      {/* Label */}
      <text
        x={pos.x}
        y={pos.y + r + 2.2 * u}
        textAnchor="middle"
        fill={isSelected ? '#FFFFFF' : isHovered ? '#C8C8D0' : '#8A8A92'}
        fontSize={1.5 * u}
        fontFamily="'Roboto Mono', monospace"
        fontWeight={isSelected ? 'bold' : 'normal'}
        style={{ pointerEvents: 'none' }}
      >
        {tire.id}
      </text>

      {/* Hover tooltip */}
      {isHovered && (
        <g style={{ pointerEvents: 'none' }}>
          <rect
            x={pos.x - 8 * u}
            y={tipY0}
            width={16 * u}
            height={5.4 * u}
            rx={0.8 * u}
            fill="rgba(14, 14, 18, 0.92)"
            stroke="#2A2A2E"
            strokeWidth={0.14 * u}
          />
          <text
            x={pos.x}
            y={tipY0 + 2.4 * u}
            textAnchor="middle"
            fill={color}
            fontSize={1.6 * u}
            fontFamily="sans-serif"
            fontWeight="bold"
          >
            {tire.id}
          </text>
          <text
            x={pos.x}
            y={tipY0 + 4.8 * u}
            textAnchor="middle"
            fill="#8A8A93"
            fontSize={1.3 * u}
            fontFamily="sans-serif"
          >
            {(tire.damageCount ?? 0) > 0 ? `${tire.damageCount}处损伤 · ${tire.label}` : `正常 · ${tire.label}`}
          </text>
        </g>
      )}
    </g>
  );
}

// ===== Legend =====

function Legend({ x, y, u }: { x: number; y: number; u: number }) {
  const items = [
    { cx: 2.4, cy: 4.7, label: '正常', color: '#00D2FF' },
    { cx: 10.2, cy: 4.7, label: '预警', color: '#FFD60A' },
    { cx: 2.4, cy: 8.3, label: '严重', color: '#FF3B30' },
    { cx: 10.2, cy: 8.3, label: '选中', color: '#00D2FF', selected: true },
  ];

  return (
    <g transform={`translate(${x}, ${y}) scale(${u})`}>
      <rect x="0" y="0" width="19" height="11" rx="1.2" fill="rgba(14, 14, 18, 0.9)" stroke="#2A2A2E" strokeWidth="0.15" />
      <text x="1.8" y="2.6" fill="#C8C8D0" fontSize="1.6" fontFamily="sans-serif" fontWeight="600" letterSpacing="0.1">图例</text>
      {items.map(item => (
        <g key={item.label}>
          <circle cx={item.cx} cy={item.cy} r="0.8" fill="#141418" stroke={item.color} strokeWidth={item.selected ? 0.3 : 0.24} />
          {item.selected && (
            <circle cx={item.cx} cy={item.cy} r="1.4" fill="none" stroke={item.color} strokeWidth="0.12" opacity="0.3">
              <animate attributeName="r" values="1.3;1.6;1.3" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
          )}
          <text x={item.cx + (item.selected ? 2.1 : 1.8)} y={item.cy + 0.5} fill="#8A8A93" fontSize="1.4" fontFamily="sans-serif">{item.label}</text>
        </g>
      ))}
    </g>
  );
}
