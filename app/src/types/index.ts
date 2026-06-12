export interface InventoryRow {
  cuenta: string;
  flota: string;
  vehicle: string;
  serial: string;
  imeiG: string;
  genGuardian: string;
  simG: string;
  imeiFFC: string;
  simFFC: string;
  ffcModel: string;
  imeiGPS: string;
  simGPS: string;
  temporal: string;
}

export interface RawSources {
  unidades: Record<string, string>[] | null;
  inventory: Record<string, string>[] | null;
  hardware: Record<string, string>[] | null;
  sims: Record<string, string>[] | null;
  pod: Record<string, string>[] | null;
}

export type SourceKey = keyof RawSources;

export interface LogEntry {
  ts: string;
  level: 'ok' | 'warn' | 'err' | 'info';
  msg: string;
}

export interface ColDef {
  key: keyof InventoryRow;
  label: string;
}

export interface FilterDef {
  key: keyof InventoryRow;
  label: string;
  col: keyof InventoryRow;
  icon: string;
  ph: string;
}

export interface ProcessStats {
  total: number;
  withSerial: number;
  withSim: number;
  withGPS: number;
}

export type ProcessState = 'idle' | 'processing' | 'done' | 'error';
export type Tab = 'export' | 'visor';
