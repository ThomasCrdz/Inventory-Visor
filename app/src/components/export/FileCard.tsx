import type { SourceKey } from '@/types';
import type { SourceState } from '@/hooks/useCSVLoader';
import { cn } from '@/lib/utils';

interface FileCardProps {
  sourceKey: SourceKey;
  icon: string;
  name: string;
  role: string;
  accept: string;
  state: SourceState;
  onFile: (key: SourceKey, file: File) => void;
}

export function FileCard({ sourceKey, icon, name, role, accept, state, onFile }: FileCardProps) {
  const { status, rowCount, fileName } = state;

  return (
    <div
      className={cn(
        'bg-s1 border border-b1 rounded-fleet p-[13px] flex flex-col gap-[7px]',
        'transition-colors duration-200 relative overflow-hidden',
        status === 'ok'    && 'border-fgreen/25',
        status === 'error' && 'border-fred/30',
      )}
    >
      {/* Top bar */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-[2px] transition-all duration-300',
          status === 'ok'    ? 'bg-fgreen' : '',
          status === 'error' ? 'bg-fred'   : 'bg-b1',
        )}
      />

      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-[17px] leading-none">{icon}</span>
        <div>
          <div className="text-[14px] font-semibold">{name}</div>
          <div className="text-[12px] text-t2 font-mono">{role}</div>
        </div>
      </div>

      {/* Status */}
      <div
        className={cn(
          'text-[12px] font-mono',
          status === 'idle'  && 'text-t3',
          status === 'ok'    && 'text-fgreen',
          status === 'error' && 'text-fred',
        )}
      >
        {status === 'idle'  && 'Sin cargar'}
        {status === 'ok'    && `✓ ${rowCount.toLocaleString()} filas`}
        {status === 'error' && '✗ Error al parsear'}
        {status === 'ok' && fileName && (
          <span className="block text-t3 truncate max-w-[180px]" title={fileName}>
            {fileName}
          </span>
        )}
      </div>

      {/* Upload button */}
      <label className="flex items-center gap-[5px] bg-s2 border border-dashed border-b2 rounded-[5px] px-[9px] py-[6px] cursor-pointer text-[13px] text-t2 transition-all duration-200 hover:border-cyan hover:text-cyan">
        📂 Seleccionar archivo
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(sourceKey, file);
            e.target.value = '';
          }}
        />
      </label>
    </div>
  );
}
