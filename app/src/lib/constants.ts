import type { ColDef, FilterDef, SourceKey } from '../types';

// ── Visor columns (14) ──
export const VCOLS: ColDef[] = [
  { key: 'cuenta',              label: 'CUENTA' },
  { key: 'flota',               label: 'FLOTA' },
  { key: 'vehicle',             label: 'VEHICLEID / PATENTE' },
  { key: 'serial',              label: 'SERIAL GUARDIAN' },
  { key: 'imeiG',               label: 'IMEI GUARDIAN' },
  { key: 'genGuardian',         label: 'GEN GUARDIAN' },
  { key: 'monitored',           label: 'MONITOREADO' },
  { key: 'vehicleInstallation', label: 'FECHA INSTALACIÓN' },
  { key: 'simG',                label: 'SIMCARD GUARDIAN' },
  { key: 'imeiFFC',             label: 'IMEI FFC LIVE' },
  { key: 'simFFC',              label: 'SIMCARD FFC LIVE' },
  { key: 'ffcModel',            label: 'MODELO FFC LIVE' },
  { key: 'imeiGPS',             label: 'IMEI GPS' },
  { key: 'simGPS',              label: 'SIM CARD GPS' },
];

// ── Visor filters (10) ──
export const FILTER_DEFS: FilterDef[] = [
  { key: 'cuenta',  label: 'Cuenta',              col: 'cuenta',  icon: '🏢', ph: '(SMLA) AGREDUCAM\n(SMLA) LINDE-CHILE' },
  { key: 'flota',   label: 'Flota',               col: 'flota',   icon: '🚛', ph: '(SMLA) TSM-CBB' },
  { key: 'vehicle', label: 'Vehículo / Patente',  col: 'vehicle', icon: '🚗', ph: 'PSVR54\nPSVR56' },
  { key: 'serial',  label: 'Serial Guardian',     col: 'serial',  icon: '🔑', ph: 'P1002260-S00045575' },
  { key: 'imeiG',   label: 'IMEI Guardian',       col: 'imeiG',   icon: '📡', ph: '867929064346770' },
  { key: 'simG',    label: 'SIMCARD Guardian',    col: 'simG',    icon: '💳', ph: '8934071500007098382' },
  { key: 'imeiFFC', label: 'IMEI FFC Live',       col: 'imeiFFC', icon: '📡', ph: '867929...' },
  { key: 'simFFC',  label: 'SIMCARD FFC Live',    col: 'simFFC',  icon: '💳', ph: '8934...' },
  { key: 'imeiGPS', label: 'IMEI GPS',            col: 'imeiGPS', icon: '🛰️', ph: '353549090019505' },
  { key: 'simGPS',  label: 'SIM Card GPS',        col: 'simGPS',  icon: '💳', ph: '8934...' },
];

// ── Gestión SIM columns (31) ──
export const SCOLS: ColDef[] = [
  { key: 'cuenta',          label: 'CUENTA' },
  { key: 'flota',           label: 'FLOTA' },
  { key: 'vehicle',         label: 'VEHICLEID / PATENTE' },
  { key: 'serial',          label: 'SERIAL GUARDIAN' },
  { key: 'imeiG',           label: 'IMEI GUARDIAN' },
  { key: 'genGuardian',     label: 'GEN GUARDIAN' },
  { key: 'monitored',       label: 'MONITOREADO' },
  { key: 'simG',            label: 'SIMCARD GUARDIAN' },
  { key: 'gP1',             label: 'GUARDIAN SIM — PERSONALIZADO 1' },
  { key: 'gP2',             label: 'GUARDIAN SIM — PERSONALIZADO 2' },
  { key: 'gFecha',          label: 'GUARDIAN SIM — FECHA ACTIVACIÓN' },
  { key: 'gReglaEntel',     label: 'GUARDIAN SIM — CUMPLE REGLA ENTEL' },
  { key: 'gDatos',          label: 'GUARDIAN SIM — DATOS MENSUALES' },
  { key: 'gEstado',         label: 'GUARDIAN SIM — ESTADO' },
  { key: 'ultimoContacto',  label: 'ÚLTIMO CONTACTO GUARDIAN' },
  { key: 'imeiFFC',         label: 'IMEI FFC LIVE' },
  { key: 'simFFC',          label: 'SIMCARD FFC LIVE' },
  { key: 'ffcP1',           label: 'FFC SIM — PERSONALIZADO 1' },
  { key: 'ffcP2',           label: 'FFC SIM — PERSONALIZADO 2' },
  { key: 'ffcFecha',        label: 'FFC SIM — FECHA ACTIVACIÓN' },
  { key: 'ffcReglaEntel',   label: 'FFC SIM — CUMPLE REGLA ENTEL' },
  { key: 'ffcDatos',        label: 'FFC SIM — DATOS MENSUALES' },
  { key: 'ffcEstado',       label: 'FFC SIM — ESTADO' },
  { key: 'ffcModel',        label: 'MODELO FFC LIVE' },
  { key: 'imeiGPS',         label: 'IMEI GPS' },
  { key: 'simGPS',          label: 'SIM CARD GPS' },
  { key: 'gpsP1',           label: 'GPS SIM — PERSONALIZADO 1' },
  { key: 'gpsP2',           label: 'GPS SIM — PERSONALIZADO 2' },
  { key: 'gpsFecha',        label: 'GPS SIM — FECHA ACTIVACIÓN' },
  { key: 'gpsDatos',        label: 'GPS SIM — DATOS MENSUALES' },
  { key: 'gpsEstado',       label: 'GPS SIM — ESTADO' },
];

export const SFILTER_DEFS: FilterDef[] = [
  { key: 'vehicle', label: 'Vehículo / Patente', col: 'vehicle', icon: '🚗', ph: 'PSVR54\nPSVR56' },
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

// ── SIMs M2M columns (20) ──
export const M2M_COLS: ColDef[] = [
  { key: 'icc',             label: 'ICC / SIM' },
  { key: 'imei',            label: 'IMEI' },
  { key: 'dispositivo',     label: 'DISPOSITIVO' },
  { key: 'tipoDispositivo', label: 'TIPO DISPOSITIVO' },
  { key: 'platform',        label: 'PLATFORM' },
  { key: 'cuenta',          label: 'CUENTA' },
  { key: 'flota',           label: 'FLOTA' },
  { key: 'vehiculo',        label: 'VEHÍCULO' },
  { key: 'serial',          label: 'SERIAL GUARDIAN' },
  { key: 'modeloHW',        label: 'MODELO HW' },
  { key: 'marcaHW',         label: 'MARCA HW' },
  { key: 'monitored',       label: 'MONITOREADO' },
  { key: 'p1',              label: 'PERSONALIZADO 1' },
  { key: 'p2',              label: 'PERSONALIZADO 2' },
  { key: 'estado',          label: 'ESTADO SIM' },
  { key: 'plan',            label: 'PLAN' },
  { key: 'datosMB',         label: 'DATOS MENSUAL (MB)' },
  { key: 'datosGB',         label: 'DATOS MENSUAL (GB)' },
  { key: 'fechaActivacion', label: 'FECHA ACTIVACIÓN' },
  { key: 'fuenteID',        label: 'FUENTE IDENTIFICACIÓN' },
];

export const M2M_FILTER_DEFS: FilterDef[] = [
  { key: 'cuenta',          label: 'Cuenta',              col: 'cuenta',          icon: '🏢',  ph: '(SMLA) COPEC' },
  { key: 'flota',           label: 'Flota',               col: 'flota',           icon: '🚛',  ph: '(SMLA) TSM-CBB' },
  { key: 'vehiculo',        label: 'Vehículo',            col: 'vehiculo',        icon: '🚗',  ph: 'PSVR54' },
  { key: 'serial',          label: 'Serial Guardian',     col: 'serial',          icon: '🔑',  ph: 'P1002260-S00045575' },
  { key: 'icc',             label: 'ICC / SIM',           col: 'icc',             icon: '💳',  ph: '8956010000...' },
  { key: 'imei',            label: 'IMEI',                col: 'imei',            icon: '📡',  ph: '867929064346770' },
  { key: 'tipoDispositivo', label: 'Tipo Dispositivo',    col: 'tipoDispositivo', icon: '📱',  ph: 'GUARDIAN GEN2\nMC30' },
  { key: 'estado',          label: 'Estado SIM',          col: 'estado',          icon: '📶',  ph: 'ACTIVA\nHIBERNADA' },
  { key: 'p1',              label: 'Personalizado 1',     col: 'p1',              icon: '🏷️', ph: 'GUARDIAN GEN2' },
  { key: 'fuenteID',        label: 'Fuente Identificación', col: 'fuenteID',      icon: '🔍',  ph: 'Custom\nHardware' },
];

// ── Cobro columns (21) ──
export const COBRO_COLS: ColDef[] = [
  { key: 'icc',             label: 'ICC' },
  { key: 'empresa',         label: 'EMPRESA' },
  { key: 'estado',          label: 'ESTADO' },
  { key: 'plan',            label: 'PLAN' },
  { key: 'tipoSim',         label: 'TIPO SIM' },
  { key: 'mbPlan',          label: 'MB PLAN' },
  { key: 'consumoMB',       label: 'CONSUMO MB' },
  { key: 'costoPlan',       label: 'COSTO PLAN' },
  { key: 'costoTotal',      label: 'COSTO TOTAL' },
  { key: 'moneda',          label: 'MONEDA' },
  { key: 'imei',            label: 'IMEI' },
  { key: 'tipoDispositivo', label: 'TIPO DISPOSITIVO' },
  { key: 'cuenta',          label: 'CUENTA' },
  { key: 'flota',           label: 'FLOTA' },
  { key: 'vehiculo',        label: 'VEHÍCULO' },
  { key: 'serial',          label: 'SERIAL GUARDIAN' },
  { key: 'p1',              label: 'PERSONALIZADO 1' },
  { key: 'p2',              label: 'PERSONALIZADO 2' },
  { key: 'fuenteID',        label: 'FUENTE IDENTIFICACIÓN' },
  { key: 'monitored',       label: 'MONITOREADO' },
  { key: 'reglaEntel',      label: 'REGLA ENTEL' },
];

export const COBRO_FILTER_DEFS: FilterDef[] = [
  { key: 'cuenta',          label: 'Cuenta',           col: 'cuenta',          icon: '🏢', ph: '(SMLA) COPEC' },
  { key: 'flota',           label: 'Flota',            col: 'flota',           icon: '🚛', ph: '(SMLA) TSM-CBB' },
  { key: 'tipoDispositivo', label: 'Tipo Dispositivo', col: 'tipoDispositivo', icon: '📱', ph: 'GUARDIAN GEN2\nMC30-02' },
  { key: 'plan',            label: 'Plan',             col: 'plan',            icon: '📋', ph: 'AT&T GLOBAL 1 GB' },
  { key: 'estado',          label: 'Estado',           col: 'estado',          icon: '📶', ph: 'ACTIVA\nHIBERNADA' },
  { key: 'icc',             label: 'ICC',              col: 'icc',             icon: '💳', ph: '895601...' },
  { key: 'imei',            label: 'IMEI',             col: 'imei',            icon: '📡', ph: '867929...' },
  { key: 'moneda',          label: 'Moneda',           col: 'moneda',          icon: '💰', ph: 'CLP\nUSD' },
];

// ── COL_ALIASES for XLSX import (Visor) ──
export const COL_ALIASES: Record<string, string> = {
  'CUENTA': 'cuenta', 'FLOTA': 'flota',
  'VEHICLEID/PATENTE': 'vehicle', 'VEHICLEID / PATENTE': 'vehicle',
  'VEHICLE': 'vehicle', 'PATENTE': 'vehicle', 'VEHICLEID': 'vehicle',
  'SERIAL GUARDIAN': 'serial',
  'IMEI GUARDIAN': 'imeiG',
  'GEN GUARDIAN': 'genGuardian',
  'MONITOREADO': 'monitored',
  'FECHA INSTALACIÓN': 'vehicleInstallation', 'VEHICLE_INSTALLATION': 'vehicleInstallation',
  'SIMCARD GUARDIAN': 'simG',
  'IMEI FFC LIVE': 'imeiFFC',
  'SIMCARD FFC LIVE': 'simFFC',
  'MODELO FFC LIVE': 'ffcModel', 'MODELO FFC': 'ffcModel',
  'IMEI GPS': 'imeiGPS',
  'SIM CARD GPS': 'simGPS',
  '¿TEMPORAL O PERMANENTE?': 'temporal', 'TEMPORAL O PERMANENTE': 'temporal',
  'GUARDIAN SIM — PERSONALIZADO 1': 'gP1', 'GUARDIAN SIM — PERSONALIZADO 2': 'gP2',
  'GUARDIAN SIM — FECHA ACTIVACIÓN': 'gFecha', 'GUARDIAN SIM — DATOS MENSUALES': 'gDatos',
  'GUARDIAN SIM — ESTADO': 'gEstado', 'ÚLTIMO CONTACTO GUARDIAN': 'ultimoContacto',
  'FFC SIM — PERSONALIZADO 1': 'ffcP1', 'FFC SIM — PERSONALIZADO 2': 'ffcP2',
  'FFC SIM — FECHA ACTIVACIÓN': 'ffcFecha', 'FFC SIM — DATOS MENSUALES': 'ffcDatos',
  'FFC SIM — ESTADO': 'ffcEstado',
  'GPS SIM — PERSONALIZADO 1': 'gpsP1', 'GPS SIM — PERSONALIZADO 2': 'gpsP2',
  'GPS SIM — FECHA ACTIVACIÓN': 'gpsFecha', 'GPS SIM — DATOS MENSUALES': 'gpsDatos',
  'GPS SIM — ESTADO': 'gpsEstado',
};

// ── M2M COL_ALIASES for XLSX import ──
export const M2M_COL_ALIASES: Record<string, string> = {
  'ICC / SIM': 'icc', 'ICC': 'icc',
  'IMEI': 'imei',
  'DISPOSITIVO': 'dispositivo', 'DISPOSITIVO (SIM)': 'dispositivo',
  'TIPO DISPOSITIVO': 'tipoDispositivo',
  'CUENTA': 'cuenta', 'FLOTA': 'flota',
  'VEHÍCULO': 'vehiculo', 'VEHICULO': 'vehiculo', 'VEHICLE': 'vehiculo',
  'SERIAL GUARDIAN': 'serial',
  'MODELO HW': 'modeloHW', 'MARCA HW': 'marcaHW',
  'MONITOREADO': 'monitored',
  'PERSONALIZADO 1': 'p1', 'PERSONALIZADO 2': 'p2',
  'ESTADO SIM': 'estado', 'ESTADO': 'estado',
  'DATOS MENSUAL (MB)': 'datosMB', 'DATOS MENSUAL (GB)': 'datosGB',
  'FECHA ACTIVACIÓN': 'fechaActivacion',
  'FUENTE IDENTIFICACIÓN': 'fuenteID',
  'PLATFORM': 'platform', 'PLAN': 'plan',
};

// ── COBRO COL_ALIASES for XLSX import ──
export const COBRO_COL_ALIASES: Record<string, string> = {
  'ICC': 'icc', 'EMPRESA': 'empresa', 'ESTADO': 'estado', 'PLAN': 'plan',
  'TIPO SIM': 'tipoSim', 'MB PLAN': 'mbPlan', 'CONSUMO MB': 'consumoMB',
  'COSTO PLAN': 'costoPlan', 'COSTO TOTAL': 'costoTotal', 'MONEDA': 'moneda',
  'IMEI': 'imei', 'TIPO DISPOSITIVO': 'tipoDispositivo',
  'CUENTA': 'cuenta', 'FLOTA': 'flota', 'VEHÍCULO': 'vehiculo', 'VEHICULO': 'vehiculo',
  'SERIAL GUARDIAN': 'serial', 'PERSONALIZADO 1': 'p1', 'PERSONALIZADO 2': 'p2',
  'FUENTE IDENTIFICACIÓN': 'fuenteID', 'MONITOREADO': 'monitored', 'REGLA ENTEL': 'reglaEntel',
};

// ── Export XLSX headers (14) ──
export const EXPORT_HDRS = [
  'CUENTA', 'FLOTA', 'VEHICLEID/PATENTE', 'SERIAL GUARDIAN',
  'IMEI GUARDIAN', 'GEN GUARDIAN', 'MONITOREADO', 'FECHA INSTALACIÓN',
  'SIMCARD GUARDIAN', 'IMEI FFC LIVE', 'SIMCARD FFC LIVE', 'MODELO FFC LIVE',
  'IMEI GPS', 'Sim Card GPS',
];

export const EXPORT_FIELDS: (keyof import('../types').InventoryRow)[] = [
  'cuenta', 'flota', 'vehicle', 'serial', 'imeiG', 'genGuardian',
  'monitored', 'vehicleInstallation',
  'simG', 'imeiFFC', 'simFFC', 'ffcModel', 'imeiGPS', 'simGPS',
];

// ── Source definitions (9) ──
export const SOURCE_DEFS: {
  key: SourceKey;
  icon: string;
  name: string;
  role: string;
  accept: string;
}[] = [
  { key: 'unidades',    icon: '📡', name: 'Unidades Sin Comunicar',  role: 'Fuente principal',                    accept: '.csv' },
  { key: 'inventory',   icon: '🔧', name: 'Inventory Report',        role: 'Registros por Serial',               accept: '.csv' },
  { key: 'invCustom',   icon: '📊', name: 'Inventory Custom',        role: 'Unidades Guardian',                   accept: '.csv,.xlsx' },
  { key: 'hardware',    icon: '🛰️', name: 'Listado de Hardware',     role: 'IMEI GPS · SIM GPS',                  accept: '.csv' },
  { key: 'sims',        icon: '💳', name: 'M2M SIMs',                role: 'ICC / SIM por IMEI',                  accept: '.csv' },
  { key: 'pod',         icon: '📋', name: 'POD',                     role: 'SIMs secundarias',                    accept: '.csv' },
  { key: 'imeiExtra',   icon: '📟', name: 'IMEI Provisional Gen3',   role: 'Fallback IMEI por serial',            accept: '.csv,.xlsx' },
  { key: 'ffcVersiones',icon: '📷', name: 'Versiones FFC',           role: 'Modelo Howen',                        accept: '.csv,.xlsx' },
  { key: 'hwList',      icon: '🗂️', name: 'Hardware List',           role: 'IMEI → Modelo',                       accept: '.csv,.xlsx' },
];
