'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface ModalProps {
  title: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  description,
  isOpen,
  onClose,
  children,
  size = 'md'
}) => {
  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };
  const sizeStyles = {
    sm: { width: '100%', maxWidth: '576px' },
    md: { width: '100%', maxWidth: '672px' },
    lg: { width: '100%', maxWidth: '768px' },
    xl: { width: '100%', maxWidth: '896px' },
    xxl: { width: '100%', maxWidth: '1152px' }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent style={sizeStyles[size]} className='w-full'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div>{children}</div>
      </DialogContent>
    </Dialog>
  );
};
