import * as XLSX from 'xlsx';
import type { InventoryRow, M2MRow, CobroRow } from '../types';
import { EXPORT_HDRS, EXPORT_FIELDS } from './constants';

const ct  = (v: string | number | undefined | null) => ({ t: 's' as const, v: String(v ?? ''), z: '@' });
const ctm = (v: string) => {
  const vl = (v ?? '').toLowerCase();
  if (vl === 'yes') return { t: 's' as const, v: 'Yes', z: '@' };
  if (vl === 'no')  return { t: 's' as const, v: 'No',  z: '@' };
  return { t: 's' as const, v: 'N/A', z: '@' };
};

function buildInventorySheet(rows: InventoryRow[]): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  const range = { s: { r: 0, c: 0 }, e: { r: rows.length, c: EXPORT_HDRS.length - 1 } };
  EXPORT_HDRS.forEach((h, c) => { ws[XLSX.utils.encode_cell({ r: 0, c })] = { t: 's', v: h }; });
  rows.forEach((row, ri) => {
    EXPORT_FIELDS.forEach((f, c) => {
      ws[XLSX.utils.encode_cell({ r: ri + 1, c })] = f === 'monitored' ? ctm(row[f]) : ct(row[f]);
    });
  });
  ws['!ref'] = XLSX.utils.encode_range(range);
  ws['!cols'] = [
    { wch: 30 }, { wch: 30 }, { wch: 20 }, { wch: 22 }, { wch: 18 }, { wch: 10 },
    { wch: 12 }, { wch: 22 }, { wch: 18 }, { wch: 22 }, { wch: 18 }, { wch: 18 },
    { wch: 22 }, { wch: 20 },
  ];
  return ws;
}

export function exportAll(rows: InventoryRow[]) {
  if (!rows.length) return;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildInventorySheet(rows), 'Inventario');
  XLSX.writeFile(wb, `inventario_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportFiltered(rows: InventoryRow[], allCount: number) {
  if (!rows.length) return;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildInventorySheet(rows), 'Filtrado');
  const suffix = rows.length < allCount ? `_filtrado_${rows.length}` : '_completo';
  XLSX.writeFile(wb, `inventario${suffix}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ── Gestión SIM export ──────────────────────────────────────────────────────
export function exportSimFiltered(rows: InventoryRow[], allCount: number, simsRaw: Record<string, string>[] | null) {
  if (!rows.length) return;
  const SCOLS_KEYS = [
    'cuenta','flota','vehicle','serial','imeiG','genGuardian','monitored',
    'simG','gP1','gP2','gFecha','gReglaEntel','gDatos','gEstado','ultimoContacto',
    'imeiFFC','simFFC','ffcP1','ffcP2','ffcFecha','ffcReglaEntel','ffcDatos','ffcEstado','ffcModel',
    'imeiGPS','simGPS','gpsP1','gpsP2','gpsFecha','gpsDatos','gpsEstado',
  ];
  const SCOLS_HDRS = [
    'CUENTA','FLOTA','VEHICLEID / PATENTE','SERIAL GUARDIAN','IMEI GUARDIAN','GEN GUARDIAN','MONITOREADO',
    'SIMCARD GUARDIAN','GUARDIAN SIM — PERSONALIZADO 1','GUARDIAN SIM — PERSONALIZADO 2',
    'GUARDIAN SIM — FECHA ACTIVACIÓN','GUARDIAN SIM — CUMPLE REGLA ENTEL',
    'GUARDIAN SIM — DATOS MENSUALES','GUARDIAN SIM — ESTADO','ÚLTIMO CONTACTO GUARDIAN',
    'IMEI FFC LIVE','SIMCARD FFC LIVE','FFC SIM — PERSONALIZADO 1','FFC SIM — PERSONALIZADO 2',
    'FFC SIM — FECHA ACTIVACIÓN','FFC SIM — CUMPLE REGLA ENTEL',
    'FFC SIM — DATOS MENSUALES','FFC SIM — ESTADO','MODELO FFC LIVE',
    'IMEI GPS','SIM CARD GPS','GPS SIM — PERSONALIZADO 1','GPS SIM — PERSONALIZADO 2',
    'GPS SIM — FECHA ACTIVACIÓN','GPS SIM — DATOS MENSUALES','GPS SIM — ESTADO',
  ];

  const wb = XLSX.utils.book_new();
  const ws: XLSX.WorkSheet = {};
  const range = { s: { r: 0, c: 0 }, e: { r: rows.length, c: SCOLS_HDRS.length - 1 } };
  SCOLS_HDRS.forEach((h, ci) => { ws[XLSX.utils.encode_cell({ r: 0, c: ci })] = { t: 's', v: h }; });
  rows.forEach((row, ri) => {
    SCOLS_KEYS.forEach((f, ci) => {
      let cell;
      const rr = row as unknown as Record<string, string>;
      if (f === 'monitored') cell = ctm(rr[f] ?? '');
      else if (f === 'gReglaEntel')   cell = ct(calcReglaEntel(rr.gFecha   ?? ''));
      else if (f === 'ffcReglaEntel') cell = ct(calcReglaEntel(rr.ffcFecha ?? ''));
      else cell = ct(rr[f] ?? '');
      ws[XLSX.utils.encode_cell({ r: ri + 1, c: ci })] = cell;
    });
  });
  ws['!ref'] = XLSX.utils.encode_range(range);
  ws['!cols'] = SCOLS_HDRS.map(() => ({ wch: 22 }));
  XLSX.utils.book_append_sheet(wb, ws, 'Gestion SIM');

  // Sheet 2: Resumen Consumo by Personalizado 1
  if (simsRaw && simsRaw.length) {
    const parseMB = (v: string) => parseFloat((v ?? '').replace(',', '.').replace(/ /g, '')) || 0;
    const GROUPS = ['GUARDIAN GEN1','GUARDIAN GEN2','GUARDIAN GEN3','MC30','JC400','ME40','MDVR','FFCLIVE'];
    const groupStats = GROUPS.map(g => {
      const gRows = simsRaw.filter(r => (r['Personalizado 1'] ?? '').trim() === g);
      const totalMB = gRows.reduce((acc, r) => acc + parseMB(r['Datos Mensual'] ?? ''), 0);
      const activas = gRows.filter(r => (r['Estado'] ?? '').trim().toUpperCase() === 'ACTIVA').length;
      return { grupo: g, total: gRows.length, activas, totalMB, totalGB: totalMB / 1024 };
    });
    const wsR: XLSX.WorkSheet = {};
    const rHdrs = ['GRUPO','TOTAL SIMs','ACTIVAS','TOTAL MB','TOTAL GB'];
    rHdrs.forEach((h, ci) => { wsR[XLSX.utils.encode_cell({ r: 0, c: ci })] = { t: 's', v: h }; });
    groupStats.forEach((g, ri) => {
      const row = [g.grupo, g.total, g.activas, Math.round(g.totalMB), Math.round(g.totalGB)];
      row.forEach((v, ci) => { wsR[XLSX.utils.encode_cell({ r: ri + 1, c: ci })] = { t: typeof v === 'number' ? 'n' : 's', v }; });
    });
    const sumTotal = groupStats.reduce((a, r) => a + r.total, 0);
    const sumActivas = groupStats.reduce((a, r) => a + r.activas, 0);
    const sumMB = groupStats.reduce((a, r) => a + r.totalMB, 0);
    const tRow = ['TOTAL', sumTotal, sumActivas, Math.round(sumMB), Math.round(sumMB / 1024)];
    tRow.forEach((v, ci) => { wsR[XLSX.utils.encode_cell({ r: groupStats.length + 1, c: ci })] = { t: typeof v === 'number' ? 'n' : 's', v }; });
    wsR['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: groupStats.length + 1, c: 4 } });
    wsR['!cols'] = [{ wch: 22 }, { wch: 12 }, { wch: 10 }, { wch: 16 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsR, 'Resumen Consumo');
  }

  const suffix = rows.length < allCount ? `_filtrado_${rows.length}` : '_completo';
  XLSX.writeFile(wb, `gestion_sim${suffix}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ── SIMs M2M export ─────────────────────────────────────────────────────────
export function exportM2m(rows: M2MRow[], allCount: number, allRows: M2MRow[]) {
  if (!rows.length) return;
  const HDRS = ['ICC / SIM','IMEI','DISPOSITIVO','TIPO DISPOSITIVO','PLATFORM',
    'CUENTA','FLOTA','VEHÍCULO','SERIAL GUARDIAN','MODELO HW','MARCA HW','MONITOREADO',
    'PERSONALIZADO 1','PERSONALIZADO 2','ESTADO SIM','PLAN',
    'DATOS MENSUAL (MB)','DATOS MENSUAL (GB)','FECHA ACTIVACIÓN','FUENTE IDENTIFICACIÓN'];
  const FIELDS: (keyof M2MRow)[] = ['icc','imei','dispositivo','tipoDispositivo','platform',
    'cuenta','flota','vehiculo','serial','modeloHW','marcaHW','monitored',
    'p1','p2','estado','plan','datosMB','datosGB','fechaActivacion','fuenteID'];

  const wb = XLSX.utils.book_new();
  const ws: XLSX.WorkSheet = {};
  const range = { s: { r: 0, c: 0 }, e: { r: rows.length, c: HDRS.length - 1 } };
  HDRS.forEach((h, ci) => { ws[XLSX.utils.encode_cell({ r: 0, c: ci })] = { t: 's', v: h }; });
  rows.forEach((row, ri) => {
    FIELDS.forEach((f, ci) => {
      ws[XLSX.utils.encode_cell({ r: ri + 1, c: ci })] = { t: 's', v: String(row[f] ?? ''), z: '@' };
    });
  });
  ws['!ref'] = XLSX.utils.encode_range(range);
  ws['!cols'] = HDRS.map(() => ({ wch: 20 }));
  XLSX.utils.book_append_sheet(wb, ws, 'SIMs M2M');

  // Sheet 2: Resumen Consumo by tipo dispositivo
  if (allRows.length) {
    const normalizeType = (tipo: string) => {
      const t = (tipo ?? '').trim();
      if (['GUARDIAN GEN2','GUARDIAN GEN2 v1 (P1001229)'].includes(t)) return 'GUARDIAN GEN2';
      if (['GUARDIAN GEN3','GEN3'].includes(t)) return 'GUARDIAN GEN3';
      if (['JC400A','JC400 (C28)','JC400D','JC400P','JC400'].includes(t)) return 'JC400';
      if (['MC30-02','MC30','MC30-02 / MDVR'].includes(t)) return 'MC30-02';
      if (['ME40-02','ME40'].includes(t)) return 'ME40';
      if (['MDVR','MA80-04','MA80-08'].includes(t)) return 'MDVR';
      if (['ROUTER / STARLINK','ROUTER TELTONIKA STARLINK','RUT200','EC200A-AU'].includes(t)) return 'ROUTER / STARLINK';
      if (['FFCLIVE','FFCLIVE DESCONOCIDO'].includes(t)) return 'FFCLIVE';
      if (!t || t.startsWith('STOCK') || t.startsWith('SOLICITUD') || t.startsWith('CANDIDAT') ||
          t.startsWith('REVISAR') || t.startsWith('SIMCARD') || t === 'DISPOSITIVO CELULAR' ||
          t === 'SIMCARD HORUX M2M' || t === 'HORUX M2M') return 'Activas sin consumo';
      return t;
    };
    const tipoMap = new Map<string, { total: number; activas: number; totalMB: number }>();
    allRows.forEach(r => {
      const normalized = normalizeType(r.tipoDispositivo);
      const mb = typeof r.datosMB === 'number' ? r.datosMB : parseFloat(String(r.datosMB)) || 0;
      const key = normalized === 'Activas sin consumo'
        ? (mb > 0 ? 'Sin dispositivo con consumo' : 'Sin dispositivo sin consumo')
        : (normalized || 'Sin dispositivo sin consumo');
      if (!tipoMap.has(key)) tipoMap.set(key, { total: 0, activas: 0, totalMB: 0 });
      const g = tipoMap.get(key)!;
      g.total++; g.totalMB += mb;
      if ((r.estado ?? '').trim().toUpperCase() === 'ACTIVA') g.activas++;
    });
    const LAST = ['Sin dispositivo con consumo','Sin dispositivo sin consumo'];
    const sortedTipos = [
      ...[...tipoMap.keys()].filter(k => !LAST.includes(k)).sort((a, b) => tipoMap.get(b)!.total - tipoMap.get(a)!.total),
      ...LAST.filter(k => tipoMap.has(k)),
    ];
    const wsR: XLSX.WorkSheet = {};
    const rHdrs = ['TIPO DISPOSITIVO','TOTAL SIMs','ACTIVAS','TOTAL MB','TOTAL GB','PROMEDIO MB/DISPOSITIVO'];
    rHdrs.forEach((h, ci) => { wsR[XLSX.utils.encode_cell({ r: 0, c: ci })] = { t: 's', v: h }; });
    sortedTipos.forEach((tipo, ri) => {
      const g = tipoMap.get(tipo)!;
      const prom = g.total > 0 ? Math.round(g.totalMB / g.total * 100) / 100 : 0;
      [tipo, g.total, g.activas, Math.round(g.totalMB * 100) / 100, Math.round(g.totalMB / 1024 * 100) / 100, prom].forEach((v, ci) => {
        wsR[XLSX.utils.encode_cell({ r: ri + 1, c: ci })] = { t: typeof v === 'number' ? 'n' : 's', v };
      });
    });
    const sumTotal = allRows.length, sumActivas = allRows.filter(r => (r.estado ?? '').trim().toUpperCase() === 'ACTIVA').length;
    const sumMB = allRows.reduce((acc, r) => acc + (typeof r.datosMB === 'number' ? r.datosMB : parseFloat(String(r.datosMB)) || 0), 0);
    ['TOTAL', sumTotal, sumActivas, Math.round(sumMB), Math.round(sumMB / 1024)].forEach((v, ci) => {
      wsR[XLSX.utils.encode_cell({ r: sortedTipos.length + 1, c: ci })] = { t: typeof v === 'number' ? 'n' : 's', v };
    });
    wsR['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: sortedTipos.length + 1, c: 5 } });
    wsR['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 10 }, { wch: 16 }, { wch: 12 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, wsR, 'Resumen Consumo');
  }
  const suffix = rows.length < allCount ? `_filtrado_${rows.length}` : '_completo';
  XLSX.writeFile(wb, `sims_m2m${suffix}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ── Cobro export ─────────────────────────────────────────────────────────────
export function exportCobro(rows: CobroRow[], allCount: number) {
  if (!rows.length) return;
  const HDRS = ['ICC','EMPRESA','ESTADO','PLAN','TIPO SIM','MB PLAN','CONSUMO MB',
    'COSTO PLAN','COSTO TOTAL','MONEDA','IMEI','TIPO DISPOSITIVO','CUENTA','FLOTA',
    'VEHÍCULO','SERIAL GUARDIAN','PERSONALIZADO 1','PERSONALIZADO 2',
    'FUENTE IDENTIFICACIÓN','MONITOREADO','REGLA ENTEL'];
  const FIELDS: (keyof CobroRow)[] = ['icc','empresa','estado','plan','tipoSim','mbPlan','consumoMB',
    'costoPlan','costoTotal','moneda','imei','tipoDispositivo','cuenta','flota',
    'vehiculo','serial','p1','p2','fuenteID','monitored','reglaEntel'];
  const NUM_FIELDS = new Set(['mbPlan','consumoMB','costoPlan','costoTotal']);

  const wb = XLSX.utils.book_new();
  const ws: XLSX.WorkSheet = {};
  const range = { s: { r: 0, c: 0 }, e: { r: rows.length, c: HDRS.length - 1 } };
  HDRS.forEach((h, ci) => { ws[XLSX.utils.encode_cell({ r: 0, c: ci })] = { t: 's', v: h }; });
  rows.forEach((row, ri) => {
    FIELDS.forEach((f, ci) => {
      const v = row[f];
      let cell;
      if (f === 'monitored') cell = ctm(String(v ?? ''));
      else if (NUM_FIELDS.has(f)) cell = { t: 'n' as const, v: parseFloat(String(v ?? '')) || 0 };
      else cell = ct(v as string);
      ws[XLSX.utils.encode_cell({ r: ri + 1, c: ci })] = cell;
    });
  });
  ws['!ref'] = XLSX.utils.encode_range(range);
  ws['!cols'] = HDRS.map(() => ({ wch: 20 }));
  XLSX.utils.book_append_sheet(wb, ws, 'Cobro');

  // Sheet 2: Resumen por dispositivo
  const tipoMap = new Map<string, { total: number; costo: number; consumoMB: number }>();
  rows.forEach(r => {
    const normalizeType = (t: string) => {
      if (['GUARDIAN GEN2','GUARDIAN GEN2 v1 (P1001229)'].includes(t)) return 'GUARDIAN GEN2';
      if (['JC400A','JC400 (C28)','JC400D','JC400P','JC400'].includes(t)) return 'JC400';
      if (['MC30-02','MC30','MC30-02 / MDVR'].includes(t)) return 'MC30-02';
      if (['ME40-02','ME40'].includes(t)) return 'ME40';
      if (['MDVR','MA80-04','MA80-08'].includes(t)) return 'MDVR';
      if (['ROUTER / STARLINK','ROUTER TELTONIKA STARLINK','RUT200'].includes(t)) return 'ROUTER / STARLINK';
      if (['FFCLIVE','FFCLIVE DESCONOCIDO'].includes(t)) return 'FFCLIVE';
      return t || 'Sin identificar';
    };
    const key = normalizeType(r.tipoDispositivo ?? '');
    if (!tipoMap.has(key)) tipoMap.set(key, { total: 0, costo: 0, consumoMB: 0 });
    const g = tipoMap.get(key)!;
    g.total++; g.costo += parseFloat(r.costoTotal ?? '') || 0; g.consumoMB += parseFloat(r.consumoMB ?? '') || 0;
  });
  const wsR: XLSX.WorkSheet = {};
  const rHdrs2 = ['TIPO DISPOSITIVO','TOTAL SIMs','COSTO TOTAL CLP','CONSUMO MB','CONSUMO GB'];
  rHdrs2.forEach((h, ci) => { wsR[XLSX.utils.encode_cell({ r: 0, c: ci })] = { t: 's', v: h }; });
  const sorted = [...tipoMap.entries()].sort((a, b) => b[1].costo - a[1].costo);
  sorted.forEach(([tipo, g], ri) => {
    [tipo, g.total, Math.round(g.costo * 100) / 100, Math.round(g.consumoMB * 100) / 100, Math.round(g.consumoMB / 1024 * 100) / 100].forEach((v, ci) => {
      wsR[XLSX.utils.encode_cell({ r: ri + 1, c: ci })] = { t: typeof v === 'number' ? 'n' : 's', v };
    });
  });
  const sumCosto = rows.reduce((a, r) => a + (parseFloat(r.costoTotal ?? '') || 0), 0);
  const sumMB = rows.reduce((a, r) => a + (parseFloat(r.consumoMB ?? '') || 0), 0);
  ['TOTAL', rows.length, Math.round(sumCosto * 100) / 100, Math.round(sumMB * 100) / 100, Math.round(sumMB / 1024 * 100) / 100].forEach((v, ci) => {
    wsR[XLSX.utils.encode_cell({ r: sorted.length + 1, c: ci })] = { t: typeof v === 'number' ? 'n' : 's', v };
  });
  wsR['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: sorted.length + 1, c: 4 } });
  wsR['!cols'] = [{ wch: 28 }, { wch: 12 }, { wch: 18 }, { wch: 14 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsR, 'Resumen por Dispositivo');

  const suffix = rows.length < allCount ? `_filtrado_${rows.length}` : '_completo';
  XLSX.writeFile(wb, `cobro${suffix}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ── Shared util ──────────────────────────────────────────────────────────────
export function calcReglaEntel(fechaStr: string): string {
  if (!fechaStr || !fechaStr.trim()) return '';
  let d: Date;
  if (/^\d{4}-\d{2}-\d{2}/.test(fechaStr)) {
    d = new Date(fechaStr.slice(0, 10));
  } else if (/^\d{2}\/\d{2}\/\d{4}/.test(fechaStr)) {
    const [dd, mm, yyyy] = fechaStr.split('/');
    d = new Date(`${yyyy}-${mm}-${dd}`);
  } else return '';
  if (isNaN(d.getTime())) return '';
  return (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 30.4375) >= 6 ? 'SI' : 'NO';
}
