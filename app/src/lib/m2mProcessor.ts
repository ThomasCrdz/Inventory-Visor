import type { RawSources, M2MRow, CobroRow } from '../types';
import { normKey } from './utils';
import { calcReglaEntel } from './exportXLSX';

type Row = Record<string, string>;
const c = (v?: string | number) => String(v ?? '').trim();

export function deviceToType(disp: string): string {
  const d = disp.toUpperCase();
  if (d.includes('GEN3') || d.includes('P1003100')) return 'GUARDIAN GEN3';
  if (d.includes('GEN2') || d.includes('P1002260') || d.includes('P1001229')) return 'GUARDIAN GEN2';
  if (d.includes('GEN1') || d.includes('P04025')) return 'GUARDIAN GEN1';
  if (d.includes('JC400')) return 'JC400';
  if (d.includes('MC30')) return 'MC30-02';
  if (d.includes('ME40')) return 'ME40';
  if (d.includes('MA80') || d.includes('MDVR')) return 'MDVR';
  if (d.includes('FFCLIVE') || d.includes('FFC LIVE') || d.includes('LIVE')) return 'FFCLIVE';
  if (d.includes('STARLINK') || d.includes('RUT200') || d.includes('ROUTER') || d.includes('EC200')) return 'ROUTER / STARLINK';
  return disp.trim();
}

export function buildM2mRows(raw: RawSources): M2MRow[] {
  if (!raw.sims) return [];

  const invCustomByImei = new Map<string, Row>();
  const invCustomBySerial = new Map<string, Row>();
  if (raw.invCustom) {
    raw.invCustom.forEach(r => {
      const ki = normKey(r.imei ?? '');
      const ks = (r.serial_number ?? '').trim().toLowerCase();
      if (ki && ki.length >= 10) invCustomByImei.set(ki, r);
      if (ks) invCustomBySerial.set(ks, r);
    });
  }

  const hwByImei = new Map<string, Row>();
  if (raw.hardware) {
    raw.hardware.forEach(r => {
      const ki = normKey(r.imei ?? '');
      if (ki) hwByImei.set(ki, r);
    });
  }

  const invByImei = new Map<string, Row>();
  if (raw.inventory) {
    raw.inventory.forEach(r => {
      const ki = normKey(r.imei ?? '');
      if (ki && ki.length >= 10) invByImei.set(ki, r);
    });
  }

  // imeiExtra: serial → imei (for GEN3 provisional)
  const imeiExtraByImei = new Map<string, string>();
  if (raw.imeiExtra) {
    raw.imeiExtra.forEach(r => {
      const ki = normKey(r.imei ?? '');
      const ks = (r.serial_number ?? '').trim().toLowerCase();
      if (ki && ks) imeiExtraByImei.set(ki, ks);
    });
  }

  return raw.sims.map(sim => {
    const icc  = normKey(sim['ICC'] ?? '') || c(sim['ICC']);
    const imei = normKey(sim['IMEI'] ?? '') || c(sim['IMEI']);
    const dispositivo    = c(sim['Dispositivo']);
    const tipoDispositivo = deviceToType(dispositivo);
    const platform       = c(sim['Plataforma'] ?? sim['Platform']);
    const estado         = c(sim['Estado']);
    const plan           = c(sim['Plan']);
    const mb             = parseFloat(c(sim['Datos Mensual']).replace(',', '.')) || 0;
    const p1             = c(sim['Personalizado 1']);
    const p2             = c(sim['Personalizado 2']);
    const fechaActivacion = c(sim['Fecha de activación']);

    // Identify vehicle via IMEI lookup chain
    let cuenta = '', flota = '', vehiculo = '', serial = '', modeloHW = '', marcaHW = '';
    let monitored = '', fuenteID = 'Sin identificar';

    const ki = normKey(imei);
    const custRow = ki ? invCustomByImei.get(ki) : undefined;
    if (custRow) {
      cuenta = c(custRow.account);
      flota  = c(custRow.fleet);
      vehiculo = c(custRow.vehicle ?? custRow.vehicleName);
      serial = c(custRow.serial_number);
      monitored = resolveMonitored(c(custRow.monitored ?? custRow.fleet_enabled));
      fuenteID = 'Custom';
    } else {
      const hwRow = ki ? hwByImei.get(ki) : undefined;
      if (hwRow) {
        modeloHW = c(hwRow.hardware_model);
        marcaHW  = c(hwRow.hardware_brand ?? hwRow.brand);
        const hwSerial = c(hwRow.serial_number ?? hwRow.guardianSerial);
        if (hwSerial) {
          const custBySerial = invCustomBySerial.get(hwSerial.toLowerCase());
          if (custBySerial) {
            cuenta = c(custBySerial.account);
            flota  = c(custBySerial.fleet);
            vehiculo = c(custBySerial.vehicle);
            serial = hwSerial;
            monitored = resolveMonitored(c(custBySerial.monitored ?? custBySerial.fleet_enabled));
            fuenteID = 'Hardware+Custom';
          } else {
            serial = hwSerial;
            fuenteID = 'Hardware';
          }
        } else {
          fuenteID = 'Hardware';
        }
      } else {
        const invRow = ki ? invByImei.get(ki) : undefined;
        if (invRow) {
          cuenta = c(invRow.account ?? invRow.companyName);
          flota  = c(invRow.fleet   ?? invRow.fleetName);
          vehiculo = c(invRow.vehicle ?? invRow.vehicleName);
          serial   = c(invRow.serial_number ?? invRow.guardianSerial);
          monitored = resolveMonitored(c(invRow.monitored));
          fuenteID = 'Inventory';
        } else if (ki && imeiExtraByImei.has(ki)) {
          serial = imeiExtraByImei.get(ki)!;
          fuenteID = 'IMEIExtra';
        }
      }
    }

    return {
      icc, imei, dispositivo, tipoDispositivo, platform,
      cuenta, flota, vehiculo, serial, modeloHW, marcaHW, monitored,
      p1, p2, estado, plan,
      datosMB: mb,
      datosGB: Math.round(mb / 1024 * 10000) / 10000,
      fechaActivacion, fuenteID,
    };
  });
}

function resolveMonitored(val: string): string {
  const m = val.trim().toLowerCase();
  if (m === 't' || m === 'yes') return 'yes';
  if (m === 'f' || m === 'no') return 'no';
  return '';
}

export function buildCobroRows(
  hdrs: string[],
  cobroRaw: Record<string, string | number>[],
  m2mRows: M2MRow[],
): CobroRow[] {
  // Build m2m lookup by ICC
  const m2mByIcc = new Map<string, M2MRow>();
  m2mRows.forEach(r => { if (r.icc) m2mByIcc.set(normKey(r.icc), r); });

  // Detect ICC column name in cobroRaw
  const iccHdr = hdrs.find(h => h.trim().toUpperCase() === 'ICC') ?? 'ICC';
  const findHdr = (keys: string[]) => hdrs.find(h => keys.includes(h.trim().toUpperCase())) ?? '';

  const empresaHdr       = findHdr(['EMPRESA', 'OPERADOR', 'CARRIER']);
  const estadoHdr        = findHdr(['ESTADO', 'STATUS']);
  const planHdr          = findHdr(['PLAN', 'DESCRIPCION PLAN']);
  const tipoSimHdr       = findHdr(['TIPO SIM', 'TIPO']);
  const mbPlanHdr        = findHdr(['MB PLAN', 'MEGAS PLAN', 'PLAN MB']);
  const consumoMBHdr     = findHdr(['CONSUMO MB', 'CONSUMO', 'USO MB', 'DATOS MB']);
  const costoPlanHdr     = findHdr(['COSTO PLAN', 'CARGO RECURRENTE', 'PRECIO PLAN']);
  const costoTotalHdr    = findHdr(['COSTO TOTAL', 'CARGO TOTAL', 'TOTAL']);
  const monedaHdr        = findHdr(['MONEDA', 'CURRENCY']);
  const imeiHdr          = findHdr(['IMEI']);

  return cobroRaw.map(row => {
    const iccRaw = c(row[iccHdr]);
    const icc    = normKey(iccRaw) || iccRaw;
    const m2m    = icc ? m2mByIcc.get(normKey(icc)) : undefined;

    const consumoMBStr = c(row[consumoMBHdr]);
    const fechaAct = m2m?.fechaActivacion ?? '';

    return {
      icc,
      empresa:         c(row[empresaHdr]),
      estado:          c(row[estadoHdr]),
      plan:            c(row[planHdr]),
      tipoSim:         c(row[tipoSimHdr]),
      mbPlan:          c(row[mbPlanHdr]),
      consumoMB:       consumoMBStr,
      costoPlan:       c(row[costoPlanHdr]),
      costoTotal:      c(row[costoTotalHdr]),
      moneda:          c(row[monedaHdr]),
      imei:            normKey(c(row[imeiHdr])) || c(row[imeiHdr]),
      tipoDispositivo: m2m?.tipoDispositivo ?? '',
      cuenta:          m2m?.cuenta    ?? '',
      flota:           m2m?.flota     ?? '',
      vehiculo:        m2m?.vehiculo  ?? '',
      serial:          m2m?.serial    ?? '',
      p1:              m2m?.p1        ?? '',
      p2:              m2m?.p2        ?? '',
      fuenteID:        m2m?.fuenteID  ?? (m2m ? 'M2M' : 'Sin identificar'),
      monitored:       m2m?.monitored ?? '',
      reglaEntel:      calcReglaEntel(fechaAct),
    };
  });
}
