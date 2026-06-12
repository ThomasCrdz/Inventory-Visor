import * as XLSX from 'xlsx';
import type { InventoryRow } from '../types';
import { EXPORT_HDRS, EXPORT_FIELDS } from './constants';

function buildSheet(rows: InventoryRow[]): XLSX.WorkSheet {
  const ct = (v: string) => ({ t: 's' as const, v: v ?? '', z: '@' });
  const ws: XLSX.WorkSheet = {};
  const range = { s: { r: 0, c: 0 }, e: { r: rows.length, c: EXPORT_HDRS.length - 1 } };
  EXPORT_HDRS.forEach((h, c) => {
    ws[XLSX.utils.encode_cell({ r: 0, c })] = { t: 's', v: h };
  });
  rows.forEach((row, ri) => {
    EXPORT_FIELDS.forEach((f, c) => {
      ws[XLSX.utils.encode_cell({ r: ri + 1, c })] = ct(row[f]);
    });
  });
  ws['!ref'] = XLSX.utils.encode_range(range);
  ws['!cols'] = [
    { wch: 30 }, { wch: 30 }, { wch: 20 }, { wch: 22 }, { wch: 18 },
    { wch: 10 }, { wch: 22 }, { wch: 18 }, { wch: 22 }, { wch: 18 },
    { wch: 18 }, { wch: 22 }, { wch: 20 },
  ];
  return ws;
}

export function exportAll(rows: InventoryRow[]) {
  if (!rows.length) return;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildSheet(rows), 'Inventario');
  XLSX.writeFile(wb, `inventario_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportFiltered(rows: InventoryRow[], allCount: number) {
  if (!rows.length) return;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildSheet(rows), 'Filtrado');
  const suffix = rows.length < allCount ? `_filtrado_${rows.length}` : '_completo';
  XLSX.writeFile(wb, `inventario${suffix}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
