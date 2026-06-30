import { useCallback } from 'react';
import { toast } from 'sonner';
import type { InventoryRow, RawSources } from '@/types';
import { useCSVLoader } from '@/hooks/useCSVLoader';
import { useDataProcessor } from '@/hooks/useDataProcessor';
import { exportAll } from '@/lib/exportXLSX';
import { FileGrid } from './FileGrid';
import { FolderLoader } from './FolderLoader';
import { StatsBox } from './StatsBox';
import { ProgressBar } from './ProgressBar';
import { ActionButtons } from './ActionButtons';
import { LogBox } from './LogBox';
import { Card } from '@/components/ui/card';

interface ExportPageProps {
  onGoToVisor: (rows: InventoryRow[]) => void;
  onGoToSim:   (raw: RawSources, result: InventoryRow[]) => void;
  onGoToM2m:   (raw: RawSources) => void;
}

export function ExportPage({ onGoToVisor, onGoToSim, onGoToM2m }: ExportPageProps) {
  const loader    = useCSVLoader();
  const processor = useDataProcessor();

  const allLogs = [...loader.logs, ...processor.logs];

  const handleProcess = useCallback(async () => {
    const main = loader.raw.unidades ?? loader.raw.invCustom ?? loader.raw.inventory;
    if (!main) {
      toast.error('Carga al menos Unidades sin comunicar o Inventory Report');
      return;
    }
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

  const handleGoSim = useCallback(() => {
    onGoToSim(loader.raw, processor.result);
  }, [onGoToSim, loader.raw, processor.result]);

  const handleGoM2m = useCallback(() => {
    onGoToM2m(loader.raw);
  }, [onGoToM2m, loader.raw]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-7 pb-[60px]">

      <p className="text-[11px] font-mono text-t3 uppercase tracking-[1.5px] mb-[11px]">
        1 — Archivos de origen
      </p>

      {/* Folder loader — hides if browser doesn't support File System Access API */}
      <FolderLoader onFile={loader.loadSource} addLog={loader.addLog} />

      <FileGrid sourceStates={loader.sourceStates} onFile={loader.loadSource} />

      <p className="text-[11px] font-mono text-t3 uppercase tracking-[1.5px] mt-6 mb-[11px]">
        2 — Procesar y exportar
      </p>

      <Card>
        {processor.stats && <StatsBox stats={processor.stats} />}

        {processor.state === 'processing' && (
          <ProgressBar value={processor.progress} msg={processor.progressMsg} />
        )}

        <ActionButtons
          processState={processor.state}
          onProcess={handleProcess}
          onExport={handleExport}
          onGoVisor={handleGoVisor}
          onGoSim={handleGoSim}
          onGoM2m={handleGoM2m}
          onReset={handleReset}
        />

        <LogBox logs={allLogs} />
      </Card>
    </div>
  );
}
