import { useMemo, useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { aircraftModels, getStatusColor } from '@/data/aircraftData';

/** Convert 3D tire position to 2D SVG coordinates */
function tireToSvg(cx: number, cy: number, scale: number, pos: [number, number, number]) {
  return { x: cx + (-pos[2]) * scale, y: cy + (-pos[0]) * scale };
}

export function PlaneView() {
  const { selectedModelId, selectedTireId, setSelectedTireId } = useApp();
  const [hoveredTireId, setHoveredTireId] = useState<string | null>(null);

  const model = aircraftModels.find(a => a.id === selectedModelId) || aircraftModels[0];

  const viewW = 800;
  const viewH = 700;
  const cx = viewW / 2;
  const cy = viewH / 2 - 20;

  // 机轮坐标≈实际米数：翼展≈主轮外側z×10.5，机身长≈翼展×(540/510)
  // 飞机图形与轮胎点共用同一坐标尺度，保证轮胎落在机体对应位置
  const { fitScale, planeScale } = useMemo(() => {
    const zs = model.tires.map(t => Math.abs(t.position[2]));
    const xs = model.tires.map(t => t.position[0]);
    const maxZ = Math.max(...zs, 1);
    const spreadX = Math.max(...xs) - Math.min(...xs);
    const spanUnits = Math.max(maxZ * 10.5, 20);                 // 翼展（机轮坐标单位）
    const lenUnits = Math.max(spanUnits * (540 / 510), spreadX * 1.5, 20); // 机身长
    const fit = Math.min(
      (viewW - 180) / spanUnits,
      (viewH - 100) / lenUnits
    );
    return { fitScale: fit, planeScale: (spanUnits * fit) / 510 };
  }, [model]);

  const tireR = Math.max(6, Math.min(10, fitScale * 2));

  const handleSelect = useCallback((id: string) => {
    setSelectedTireId(selectedTireId === id ? null : id);
  }, [selectedTireId, setSelectedTireId]);

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#0A0A0C' }}>
      <svg viewBox={`0 0 ${viewW} ${viewH}`} className="w-full h-full" style={{ maxWidth: '100%', maxHeight: '100%' }}>
        <defs>
          {/* Grid pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#151518" strokeWidth="0.5" />
          </pattern>

          {/* Glow filter for active elements */}
          <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Soft glow for selection */}
          <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2" result="blur" />
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
        <rect width={viewW} height={viewH} fill="url(#grid)" />

        {/* Center crosshair - subtle */}
        <g stroke="#2A2A30" strokeWidth="0.8">
          <line x1={cx - 14} y1={cy} x2={cx + 14} y2={cy} />
          <line x1={cx} y1={cy - 14} x2={cx} y2={cy + 14} />
        </g>

        {/* ========== AIRCRAFT SVG SILHOUETTE ========== */}
        <g transform={`translate(${cx}, ${cy}) scale(${planeScale}) translate(-400, -330)`}>

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

          {/* Symmetry annotation */}
          <text x="400" y="45" textAnchor="middle" fill="#2A2A2E" fontSize="8" fontFamily="'Roboto Mono', monospace" opacity="0.6">SYM</text>
        </g>

        {/* Nose direction label */}
        <text x={cx} y={Math.max(18, cy - 270 * planeScale - 14)} textAnchor="middle" fill="#3A3A3E" fontSize="9" fontFamily="'Roboto Mono', monospace" letterSpacing="2" opacity="0.7">NOSE ↑</text>

        {/* Tire dots */}
        {model.tires.map(tire => (
          <TireDot
            key={tire.id}
            tire={tire}
            pos={tireToSvg(cx, cy, fitScale, tire.position)}
            isSelected={selectedTireId === tire.id}
            isHovered={hoveredTireId === tire.id}
            radius={tireR}
            onSelect={handleSelect}
            onHover={setHoveredTireId}
          />
        ))}

        {/* Legend */}
        <Legend x={viewW - 132} y={14} />
      </svg>
    </div>
  );
}

// ===== TireDot: memoized sub-component =====

import type { TireData } from '@/types/aircraft';

interface TireDotProps {
  tire: TireData;
  pos: { x: number; y: number };
  isSelected: boolean;
  isHovered: boolean;
  radius: number;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

function TireDot({ tire, pos, isSelected, isHovered, radius, onSelect, onHover }: TireDotProps) {
  const color = getStatusColor(tire.status);
  const r = isSelected ? radius + 3 : isHovered ? radius + 2 : radius;

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
          <circle cx={pos.x} cy={pos.y} r={r + 6} fill="none" stroke={color} strokeWidth="1.2" opacity="0.25">
            <animate attributeName="r" values={`${r + 4};${r + 12};${r + 4}`} dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.35;0.1;0.35" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={pos.x} cy={pos.y} r={r + 3} fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" filter="url(#softGlow)" />
        </>
      )}

      {/* Hover ring */}
      {isHovered && !isSelected && (
        <circle cx={pos.x} cy={pos.y} r={r + 5} fill="none" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.2" />
      )}

      {/* Status glow for warning/critical */}
      {(tire.status === 'warning' || tire.status === 'critical') && !isSelected && (
        <circle cx={pos.x} cy={pos.y} r={r + 4} fill="none" stroke={color} strokeWidth="1" opacity="0.15" filter="url(#softGlow)">
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
        strokeWidth={isSelected ? 2.2 : 1.8}
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
        y={pos.y + r + 15}
        textAnchor="middle"
        fill={isSelected ? '#FFFFFF' : isHovered ? '#C8C8D0' : '#6A6A70'}
        fontSize="9"
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
            x={pos.x - 58}
            y={pos.y - r - 52}
            width="116"
            height="38"
            rx="6"
            fill="rgba(14, 14, 18, 0.92)"
            stroke="#2A2A2E"
            strokeWidth="1"
          />
          <text
            x={pos.x}
            y={pos.y - r - 35}
            textAnchor="middle"
            fill={color}
            fontSize="10"
            fontFamily="sans-serif"
            fontWeight="bold"
          >
            {tire.id}
          </text>
          <text
            x={pos.x}
            y={pos.y - r - 21}
            textAnchor="middle"
            fill="#8A8A93"
            fontSize="8.5"
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

function Legend({ x, y }: { x: number; y: number }) {
  const items = [
    { cx: 16, cy: 34, label: '正常', color: '#00D2FF' },
    { cx: 68, cy: 34, label: '预警', color: '#FFD60A' },
    { cx: 16, cy: 58, label: '严重', color: '#FF3B30' },
    { cx: 68, cy: 58, label: '选中', color: '#00D2FF', selected: true },
  ];

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="0" y="0" width="120" height="78" rx="8" fill="rgba(14, 14, 18, 0.9)" stroke="#2A2A2E" strokeWidth="1" />
      <text x="12" y="18" fill="#C8C8D0" fontSize="10" fontFamily="sans-serif" fontWeight="600" letterSpacing="0.5">图例</text>
      {items.map(item => (
        <g key={item.label}>
          <circle cx={item.cx} cy={item.cy} r="5" fill="#141418" stroke={item.color} strokeWidth={item.selected ? 2 : 1.6} />
          {item.selected && (
            <circle cx={item.cx} cy={item.cy} r="9" fill="none" stroke={item.color} strokeWidth="0.8" opacity="0.3">
              <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
          )}
          <text x={item.cx + (item.selected ? 14 : 12)} y={item.cy + 3} fill="#8A8A93" fontSize="9" fontFamily="sans-serif">{item.label}</text>
        </g>
      ))}
    </g>
  );
}
