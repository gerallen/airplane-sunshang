export interface TireDamage {
  date: string;
  type: 'cut' | 'puncture' | 'wear' | 'bulge' | 'crack';
  position: 'tread' | 'sidewall' | 'shoulder' | 'bead';
  severity: 'low' | 'medium' | 'high';
  size: string;
  description: string;
}

export interface DamageStats {
  totalDamages: number;
  byType: Record<string, number>;
  byPosition: Record<string, number>;
  bySeverity: Record<string, number>;
  lastInspect: string;
}

export interface TireData {
  id: string;
  label: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  damageCount: number;
  lastInspect: string;
  status: 'normal' | 'warning' | 'critical';
  damageHistory: TireDamage[];
  monthlyStats: number[];
}

export interface AircraftModel {
  id: string;
  name: string;
  manufacturer: string;
  tireCount: number;
  tires: TireData[];
}
