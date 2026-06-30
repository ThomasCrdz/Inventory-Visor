import { useState } from 'react';
import { cn } from '@/lib/utils';

interface VisorDropZoneProps {
  onFile: (file: File) => void;
}

export function VisorDropZone({ onFile }: VisorDropZoneProps) {
  const [dragging, setDragging] = useState(false);

  return (
    <div
      className={cn(
        'bg-s1 border-2 border-dashed border-b2 rounded-fleet',
        'p-10 text-center cursor-pointer transition-all duration-200 mb-4',
        dragging && 'border-cyan bg-cyan/[0.03]',
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) onFile(file);
      }}
    >
      <label className="cursor-pointer block">
        <div className="text-[30px] mb-2">📋</div>
        <div className="text-[16px] font-bold mb-[6px]">
          Arrastra un XLSX aquí o haz clic para cargar
        </div>
        <div className="text-[13px] font-mono text-t2">
          Carga el archivo exportado desde la pestaña Exportar
          <br />o cualquier XLSX con el mismo formato de columnas
        </div>
        <input
          type="file"
          accept=".xlsx,.csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = '';
          }}
        />
      </label>
    </div>
  );
}
