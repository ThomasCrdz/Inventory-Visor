import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { SourceKey } from '@/types';
import { useFolderLoader } from '@/hooks/useFolderLoader';

interface FolderLoaderProps {
  onFile: (key: SourceKey, file: File) => void;
  addLog: (level: 'ok' | 'warn' | 'err' | 'info', msg: string) => void;
}

export function FolderLoader({ onFile, addLog }: FolderLoaderProps) {
  const { hasSupport, loading, savedHandle, pickFolder, refreshFolder, restoreHandle } =
    useFolderLoader(onFile, addLog);

  useEffect(() => { restoreHandle(); }, [restoreHandle]);

  if (!hasSupport) return null;

  return (
    <div className="flex items-center gap-3 mb-[14px]">
      <Button variant="primary" size="sm" onClick={pickFolder} disabled={loading}>
        {loading ? '⏳ Cargando…' : '📂 Seleccionar carpeta'}
      </Button>

      {savedHandle && !loading && (
        <Button variant="green" size="sm" onClick={refreshFolder}>
          🔄 Actualizar
        </Button>
      )}
    </div>
  );
}
