import * as XLSX from 'xlsx';
import type { InventoryRow } from '../types';
import { COL_ALIASES, VCOLS } from './constants';

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

  const emptyRow = (): InventoryRow => ({
    cuenta: '', flota: '', vehicle: '', serial: '', imeiG: '',
    genGuardian: '', simG: '', imeiFFC: '', simFFC: '', ffcModel: '',
    imeiGPS: '', simGPS: '', temporal: '',
  });

  const rows: InventoryRow[] = [];
  for (let i = hi + 1; i < raw.length; i++) {
    const r = raw[i];
    if (r.every(v => v === '' || v == null)) continue;
    const obj = emptyRow();
    hdrs.forEach((key, idx) => {
      if (key) obj[key] = String(r[idx] ?? '').trim();
    });
    rows.push(obj);
  }
  return rows;
}

// Also handle CSV files in visor
export function parseCSVFile(file: File): Promise<InventoryRow[]> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = async (e) => {
      try {
        const { parseCSV } = await import('./csvParser');
        const raw = parseCSV(e.target!.result as string);
        const emptyRow = (): InventoryRow => ({
          cuenta: '', flota: '', vehicle: '', serial: '', imeiG: '',
          genGuardian: '', simG: '', imeiFFC: '', simFFC: '', ffcModel: '',
          imeiGPS: '', simGPS: '', temporal: '',
        });
        const rows = raw.map(r => {
          const obj = emptyRow();
          Object.entries(r).forEach(([k, v]) => {
            const key = COL_ALIASES[k.trim().toUpperCase()];
            if (key) obj[key] = v;
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
  if (file.name.toLowerCase().endsWith('.csv')) return parseCSVFile(file);
  return parseXLSXFile(file);
}
