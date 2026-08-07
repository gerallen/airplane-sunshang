export interface TireDamage {
  date: string;
  type: 'cut' | 'puncture' | 'wear' | 'bulge' | 'crack';
  position: 'tread' | 'sidewall' | 'shoulder' | 'bead';
  severity: 'low' | 'medium' | 'high';
  size: string;
  description: string;
  /** 损伤当次航班信息（用于归因分析） */
  departure?: string;
  runway?: string;
  aircraftNo?: string;
}

export interface DamageStats {
  total: number;
  normal: number;
  warning: number;
  critical: number;
  byType: Record<string, number>;
}

export interface TireData {
  id: string;
  label: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  damageCount?: number;
  lastInspect?: string;
  status: 'normal' | 'warning' | 'critical';
  damageHistory?: TireDamage[];
  monthlyStats?: number[];
}

export interface AircraftModel {
  id: string;
  name: string;
  manufacturer: string;
  type: string;
  tireCount: number;
  tires: TireData[];
}

export interface DamageRecord {
  id: string;
  tireId: string;
  modelId: string;
  date: string;
  type: string;
  position: string;
  severity: "轻微" | "中等" | "严重";
  description: string;
  runway: string;
  departure: string;
  recommendation: string;
}

export interface MonthlyStats {
  month: string;
  damageCount: number;
  severity: "轻微" | "中等" | "严重";
}
