export interface TireWound {
  tireId: string;
  size: string;
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
  modelId: string;
  modelName: string;
  aircraftNo: string;
  wounds: TireWound[];
  status: 'normal' | 'warning' | 'critical';
}
