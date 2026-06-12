import { useState, useCallback } from 'react';
import type { RawSources, SourceKey, LogEntry } from '../types';
import { parseCSV } from '../lib/csvParser';
import { timestamp } from '../lib/utils';

export type FileStatus = 'idle' | 'ok' | 'error';

export interface SourceState {
  status: FileStatus;
  rowCount: number;
  fileName: string;
}

export type SourceStates = Record<SourceKey, SourceState>;

const IDLE: SourceState = { status: 'idle', rowCount: 0, fileName: '' };

const initRaw = (): RawSources => ({
  unidades: null, inventory: null, hardware: null, sims: null, pod: null,
});

const initStates = (): SourceStates => ({
  unidades: { ...IDLE }, inventory: { ...IDLE },
  hardware: { ...IDLE }, sims: { ...IDLE }, pod: { ...IDLE },
});

export function useCSVLoader() {
  const [raw, setRaw] = useState<RawSources>(initRaw);
  const [sourceStates, setSourceStates] = useState<SourceStates>(initStates);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((level: LogEntry['level'], msg: string) => {
    setLogs(prev => [...prev, { ts: timestamp(), level, msg }]);
  }, []);

  const loadSource = useCallback((key: SourceKey, file: File) => {
    const fr = new FileReader();
    fr.onload = (e) => {
      try {
        const rows = parseCSV(e.target!.result as string);
        setRaw(prev => ({ ...prev, [key]: rows }));
        setSourceStates(prev => ({
          ...prev,
          [key]: { status: 'ok', rowCount: rows.length, fileName: file.name },
        }));
        addLog('ok', `[${key.toUpperCase()}] ${file.name} · ${rows.length.toLocaleString()} filas`);
      } catch (err: unknown) {
        setSourceStates(prev => ({
          ...prev,
          [key]: { status: 'error', rowCount: 0, fileName: file.name },
        }));
        addLog('err', `[${key.toUpperCase()}] ${(err as Error).message}`);
      }
    };
    fr.readAsText(file, 'UTF-8');
  }, [addLog]);

  const reset = useCallback(() => {
    setRaw(initRaw());
    setSourceStates(initStates());
    setLogs([]);
  }, []);

  return { raw, sourceStates, logs, loadSource, reset, addLog };
}
