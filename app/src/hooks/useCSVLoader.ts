import { useState, useCallback } from 'react';
import type { RawSources, SourceKey, LogEntry } from '../types';
import { parseCSV } from '../lib/csvParser';
import { timestamp } from '../lib/utils';
import * as XLSX from 'xlsx';

export type FileStatus = 'idle' | 'ok' | 'error';

export interface SourceState {
  status: FileStatus;
  rowCount: number;
  fileName: string;
}

export type SourceStates = Record<SourceKey, SourceState>;

const IDLE: SourceState = { status: 'idle', rowCount: 0, fileName: '' };

const initRaw = (): RawSources => ({
  unidades: null, inventory: null, invCustom: null, hardware: null,
  sims: null, pod: null, imeiExtra: null, ffcVersiones: null, hwList: null,
});

const initStates = (): SourceStates => ({
  unidades: { ...IDLE }, inventory: { ...IDLE }, invCustom: { ...IDLE },
  hardware: { ...IDLE }, sims: { ...IDLE }, pod: { ...IDLE },
  imeiExtra: { ...IDLE }, ffcVersiones: { ...IDLE }, hwList: { ...IDLE },
});

// Keys that can be XLSX in addition to CSV
const XLSX_KEYS: Set<SourceKey> = new Set(['invCustom', 'imeiExtra', 'ffcVersiones', 'hwList']);

function readXLSX(file: File): Record<string, string>[] {
  // Synchronous XLSX parse inside FileReader.onload (called from ArrayBuffer)
  // Returns rows as Record<string,string>[]
  throw new Error('Use loadXLSXAsync');
}

export function useCSVLoader() {
  const [raw, setRaw] = useState<RawSources>(initRaw);
  const [sourceStates, setSourceStates] = useState<SourceStates>(initStates);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((level: LogEntry['level'], msg: string) => {
    setLogs(prev => [...prev, { ts: timestamp(), level, msg }]);
  }, []);

  const loadSource = useCallback((key: SourceKey, file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const isXlsx = XLSX_KEYS.has(key) && (ext === 'xlsx' || ext === 'xls');

    const onSuccess = (rows: Record<string, string>[]) => {
      setRaw(prev => ({ ...prev, [key]: rows }));
      setSourceStates(prev => ({
        ...prev,
        [key]: { status: 'ok', rowCount: rows.length, fileName: file.name },
      }));
      addLog('ok', `[${key.toUpperCase()}] ${file.name} · ${rows.length.toLocaleString()} filas`);
    };

    const onError = (err: unknown) => {
      setSourceStates(prev => ({
        ...prev,
        [key]: { status: 'error', rowCount: 0, fileName: file.name },
      }));
      addLog('err', `[${key.toUpperCase()}] ${(err as Error).message}`);
    };

    const fr = new FileReader();
    if (isXlsx) {
      fr.onload = (e) => {
        try {
          const wb = XLSX.read(new Uint8Array(e.target!.result as ArrayBuffer), { type: 'array', raw: false });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
          onSuccess(rows);
        } catch (err) { onError(err); }
      };
      fr.onerror = () => onError(new Error('Error al leer XLSX'));
      fr.readAsArrayBuffer(file);
    } else {
      fr.onload = (e) => {
        try {
          onSuccess(parseCSV(e.target!.result as string));
        } catch (err) { onError(err); }
      };
      fr.onerror = () => onError(new Error('Error al leer CSV'));
      fr.readAsText(file, 'UTF-8');
    }
  }, [addLog]);

  const reset = useCallback(() => {
    setRaw(initRaw());
    setSourceStates(initStates());
    setLogs([]);
  }, []);

  return { raw, sourceStates, logs, loadSource, reset, addLog };
}
