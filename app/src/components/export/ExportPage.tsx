import { useCallback } from 'react';
import { toast } from 'sonner';
import type { InventoryRow } from '@/types';
import { useCSVLoader } from '@/hooks/useCSVLoader';
import { useDataProcessor } from '@/hooks/useDataProcessor';
import { exportAll } from '@/lib/exportXLSX';
import { FileGrid } from './FileGrid';
import { StatsBox } from './StatsBox';
import { ProgressBar } from './ProgressBar';
import { ActionButtons } from './ActionButtons';
import { LogBox } from './LogBox';
import { Card } from '@/components/ui/card';

interface ExportPageProps {
  onGoToVisor: (rows: InventoryRow[]) => void;
}

export function ExportPage({ onGoToVisor }: ExportPageProps) {
  const loader    = useCSVLoader();
  const processor = useDataProcessor();

  const allLogs = [...loader.logs, ...processor.logs];

  const handleProcess = useCallback(async () => {
    const main = loader.raw.unidades ?? loader.raw.inventory;
    if (!main) {
      toast.error('Carga al menos Unidades sin comunicar o Inventory Report');
      return;
    }
    // process() returns void; result is set in hook state — toast shown via useEffect in processor
    await processor.process(loader.raw);
  }, [loader.raw, processor]);

  const handleExport = useCallback(() => {
    exportAll(processor.result);
    toast.success('✓ XLSX exportado correctamente');
  }, [processor.result]);

  const handleReset = useCallback(() => {
    loader.reset();
    processor.reset();
  }, [loader, processor]);

  const handleGoVisor = useCallback(() => {
    onGoToVisor(processor.result);
  }, [onGoToVisor, processor.result]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-7 pb-[60px]">

      {/* Section 1: Sources */}
      <p className="text-[9px] font-mono text-t3 uppercase tracking-[1.5px] mb-[11px]">
        1 — Archivos de origen
      </p>
      <FileGrid sourceStates={loader.sourceStates} onFile={loader.loadSource} />

      {/* Section 2: Process */}
      <Card className="mt-4">
        <p className="text-[9px] font-mono text-t3 uppercase tracking-[1.5px]">
          2 — Procesar y exportar
        </p>

        {processor.stats && <StatsBox stats={processor.stats} />}

        {processor.state === 'processing' && (
          <ProgressBar value={processor.progress} msg={processor.progressMsg} />
        )}

        <ActionButtons
          processState={processor.state}
          onProcess={handleProcess}
          onExport={handleExport}
          onGoVisor={handleGoVisor}
          onReset={handleReset}
        />

        <LogBox logs={allLogs} />
      </Card>
    </div>
  );
}
