import { useState, useMemo } from 'react';
import type { Tab, InventoryRow, RawSources, M2MRow } from './types';
import { Nav } from './components/layout/Nav';
import { ExportPage } from './components/export/ExportPage';
import { VisorPage } from './components/visor/VisorPage';
import { SimPage } from './components/sim/SimPage';
import { M2mPage } from './components/m2m/M2mPage';
import { CobroPage } from './components/cobro/CobroPage';
import { Toaster } from './components/ui/sonner';
import { buildM2mRows } from './lib/m2mProcessor';

const EMPTY_RAW: RawSources = {
  unidades: null, inventory: null, invCustom: null, hardware: null,
  sims: null, pod: null, imeiExtra: null, ffcVersiones: null, hwList: null,
};

export default function App() {
  const [activeTab, setActiveTab]     = useState<Tab>('export');
  const [recordCount, setRecordCount] = useState(0);
  const [exportedRows, setExportedRows] = useState<InventoryRow[]>([]);
  const [lastRaw, setLastRaw]           = useState<RawSources>(EMPTY_RAW);

  // Shared M2M rows derived from lastRaw.sims (used by M2mPage and CobroPage)
  const m2mRows = useMemo<M2MRow[]>(() => {
    if (!lastRaw.sims) return [];
    return buildM2mRows(lastRaw);
  }, [lastRaw]);

  function goToVisor(rows: InventoryRow[]) {
    setExportedRows(rows);
    setRecordCount(rows.length);
    setActiveTab('visor');
  }

  function goToSim(raw: RawSources, result: InventoryRow[]) {
    setLastRaw(raw);
    setExportedRows(result);
    setRecordCount(result.length);
    setActiveTab('sim');
  }

  function goToM2m(raw: RawSources) {
    setLastRaw(raw);
    setActiveTab('m2m');
  }

  return (
    <>
      <Nav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        recordCount={recordCount}
      />

      <div style={{ display: activeTab === 'export' ? 'block' : 'none' }}>
        <ExportPage
          onGoToVisor={goToVisor}
          onGoToSim={goToSim}
          onGoToM2m={goToM2m}
        />
      </div>
      <div style={{ display: activeTab === 'visor' ? 'block' : 'none' }}>
        <VisorPage
          initialRows={exportedRows}
          onRecordCountChange={setRecordCount}
        />
      </div>
      <div style={{ display: activeTab === 'sim' ? 'block' : 'none' }}>
        <SimPage rows={exportedRows} simsRaw={lastRaw.sims} />
      </div>
      <div style={{ display: activeTab === 'm2m' ? 'block' : 'none' }}>
        <M2mPage raw={lastRaw} />
      </div>
      <div style={{ display: activeTab === 'cobro' ? 'block' : 'none' }}>
        <CobroPage m2mRows={m2mRows} />
      </div>

      <Toaster />
    </>
  );
}
