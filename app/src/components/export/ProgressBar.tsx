import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  value: number;
  msg: string;
}

export function ProgressBar({ value, msg }: ProgressBarProps) {
  return (
    <div className="mt-[14px]">
      <div className="flex justify-between text-[12px] font-mono text-t2 mb-[5px]">
        <span>{msg || 'Preparando...'}</span>
        <span>{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}
