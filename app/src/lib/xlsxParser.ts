import * as XLSX from 'xlsx';
import type { InventoryRow } from '../types';
import { COL_ALIASES, VCOLS } from './constants';

function emptyInventoryRow(): InventoryRow {
  return {
    cuenta: '', flota: '', vehicle: '', serial: '', imeiG: '',
    genGuardian: '', monitored: '', vehicleInstallation: '',
    simG: '', gP1: '', gP2: '', gFecha: '', gDatos: '', gEstado: '',
    ultimoContacto: '', imeiFFC: '', simFFC: '',
    ffcP1: '', ffcP2: '', ffcFecha: '', ffcDatos: '', ffcEstado: '',
    ffcModel: '', imeiGPS: '', simGPS: '',
    gpsP1: '', gpsP2: '', gpsFecha: '', gpsDatos: '', gpsEstado: '',
    temporal: '',
  };
}

function parseRows(raw: string[][]): InventoryRow[] {
  if (raw.length < 2) return [];

  // Find header row: first row with ≥3 recognized columns
  let hi = 0;
  for (let i = 0; i < Math.min(5, raw.length); i++) {
    const hits = raw[i].filter(c => COL_ALIASES[String(c).trim().toUpperCase()]);
    if (hits.length >= 3) { hi = i; break; }
  }

  const hdrs = raw[hi].map(h => {
    const u = String(h).trim().toUpperCase();
    return COL_ALIASES[u] ?? COL_ALIASES[u.replace(/[¿?]/g, '')] ?? null;
  });

  const rows: InventoryRow[] = [];
  for (let i = hi + 1; i < raw.length; i++) {
    const r = raw[i];
    if (r.every(v => v === '' || v == null)) continue;
    const obj = emptyInventoryRow();
    hdrs.forEach((key, idx) => {
      if (key) (obj as unknown as Record<string, string>)[key] = String(r[idx] ?? '').trim();
    });
    rows.push(obj);
  }
  return rows;
}

export function parseXLSXFile(file: File): Promise<InventoryRow[]> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array', raw: false });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' });
        resolve(parseRows(raw));
      } catch (err) {
        reject(err);
      }
    };
    fr.onerror = () => reject(new Error('Error al leer el archivo'));
    fr.readAsArrayBuffer(file);
  });
}

export function parseCSVFile(file: File): Promise<InventoryRow[]> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = async (e) => {
      try {
        const { parseCSV } = await import('./csvParser');
        const raw = parseCSV(e.target!.result as string);
        const rows = raw.map(r => {
          const obj = emptyInventoryRow();
          Object.entries(r).forEach(([k, v]) => {
            const key = COL_ALIASES[k.trim().toUpperCase()];
            if (key) (obj as unknown as Record<string, string>)[key] = v;
          });
          return obj;
        });
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    fr.onerror = () => reject(new Error('Error al leer CSV'));
    fr.readAsText(file, 'UTF-8');
  });
}

export function loadVisorFile(file: File): Promise<InventoryRow[]> {
  const ext = file.name.toLowerCase();
  if (ext.endsWith('.csv')) return parseCSVFile(file);
  return parseXLSXFile(file);
}

// ── Generic XLSX/CSV loader for M2M and Cobro pages ──────────────────────────
export function loadGenericFile(
  file: File,
  aliases: Record<string, string>,
  colKeys: string[],
): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const isXlsx = ext === 'xlsx' || ext === 'xls';

    const parse = (rawData: string[][]) => {
      if (rawData.length < 2) { resolve([]); return; }
      let hi = 0;
      for (let i = 0; i < Math.min(5, rawData.length); i++) {
        const hits = rawData[i].filter(c => aliases[String(c).trim().toUpperCase()]);
        if (hits.length >= 2) { hi = i; break; }
      }
      const hdrs = rawData[hi].map(h => {
        const u = String(h).trim().toUpperCase();
        return aliases[u] ?? null;
      });
      const rows: Record<string, string>[] = [];
      for (let i = hi + 1; i < rawData.length; i++) {
        const r = rawData[i];
        if (r.every(v => v === '' || v == null)) continue;
        const obj: Record<string, string> = {};
        colKeys.forEach(k => obj[k] = '');
        hdrs.forEach((key, idx) => { if (key) obj[key] = String(rawData[i][idx] ?? '').trim(); });
        rows.push(obj);
      }
      resolve(rows);
    };

    const fr = new FileReader();
    if (isXlsx) {
      fr.onload = (e) => {
        try {
          const wb = XLSX.read(new Uint8Array(e.target!.result as ArrayBuffer), { type: 'array', raw: false });
          const ws = wb.Sheets[wb.SheetNames[0]];
          parse(XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' }));
        } catch (err) { reject(err); }
      };
      fr.onerror = () => reject(new Error('Error al leer XLSX'));
      fr.readAsArrayBuffer(file);
    } else {
      fr.onload = async (e) => {
        try {
          const { parseCSV } = await import('./csvParser');
          const obj = parseCSV(e.target!.result as string);
          const asArrays: string[][] = [];
          if (obj.length > 0) {
            asArrays.push(Object.keys(obj[0]));
            obj.forEach(r => asArrays.push(Object.values(r)));
          }
          parse(asArrays);
        } catch (err) { reject(err); }
      };
      fr.onerror = () => reject(new Error('Error al leer CSV'));
      fr.readAsText(file, 'UTF-8');
    }
  });
}

// ── Cobro: load Excel with named sheet detection ─────────────────────────────
export function loadCobroFile(
  file: File,
): Promise<{ hdrs: string[]; rows: Record<string, string | number>[] }> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target!.result as ArrayBuffer), { type: 'array', raw: false });
        const sheetName = wb.SheetNames.includes('Detalle') ? 'Detalle' : wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json<(string | number)[]>(ws, { header: 1, defval: '' });

        // Find header row (look for ICC column)
        let hi = 0;
        for (let i = 0; i < Math.min(10, rawData.length); i++) {
          if (rawData[i].some(v => String(v).trim().toUpperCase() === 'ICC')) { hi = i; break; }
        }
        const hdrs = rawData[hi].map(h => String(h).trim());
        const rows: Record<string, string | number>[] = [];
        for (let i = hi + 1; i < rawData.length; i++) {
          const r = rawData[i];
          if (r.every(v => v === '' || v == null)) continue;
          const obj: Record<string, string | number> = {};
          hdrs.forEach((h, idx) => { obj[h] = r[idx] ?? ''; });
          rows.push(obj);
        }
        resolve({ hdrs, rows });
      } catch (err) { reject(err); }
    };
    fr.onerror = () => reject(new Error('Error al leer archivo de Cobro'));
    fr.readAsArrayBuffer(file);
  });
}
