import type { SourceKey } from '@/types';
import type { SourceStates } from '@/hooks/useCSVLoader';
import { FileCard } from './FileCard';
import { SOURCE_DEFS } from '@/lib/constants';

interface FileGridProps {
  sourceStates: SourceStates;
  onFile: (key: SourceKey, file: File) => void;
}

export function FileGrid({ sourceStates, onFile }: FileGridProps) {
  return (
    <div className="grid gap-[10px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
      {SOURCE_DEFS.map(def => (
        <FileCard
          key={def.key}
          sourceKey={def.key}
          icon={def.icon}
          name={def.name}
          role={def.role}
          accept={def.accept}
          state={sourceStates[def.key]}
          onFile={onFile}
        />
      ))}
    </div>
  );
}
