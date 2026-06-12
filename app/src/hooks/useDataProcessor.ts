import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { RawSources, InventoryRow, LogEntry, ProcessStats, ProcessState } from '../types';
import { processData } from '../lib/dataProcessor';
import { timestamp } from '../lib/utils';

export function useDataProcessor() {
  const [state, setState] = useState<ProcessState>('idle');
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [result, setResult] = useState<InventoryRow[]>([]);
  const [stats, setStats] = useState<ProcessStats | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((level: LogEntry['level'], msg: string) => {
    setLogs(prev => [...prev, { ts: timestamp(), level, msg }]);
  }, []);

  const process = useCallback(async (raw: RawSources) => {
    const main = raw.unidades ?? raw.inventory;
    if (!main) return;

    setState('processing');
    setProgress(5);
    setProgressMsg('Construyendo índices...');
    addLog('info', 'Iniciando procesamiento...');

    try {
      const rows = await processData(raw, (i, total) => {
        setProgress(Math.round((i / total) * 85) + 10);
        setProgressMsg(`${i.toLocaleString()} / ${total.toLocaleString()}`);
      });

      setResult(rows);
      setStats({
        total: rows.length,
        withSerial: rows.filter(r => r.serial).length,
        withSim:    rows.filter(r => r.simG).length,
        withGPS:    rows.filter(r => r.imeiGPS).length,
      });
      setProgress(100);
      setProgressMsg('¡Listo!');
      addLog('ok', `Completo: ${rows.length.toLocaleString()} registros`);
      toast.success(`✓ ${rows.length.toLocaleString()} registros procesados`);
      setState('done');
      setTimeout(() => { setProgress(0); setProgressMsg(''); }, 700);
    } catch (err: unknown) {
      addLog('err', (err as Error).message);
      setState('error');
    }
  }, [addLog]);

  const reset = useCallback(() => {
    setState('idle');
    setProgress(0);
    setProgressMsg('');
    setResult([]);
    setStats(null);
    setLogs([]);
  }, []);

  return { state, progress, progressMsg, result, stats, logs, process, reset, addLog };
}
