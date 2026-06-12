export function parseCSV(text: string): Record<string, string>[] {
  text = text.replace(/^﻿/, '');
  const lines = text.split(/\r?\n/);
  let sep = ',';
  let start = 0;

  if (lines[0].trim().startsWith('sep=')) {
    sep = lines[0].trim().slice(4).trim() || ',';
    start = 1;
  } else if ((lines[0].match(/;/g) ?? []).length > (lines[0].match(/,/g) ?? []).length) {
    sep = ';';
  }

  const parseRow = (line: string): string[] => {
    const out: string[] = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (c === sep && !inQ) {
        out.push(cur); cur = '';
      } else {
        cur += c;
      }
    }
    out.push(cur);
    return out;
  };

  const cv = (v: string) => v.replace(/^=?"?|"?$/g, '').trim();
  const hdrs = parseRow(lines[start]).map(cv);
  const rows: Record<string, string>[] = [];

  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const vals = parseRow(line);
    if (vals.every(v => !v.trim())) continue;
    const obj: Record<string, string> = {};
    hdrs.forEach((h, idx) => { obj[h] = cv(vals[idx] ?? ''); });
    rows.push(obj);
  }
  return rows;
}
