import type { ProcessState } from '@/types';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  processState: ProcessState;
  onProcess: () => void;
  onExport: () => void;
  onGoVisor: () => void;
  onReset: () => void;
}

export function ActionButtons({
  processState,
  onProcess,
  onExport,
  onGoVisor,
  onReset,
}: ActionButtonsProps) {
  const processing = processState === 'processing';
  const done       = processState === 'done';

  return (
    <div className="flex gap-[10px] flex-wrap mt-[14px] items-center">
      <Button
        variant="primary"
        onClick={onProcess}
        disabled={processing}
      >
        ⚡ Procesar y cruzar datos
      </Button>

      {done && (
        <>
          <Button variant="green" onClick={onExport}>
            ⬇ Exportar XLSX
          </Button>
          <Button variant="green" onClick={onGoVisor}>
            🔍 Ver en Visor
          </Button>
          <Button variant="ghost" onClick={onReset}>
            ✕ Limpiar
          </Button>
        </>
      )}
    </div>
  );
}
