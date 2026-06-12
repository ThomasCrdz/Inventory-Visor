import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    theme="dark"
    className="toaster group"
    toastOptions={{
      classNames: {
        toast:
          'group toast bg-s2 border border-b1 text-t1 font-mono text-[11px] rounded-[7px]',
        description: 'text-t2',
        actionButton: 'bg-cyan text-black',
        cancelButton: 'bg-s3 text-t2',
        success: '!border-fgreen/50 !text-fgreen',
        error:   '!border-fred/50 !text-fred',
      },
    }}
    position="bottom-right"
    {...props}
  />
);

export { Toaster };
