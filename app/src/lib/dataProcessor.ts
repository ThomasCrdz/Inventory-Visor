import type { InventoryRow, RawSources } from '../types';
import { normKey } from './utils';

type Row = Record<string, string>;

function buildImeiMap(rows: Row[] | null, col: string, minLen = 10): Map<string, Row> {
  const m = new Map<string, Row>();
  if (!rows) return m;
  rows.forEach(r => {
    const k = normKey(r[col] ?? '');
    if (k && k.length >= minLen) m.set(k, r);
  });
  return m;
}

function buildSimMap(simsRows: Row[] | null, podRows: Row[] | null): Map<string, string> {
  const m = new Map<string, string>();
  if (simsRows) {
    simsRows.forEach(r => {
      const i = normKey(r['IMEI'] ?? ''), c = normKey(r['ICC'] ?? '');
      if (i && c) m.set(i, c);
    });
  }
  if (podRows) {
    podRows.forEach(r => {
      const i = normKey(r['IMEI'] ?? '');
      const c = normKey(r['Subscriber ID #'] ?? r['MSISDN'] ?? '');
      if (i && c && !m.has(i)) m.set(i, c);
    });
  }
  return m;
}

function resolveMonitored(val: string | undefined): string {
  const m = (val ?? '').trim().toLowerCase();
  if (m === 't' || m === 'yes') return 'yes';
  if (m === 'f' || m === 'no') return 'no';
  return '';
}

function getSimFields(
  icc: string,
  prefix: string,
  simsIccMap: Map<string, Row>,
  podIccMap: Map<string, Row>,
): Record<string, string> {
  if (!icc) return {};
  const k = normKey(icc);
  const simsRow = simsIccMap.get(k);
  const podRow  = podIccMap.get(k);
  const row = simsRow ?? podRow;
  if (!row) return {};
  const o: Record<string, string> = {};
  const c = (v?: string) => (v ?? '').trim();
  if (simsRow) {
    o[prefix + 'P1']     = c(row['Personalizado 1']);
    o[prefix + 'P2']     = c(row['Personalizado 2']);
    o[prefix + 'Fecha']  = c(row['Fecha de activación']);
    o[prefix + 'Datos']  = c(row['Datos Mensual']);
    o[prefix + 'Estado'] = c(row['Estado']);
  } else {
    o[prefix + 'P1']     = c(row['Name']);
    o[prefix + 'P2']     = c(row['Group']);
    o[prefix + 'Fecha']  = c(row['Activation Date (UTC)']);
    o[prefix + 'Datos']  = c(row["Customer's Usage Bytes"]);
    o[prefix + 'Estado'] = c(row['Status']);
  }
  return o;
}

function buildRow(
  r: Row,
  invMap: Map<string, Row>,
  invImei: Map<string, Row>,
  invVeh: Map<string, Row[]>,
  hwMap: Map<string, Row>,
  hwAllMap: Map<string, Row>,
  simMap: Map<string, string>,
  invSerialMap: Map<string, Row>,
  simsIccMap: Map<string, Row>,
  podIccMap: Map<string, Row>,
  imeiExtraMap: Map<string, string>,
  ffcVersionesMap: Map<string, string>,
  invCustomMap: Map<string, Row>,
  invCustomImei: Map<string, Row>,
  invCustomVeh: Map<string, Row[]>,
  hwListMap: Map<string, string>,
): InventoryRow {
  const c = (v?: string) => (v ?? '').trim();

  const _rowCuenta = c(r.companyName ?? r.account);
  const _rowFlota  = c(r.fleetName ?? r.fleet);
  const vname  = c(r.vehicleName ?? r.vehicle);
  const vplate = c(r.vehiclePlate ?? r.vehicle_registration);
  const vehicle = vname || vplate;

  let cuenta = _rowCuenta, flota = _rowFlota;
  const _rowSerial = c(r.guardianSerial ?? r.serial_number);
  const _rowImeiG  = c(r.guardianImei ?? r.imei);
  let serial = '', imeiG = '';
  let imeiFFC = c(r.ffcImei);
  let imeiGPS = c(r.gpsImei);

  // Step 1: Inventory Custom (priority)
  let custFound: Row | null = null;
  if (_rowSerial) custFound = invCustomMap.get(_rowSerial.toLowerCase()) ?? null;
  if (!custFound && _rowImeiG) custFound = invCustomImei.get(normKey(_rowImeiG)) ?? null;
  if (!custFound && vehicle) {
    const cc = invCustomVeh.get(vehicle.toLowerCase()) ?? [];
    if (cc.length === 1) {
      custFound = cc[0];
    } else if (cc.length > 1) {
      const acct = _rowCuenta.toLowerCase(), fl = _rowFlota.toLowerCase();
      custFound =
        cc.find(x => (x.account ?? '').toLowerCase() === acct && (x.fleet ?? '').toLowerCase() === fl) ??
        cc.find(x => (x.account ?? '').toLowerCase() === acct) ??
        (!_rowSerial && !_rowImeiG
          ? cc.find(x => x.serial_number && x.serial_number.trim()) ?? null
          : null);
    }
  }
  if (custFound) {
    serial = c(custFound.serial_number);
    imeiG  = c(custFound.imei);
    if (custFound.account) cuenta = c(custFound.account);
    if (custFound.fleet)   flota  = c(custFound.fleet);
  }

  // Step 2: Inventory Report (fallback)
  let invFound: Row | null = null;
  if (serial) invFound = invMap.get(normKey(serial)) ?? null;
  if (!invFound && imeiG) invFound = invImei.get(normKey(imeiG)) ?? null;
  if (!invFound && vehicle) {
    const candidates = invVeh.get(vehicle.toLowerCase()) ?? [];
    if (candidates.length === 1) {
      invFound = candidates[0];
    } else if (candidates.length > 1) {
      const acctKey = cuenta.toLowerCase(), fleetKey = flota.toLowerCase();
      invFound =
        candidates.find(x => (x.account ?? '').toLowerCase() === acctKey && (x.fleet ?? '').toLowerCase() === fleetKey) ??
        candidates.find(x => (x.account ?? '').toLowerCase() === acctKey) ??
        candidates.find(x => x.serial_number && x.serial_number.trim()) ??
        null;
    }
  }
  if (invFound) {
    if (!serial)  serial  = c(invFound.serial_number  ?? invFound.guardianSerial);
    if (!imeiG)   imeiG   = c(invFound.imei           ?? invFound.guardianImei);
    if (!imeiFFC) imeiFFC = c(invFound.ffcImei);
    if (!imeiGPS) imeiGPS = c(invFound.gpsImei);
  }

  // Step 3: Unidades row (last resort)
  if (!serial) serial = _rowSerial;
  if (!imeiG)  imeiG  = _rowImeiG;

  // Step 4: IMEI Extra GEN3 provisional
  if (!imeiG && serial) {
    const extra = imeiExtraMap.get(serial.toLowerCase());
    if (extra) imeiG = extra;
  }

  // SIM resolution
  const kG   = normKey(imeiG);
  const kFFC = normKey(imeiFFC);
  const kGPS = normKey(imeiGPS);

  const simG = kG ? (simMap.get(kG) ?? '') : '';

  let simFFC = kFFC ? (simMap.get(kFFC) ?? '') : '';
  if (!simFFC && kFFC) {
    const hwFFC = hwAllMap.get(kFFC);
    if (hwFFC) simFFC = c(hwFFC.simchip ?? hwFFC.phonenumber);
  }

  let simGPS = '';
  if (kGPS) {
    simGPS = simMap.get(kGPS) ?? '';
    if (!simGPS) {
      const hwRow = hwAllMap.get(kGPS);
      if (hwRow?.simchip) simGPS = normKey(hwRow.simchip);
    }
  }

  // genGuardian
  const genGuardian = (() => {
    const s = serial.toUpperCase();
    if (s.startsWith('P1003100')) return 'GEN3';
    if (s.startsWith('P1002260') || s.startsWith('P1001229')) return 'GEN2';
    if (s.startsWith('P04025')) return 'GEN1';
    return '';
  })();

  // ffcModel: hwList → Hardware → ffcVersiones(MC30 refinement) → ffcVersiones direct
  const ffcModel = (() => {
    if (!imeiFFC) return '';
    const ki = normKey(imeiFFC);
    let model = hwListMap.get(ki) ?? '';
    if (!model) {
      const hwRow = hwAllMap.get(ki);
      if (hwRow) model = c(hwRow.hardware_model);
    }
    if (model.toUpperCase().includes('MC30')) {
      const ver = ffcVersionesMap.get(ki);
      if (ver && ver.toUpperCase() !== 'UNKNOWN') return ver;
    }
    if (!model) {
      const ver = ffcVersionesMap.get(ki);
      if (ver && ver.toUpperCase() !== 'UNKNOWN') return ver;
    }
    return model || c(r.ffcModel ?? r.ffc_model);
  })();

  // monitored + vehicleInstallation
  let monitored = '', vehicleInstallation = '';
  if (serial) {
    const cRow = invCustomMap.get(serial.toLowerCase());
    const iRow = invSerialMap.get(serial.toLowerCase());
    const fleetEnabled = cRow ? c(cRow.fleet_enabled) : '';
    if (fleetEnabled === 'f') {
      monitored = 'no';
    } else {
      monitored = resolveMonitored(cRow?.monitored) || resolveMonitored(iRow?.monitored);
    }
    vehicleInstallation = c(cRow?.device_registration ?? iRow?.device_registration);
  }

  // SIM detail fields
  const gSim  = getSimFields(simG,   'g',   simsIccMap, podIccMap);
  const fSim  = getSimFields(simFFC, 'ffc', simsIccMap, podIccMap);
  const gpSim = getSimFields(simGPS, 'gps', simsIccMap, podIccMap);

  const ultimoContacto = c(r.guardianLastComms).replace('.000', '').trim();

  return {
    cuenta, flota, vehicle, serial, imeiG, genGuardian, monitored, vehicleInstallation,
    simG,
    gP1:    gSim.gP1    ?? '', gP2:    gSim.gP2    ?? '',
    gFecha: gSim.gFecha ?? '', gDatos: gSim.gDatos ?? '', gEstado: gSim.gEstado ?? '',
    ultimoContacto,
    imeiFFC, simFFC,
    ffcP1:    fSim.ffcP1    ?? '', ffcP2:    fSim.ffcP2    ?? '',
    ffcFecha: fSim.ffcFecha ?? '', ffcDatos: fSim.ffcDatos ?? '', ffcEstado: fSim.ffcEstado ?? '',
    ffcModel,
    imeiGPS, simGPS,
    gpsP1:    gpSim.gpsP1    ?? '', gpsP2:    gpSim.gpsP2    ?? '',
    gpsFecha: gpSim.gpsFecha ?? '', gpsDatos: gpSim.gpsDatos ?? '', gpsEstado: gpSim.gpsEstado ?? '',
    temporal: '',
  };
}

export function processData(
  raw: RawSources,
  onProgress?: (i: number, total: number, msg?: string) => void,
): Promise<InventoryRow[]> {
  return new Promise(resolve => {
    // Combine Unidades + InvCustom (dedup by serial then vehicle)
    const _base: Row[] = raw.unidades ?? raw.invCustom ?? raw.inventory ?? [];
    let main: Row[] = [..._base];

    if (raw.unidades && raw.invCustom) {
      const _uSerials  = new Set(_base.map(r => (r.guardianSerial ?? r.serial_number ?? '').trim().toLowerCase()).filter(Boolean));
      const _uVehicles = new Set(_base.map(r => (r.vehicleName ?? r.vehicle ?? '').trim().toLowerCase()).filter(Boolean));
      const _extra = raw.invCustom.filter(r => {
        const s = (r.serial_number ?? '').trim().toLowerCase();
        const v = (r.vehicle ?? '').trim().toLowerCase();
        return s && !_uSerials.has(s) && (!v || !_uVehicles.has(v));
      });
      main = [..._base, ..._extra];
    }

    // Dedup by vehicle name: keep row WITH serial
    const _vehMap = new Map<string, Row>();
    main.forEach(r => {
      const v = (r.vehicleName ?? r.vehicle ?? '').trim().toLowerCase();
      const s = (r.guardianSerial ?? r.serial_number ?? '').trim();
      if (!v) return;
      if (!_vehMap.has(v)) { _vehMap.set(v, r); }
      else {
        const existing = _vehMap.get(v)!;
        const existingSerial = (existing.guardianSerial ?? existing.serial_number ?? '').trim();
        if (s && !existingSerial) _vehMap.set(v, r);
      }
    });
    main = main.filter(r => {
      const v = (r.vehicleName ?? r.vehicle ?? '').trim().toLowerCase();
      if (!v) return true;
      return _vehMap.get(v) === r;
    });

    if (!main.length) { resolve([]); return; }

    // Build all lookup maps
    const invMap       = buildImeiMap(raw.inventory,   'serial_number');
    const invImei      = buildImeiMap(raw.inventory,   'imei');
    const invVeh       = new Map<string, Row[]>();
    if (raw.inventory) {
      raw.inventory.forEach(r => {
        const v = (r.vehicle ?? r.vehicleName ?? '').toLowerCase().trim();
        if (v) { if (!invVeh.has(v)) invVeh.set(v, []); invVeh.get(v)!.push(r); }
      });
    }
    const invSerialMap = new Map<string, Row>();
    if (raw.inventory) {
      raw.inventory.forEach(r => {
        const k = (r.serial_number ?? '').trim().toLowerCase(); if (k) invSerialMap.set(k, r);
      });
    }
    const hwMap    = buildImeiMap(raw.hardware, 'imei');
    const hwAllMap = new Map<string, Row>();
    if (raw.hardware) {
      raw.hardware.forEach(r => {
        const k = normKey(r['imei'] ?? ''); if (k) hwAllMap.set(k, r);
      });
    }
    const simMap = buildSimMap(raw.sims, raw.pod);

    const invCustomMap  = new Map<string, Row>();
    const invCustomImei = new Map<string, Row>();
    const invCustomVeh  = new Map<string, Row[]>();
    if (raw.invCustom) {
      raw.invCustom.forEach(r => {
        const ks = (r.serial_number ?? '').trim().toLowerCase(); if (ks) invCustomMap.set(ks, r);
        const ki = normKey(r.imei ?? ''); if (ki && ki.length >= 10) invCustomImei.set(ki, r);
        const kv = (r.vehicle ?? '').toLowerCase().trim();
        if (kv) { if (!invCustomVeh.has(kv)) invCustomVeh.set(kv, []); invCustomVeh.get(kv)!.push(r); }
      });
    }

    const simsIccMap = new Map<string, Row>();
    if (raw.sims) {
      raw.sims.forEach(r => { const k = normKey(r['ICC'] ?? ''); if (k && k.length >= 10) simsIccMap.set(k, r); });
    }
    const podIccMap = new Map<string, Row>();
    if (raw.pod) {
      raw.pod.forEach(r => { const k = normKey(r['Subscriber ID #'] ?? ''); if (k && k.length >= 10) podIccMap.set(k, r); });
    }

    const imeiExtraMap = new Map<string, string>();
    if (raw.imeiExtra) {
      raw.imeiExtra.forEach(r => {
        const k = (r.serial_number ?? '').trim().toLowerCase();
        const v = (r.imei ?? '').trim();
        if (k && v) imeiExtraMap.set(k, v);
      });
    }

    const ffcVersionesMap = new Map<string, string>();
    if (raw.ffcVersiones) {
      raw.ffcVersiones.forEach(r => {
        const k = normKey(r['Imei'] ?? '');
        const v = (r['[Modelo] Howen'] ?? '').trim();
        if (k && v) ffcVersionesMap.set(k, v);
      });
    }

    const hwListMap = new Map<string, string>();
    if (raw.hwList) {
      raw.hwList.forEach(r => {
        const k = normKey(r['imei'] ?? r['IMEI'] ?? '');
        if (k && k.length >= 10) hwListMap.set(k, (r['name'] ?? r['Name'] ?? '').trim());
      });
    }

    const result: InventoryRow[] = [];
    let i = 0;
    const CHUNK = 500;

    function tick() {
      const end = Math.min(i + CHUNK, main.length);
      for (; i < end; i++) {
        result.push(buildRow(
          main[i], invMap, invImei, invVeh, hwMap, hwAllMap, simMap,
          invSerialMap, simsIccMap, podIccMap, imeiExtraMap, ffcVersionesMap,
          invCustomMap, invCustomImei, invCustomVeh, hwListMap,
        ));
      }
      onProgress?.(i, main.length);
      if (i < main.length) setTimeout(tick, 0);
      else resolve(result);
    }
    setTimeout(tick, 0);
  });
}
