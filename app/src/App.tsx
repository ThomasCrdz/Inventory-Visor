import { useState } from 'react';
import type { Tab, InventoryRow } from './types';
import { Nav } from './components/layout/Nav';
import { ExportPage } from './components/export/ExportPage';
import { VisorPage } from './components/visor/VisorPage';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [activeTab, setActiveTab]     = useState<Tab>('export');
  const [recordCount, setRecordCount] = useState(0);
  const [exportedRows, setExportedRows] = useState<InventoryRow[]>([]);

  function goToVisor(rows: InventoryRow[]) {
    setExportedRows(rows);
    setRecordCount(rows.length);
    setActiveTab('visor');
  }

  return (
    <>
      <Nav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        recordCount={recordCount}
      />

      {/*
        Both pages are always mounted (display toggled) to preserve state
        when switching tabs — same behavior as the original HTML.
      */}
      <div style={{ display: activeTab === 'export' ? 'block' : 'none' }}>
        <ExportPage onGoToVisor={goToVisor} />
      </div>
      <div style={{ display: activeTab === 'visor' ? 'block' : 'none' }}>
        <VisorPage
          initialRows={exportedRows}
          onRecordCountChange={setRecordCount}
        />
      </div>

      <Toaster />
    </>
  );
}
