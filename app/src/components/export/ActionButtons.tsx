import type { ProcessState } from '@/types';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  processState: ProcessState;
  onProcess: () => void;
  onExport: () => void;
  onGoVisor: () => void;
  onGoSim: () => void;
  onGoM2m: () => void;
  onReset: () => void;
}

export function ActionButtons({
  processState,
  onProcess,
  onExport,
  onGoVisor,
  onGoSim,
  onGoM2m,
  onReset,
}: ActionButtonsProps) {
  const processing = processState === 'processing';
  const done       = processState === 'done';

  return (
    <div className="flex gap-[10px] flex-wrap mt-[14px] items-center">
      <Button variant="primary" size="sm" onClick={onProcess} disabled={processing}>
        ⚡ Generar
      </Button>

      {done && (
        <>
          <Button variant="green" size="sm" onClick={onExport}>
            ⬇ Exportar XLSX
          </Button>
          <Button variant="green" size="sm" onClick={onGoVisor}>
            🔍 Ver en Visor
          </Button>
          <Button variant="green" size="sm" onClick={onGoM2m}>
            📶 Ver en SIMs M2M
          </Button>
          <Button variant="green" size="sm" onClick={onGoSim}>
            💳 Ver en Gestión SIM
          </Button>
          <Button variant="ghost" size="sm" onClick={onReset}>
            ✕ Limpiar
          </Button>
        </>
      )}
    </div>
  );
}
