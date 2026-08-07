/** 伤口尺寸（单位 mm，可只填部分维度） */
export interface WoundSize {
  length?: number;  // 长
  width?: number;   // 宽
  depth?: number;   // 深
}

export interface TireWound {
  tireId: string;
  size: WoundSize;
  type: 'cut' | 'puncture' | 'wear' | 'bulge' | 'crack';
  position: 'tread' | 'sidewall' | 'shoulder' | 'bead';
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface FlightRecord {
  id: string;
  date: string;
  departure: string;
  landingRunway: string;
  /** 降落后滑行路线，如 "A5→B3→C2" */
  taxiRoute: string;
  /** 停机位，如 "W123" */
  parkingStand: string;
  modelId: string;
  modelName: string;
  aircraftNo: string;
  wounds: TireWound[];
  status: 'normal' | 'warning' | 'critical';
}

/** 格式化伤口尺寸为可读文本，如 "25×3mm" / "深5mm" / "25×3×5mm" */
export function formatWoundSize(size: WoundSize): string {
  const parts: string[] = [];
  const dims = [size.length, size.width, size.depth].filter((v): v is number => v !== undefined && v !== null);
  if (dims.length === 0) return '—';
  if (size.length !== undefined) parts.push(`${size.length}`);
  if (size.width !== undefined) parts.push(`${size.width}`);
  if (size.depth !== undefined) parts.push(`${size.depth}`);
  return `${parts.join('×')}mm`;
}
