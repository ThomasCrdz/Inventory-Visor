import { useEffect, useRef } from 'react';
import type { LogEntry } from '@/types';
import { cn } from '@/lib/utils';

interface LogBoxProps {
  logs: LogEntry[];
}

const levelClass: Record<LogEntry['level'], string> = {
  ok:   'text-fgreen',
  warn: 'text-famber',
  err:  'text-fred',
  info: 'text-t2',
};

export function LogBox({ logs }: LogBoxProps) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [logs]);

  if (logs.length === 0) return null;

  return (
    <div className="mt-[14px] bg-s2 border border-b1 rounded-[7px] overflow-hidden">
      <div className="px-3 py-[7px] text-[11px] font-mono text-t3 uppercase tracking-[1px] border-b border-b1 flex justify-between">
        <span>Log</span>
        <span>{logs.length}</span>
      </div>
      <div
        ref={bodyRef}
        className="px-3 py-2 max-h-[120px] overflow-y-auto font-mono text-[12px] leading-[1.9]"
      >
        {logs.map((entry, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-t4 min-w-[56px] shrink-0">{entry.ts}</span>
            <span className={cn(levelClass[entry.level])}>{entry.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
