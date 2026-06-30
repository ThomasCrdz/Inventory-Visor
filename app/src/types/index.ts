export interface InventoryRow {
  cuenta: string;
  flota: string;
  vehicle: string;
  serial: string;
  imeiG: string;
  genGuardian: string;
  monitored: string;
  vehicleInstallation: string;
  simG: string;
  gP1: string;
  gP2: string;
  gFecha: string;
  gDatos: string;
  gEstado: string;
  ultimoContacto: string;
  imeiFFC: string;
  simFFC: string;
  ffcP1: string;
  ffcP2: string;
  ffcFecha: string;
  ffcDatos: string;
  ffcEstado: string;
  ffcModel: string;
  imeiGPS: string;
  simGPS: string;
  gpsP1: string;
  gpsP2: string;
  gpsFecha: string;
  gpsDatos: string;
  gpsEstado: string;
  temporal: string;
}

export interface RawSources {
  unidades:    Record<string, string>[] | null;
  inventory:   Record<string, string>[] | null;
  invCustom:   Record<string, string>[] | null;
  hardware:    Record<string, string>[] | null;
  sims:        Record<string, string>[] | null;
  pod:         Record<string, string>[] | null;
  imeiExtra:   Record<string, string>[] | null;
  ffcVersiones:Record<string, string>[] | null;
  hwList:      Record<string, string>[] | null;
}

export type SourceKey = keyof RawSources;

export interface LogEntry {
  ts: string;
  level: 'ok' | 'warn' | 'err' | 'info';
  msg: string;
}

export interface ColDef {
  key: string;
  label: string;
}

export interface FilterDef {
  key: string;
  label: string;
  col: string;
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
export type Tab = 'export' | 'visor' | 'sim' | 'm2m' | 'cobro';

// ── SIMs M2M ──
export interface M2MRow {
  icc: string;
  imei: string;
  dispositivo: string;
  tipoDispositivo: string;
  platform: string;
  cuenta: string;
  flota: string;
  vehiculo: string;
  serial: string;
  modeloHW: string;
  marcaHW: string;
  monitored: string;
  p1: string;
  p2: string;
  estado: string;
  plan: string;
  datosMB: number;
  datosGB: number;
  fechaActivacion: string;
  fuenteID: string;
}

// ── Cobro ──
export interface CobroRow {
  icc: string;
  empresa: string;
  estado: string;
  plan: string;
  tipoSim: string;
  mbPlan: string;
  consumoMB: string;
  costoPlan: string;
  costoTotal: string;
  moneda: string;
  imei: string;
  tipoDispositivo: string;
  cuenta: string;
  flota: string;
  vehiculo: string;
  serial: string;
  p1: string;
  p2: string;
  fuenteID: string;
  monitored: string;
  reglaEntel: string;
}

// ── Gestión SIM ──
export interface SimRow extends InventoryRow {
  // gReglaEntel and ffcReglaEntel are computed at render time from gFecha/ffcFecha
}
