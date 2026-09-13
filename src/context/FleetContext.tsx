import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Aircraft, FlightRecord } from '@/types';
import { initialFleet } from '@/data/fleetData';

interface FleetState {
  fleet: Aircraft[];
  getAircraft: (id: string) => Aircraft | undefined;
  addAircraft: (aircraftNo: string, modelId: string) => Aircraft | null;
  addRecord: (aircraftId: string, record: Omit<FlightRecord, 'id'>) => FlightRecord | null;
}

const FleetContext = createContext<FleetState | null>(null);

export function FleetProvider({ children }: { children: ReactNode }) {
  const [fleet, setFleet] = useState<Aircraft[]>(initialFleet);

  const getAircraft = (id: string) => fleet.find(a => a.id === id);

  const addAircraft = (aircraftNo: string, modelId: string): Aircraft | null => {
    const no = aircraftNo.toUpperCase().trim();
    if (!no || fleet.some(a => a.aircraftNo === no)) return null;
    const aircraft: Aircraft = { id: no, aircraftNo: no, modelId, records: [] };
    setFleet(prev => [aircraft, ...prev]);
    return aircraft;
  };

  const addRecord = (aircraftId: string, record: Omit<FlightRecord, 'id'>): FlightRecord | null => {
    const target = fleet.find(a => a.id === aircraftId);
    if (!target) return null;
    const created: FlightRecord = {
      ...record,
      id: `${target.aircraftNo}-R${String(target.records.length + 1).padStart(2, '0')}-${Date.now() % 1000}`,
    };
    setFleet(prev => prev.map(a =>
      a.id === aircraftId ? { ...a, records: [created, ...a.records] } : a
    ));
    return created;
  };

  return (
    <FleetContext.Provider value={{ fleet, getAircraft, addAircraft, addRecord }}>
      {children}
    </FleetContext.Provider>
  );
}

export function useFleet() {
  const ctx = useContext(FleetContext);
  if (!ctx) throw new Error('useFleet must be used within FleetProvider');
  return ctx;
}
