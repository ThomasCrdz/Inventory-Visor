import type { InventoryRow, RawSources } from '../types';
import { normKey } from './utils';

type Row = Record<string, string>;

function buildImeiMap(rows: Row[] | null, col: string): Map<string, Row> {
  const m = new Map<string, Row>();
  if (!rows) return m;
  rows.forEach(r => {
    const k = normKey(r[col]);
    if (k && k.length >= 10) m.set(k, r);
  });
  return m;
}

function buildSimMap(simsRows: Row[] | null, podRows: Row[] | null): Map<string, string> {
  const m = new Map<string, string>();
  if (simsRows) {
    simsRows.forEach(r => {
      const i = normKey(r['IMEI']), c = normKey(r['ICC']);
      if (i && c) m.set(i, c);
    });
  }
  if (podRows) {
    podRows.forEach(r => {
      const i = normKey(r['IMEI']);
      const c = normKey(r['Subscriber ID #'] ?? r['MSISDN'] ?? '');
      if (i && c && !m.has(i)) m.set(i, c);
    });
  }
  return m;
}

function buildRow(
  r: Row,
  invMap: Map<string, Row>,
  invImei: Map<string, Row>,
  invVeh: Map<string, Row>,
  hwMap: Map<string, Row>,
  simMap: Map<string, string>,
  hasInventory: boolean,
): InventoryRow {
  const c = (v?: string) => (v ?? '').trim();

  const cuenta  = c(r.companyName ?? r.account);
  const flota   = c(r.fleetName ?? r.fleet);
  const vname   = c(r.vehicleName ?? r.vehicle);
  const vplate  = c(r.vehiclePlate ?? r.vehicle_registration);
  const vehicle = vname || vplate;

  let serial  = c(r.guardianSerial ?? r.serial_number);
  let imeiG   = c(r.guardianImei ?? r.imei);
  let imeiFFC = c(r.ffcImei);
  let imeiGPS = c(r.gpsImei);

  if (hasInventory) {
    let inv: Row | undefined;
    if (serial)  inv = invMap.get(normKey(serial));
    if (!inv && imeiG)   inv = invImei.get(normKey(imeiG));
    if (!inv && vehicle) inv = invVeh.get(vehicle.toLowerCase());
    if (inv) {
      if (!serial)  serial  = c(inv.serial_number  ?? inv.guardianSerial);
      if (!imeiG)   imeiG   = c(inv.imei           ?? inv.guardianImei);
      if (!imeiFFC) imeiFFC = c(inv.ffcImei);
      if (!imeiGPS) imeiGPS = c(inv.gpsImei);
    }
  }

  const kG   = normKey(imeiG);
  const kFFC = normKey(imeiFFC);
  const kGPS = normKey(imeiGPS);

  const simG   = kG   ? (simMap.get(kG)   ?? '') : '';
  const simFFC = kFFC ? (simMap.get(kFFC) ?? '') : '';
  let simGPS = '';
  if (imeiGPS) {
    const hw = hwMap.get(kGPS);
    if (hw) simGPS = c(hw.simchip ?? hw.phonenumber);
  }
  if (!simGPS && kGPS) simGPS = simMap.get(kGPS) ?? '';

  const genGuardian = (() => {
    const s = serial.toUpperCase();
    if (s.startsWith('P1003100'))   return 'GEN3';
    if (s.startsWith('P1002260') || s.startsWith('P1001229')) return 'GEN2';
    if (s.startsWith('P04025'))     return 'GEN1';
    return '';
  })();

  const ffcModel = c(r.ffcModel ?? r.ffc_model);

  return {
    cuenta, flota, vehicle, serial, imeiG, genGuardian,
    simG, imeiFFC, simFFC, ffcModel, imeiGPS, simGPS, temporal: '',
  };
}

export function processData(
  raw: RawSources,
  onProgress?: (i: number, total: number) => void,
): Promise<InventoryRow[]> {
  return new Promise((resolve) => {
    const mainOrNull = raw.unidades ?? raw.inventory;
    if (!mainOrNull) { resolve([]); return; }
    const main: Row[] = mainOrNull;

    const invMap  = buildImeiMap(raw.inventory, 'serial_number');
    const invImei = buildImeiMap(raw.inventory, 'imei');
    const invVeh  = new Map<string, Row>();
    if (raw.inventory) {
      raw.inventory.forEach(r => {
        const v = (r.vehicle ?? r.vehicleName ?? '').toLowerCase().trim();
        if (v) invVeh.set(v, r);
      });
    }
    const hwMap      = buildImeiMap(raw.hardware, 'imei');
    const simMap     = buildSimMap(raw.sims, raw.pod);
    const hasInv     = !!raw.inventory;
    const result: InventoryRow[] = [];
    let i = 0;
    const CHUNK = 500;

    function tick() {
      const end = Math.min(i + CHUNK, main.length);
      for (; i < end; i++) {
        result.push(buildRow(main[i], invMap, invImei, invVeh, hwMap, simMap, hasInv));
      }
      onProgress?.(i, main.length);
      if (i < main.length) setTimeout(tick, 0);
      else resolve(result);
    }
    setTimeout(tick, 0);
  });
}
