import type { ColDef, FilterDef, InventoryRow, SourceKey } from '../types';

export const VCOLS: ColDef[] = [
  { key: 'cuenta',      label: 'CUENTA' },
  { key: 'flota',       label: 'FLOTA' },
  { key: 'vehicle',     label: 'VEHICLEID / PATENTE' },
  { key: 'serial',      label: 'SERIAL GUARDIAN' },
  { key: 'imeiG',       label: 'IMEI GUARDIAN' },
  { key: 'genGuardian', label: 'GEN GUARDIAN' },
  { key: 'simG',        label: 'SIMCARD GUARDIAN' },
  { key: 'imeiFFC',     label: 'IMEI FFC LIVE' },
  { key: 'simFFC',      label: 'SIMCARD FFC LIVE' },
  { key: 'ffcModel',    label: 'MODELO FFC LIVE' },
  { key: 'imeiGPS',     label: 'IMEI GPS' },
  { key: 'simGPS',      label: 'SIM CARD GPS' },
  { key: 'temporal',    label: '¿TEMPORAL O PERMANENTE?' },
];

export const FILTER_DEFS: FilterDef[] = [
  { key: 'vehicle', label: 'Vehículo / Patente', col: 'vehicle', icon: '🚗', ph: 'PSVR54\nPSVR56\nRLLW48' },
  { key: 'serial',  label: 'Serial Guardian',    col: 'serial',  icon: '🔑', ph: 'P1002260-S00045575' },
  { key: 'imeiG',   label: 'IMEI Guardian',      col: 'imeiG',   icon: '📡', ph: '867929064346770' },
  { key: 'simG',    label: 'SIMCARD Guardian',   col: 'simG',    icon: '💳', ph: '8934071500007098382' },
  { key: 'imeiFFC', label: 'IMEI FFC Live',      col: 'imeiFFC', icon: '📡', ph: '867929...' },
  { key: 'simFFC',  label: 'SIMCARD FFC Live',   col: 'simFFC',  icon: '💳', ph: '8934...' },
  { key: 'imeiGPS', label: 'IMEI GPS',           col: 'imeiGPS', icon: '🛰️', ph: '353549090019505' },
  { key: 'simGPS',  label: 'SIM Card GPS',       col: 'simGPS',  icon: '💳', ph: '8934...' },
  { key: 'cuenta',  label: 'Cuenta',             col: 'cuenta',  icon: '🏢', ph: '(SMLA) AGREDUCAM' },
  { key: 'flota',   label: 'Flota',              col: 'flota',   icon: '🚛', ph: '(SMLA) TSM-CBB' },
];

export const COL_ALIASES: Record<string, keyof InventoryRow> = {
  'CUENTA': 'cuenta',
  'FLOTA': 'flota',
  'VEHICLEID/PATENTE': 'vehicle',
  'VEHICLEID / PATENTE': 'vehicle',
  'VEHICLE': 'vehicle',
  'PATENTE': 'vehicle',
  'VEHICLEID': 'vehicle',
  'SERIAL GUARDIAN': 'serial',
  'IMEI GUARDIAN': 'imeiG',
  'SIMCARD GUARDIAN': 'simG',
  'IMEI FFC LIVE': 'imeiFFC',
  'SIMCARD FFC LIVE': 'simFFC',
  'IMEI GPS': 'imeiGPS',
  'SIM CARD GPS': 'simGPS',
  '¿TEMPORAL O PERMANENTE?': 'temporal',
  'TEMPORAL O PERMANENTE': 'temporal',
  'GEN GUARDIAN': 'genGuardian',
  'MODELO FFC LIVE': 'ffcModel',
  'MODELO FFC': 'ffcModel',
};

export const EXPORT_HDRS = [
  'CUENTA', 'FLOTA', 'VEHICLEID/PATENTE', 'SERIAL GUARDIAN',
  'IMEI GUARDIAN', 'GEN GUARDIAN', 'SIMCARD GUARDIAN',
  'IMEI FFC LIVE', 'SIMCARD FFC LIVE', 'MODELO FFC LIVE',
  'IMEI GPS', 'Sim Card GPS', '¿Temporal o permanente?',
];

export const EXPORT_FIELDS: (keyof InventoryRow)[] = [
  'cuenta', 'flota', 'vehicle', 'serial', 'imeiG', 'genGuardian', 'simG',
  'imeiFFC', 'simFFC', 'ffcModel', 'imeiGPS', 'simGPS', 'temporal',
];

export const SOURCE_DEFS: { key: SourceKey; icon: string; name: string; role: string }[] = [
  { key: 'unidades',  icon: '📡', name: 'Unidades sin comunicar', role: 'Fuente principal' },
  { key: 'inventory', icon: '🔧', name: 'Inventory Report',       role: 'Guardian / FFC' },
  { key: 'hardware',  icon: '🛰️', name: 'Listado de Hardware',    role: 'IMEI GPS · SIM GPS' },
  { key: 'sims',      icon: '💳', name: 'SIMs (AT&T)',             role: 'ICC / SIM por IMEI' },
  { key: 'pod',       icon: '📋', name: 'POD',                    role: 'SIMs secundarias' },
];
