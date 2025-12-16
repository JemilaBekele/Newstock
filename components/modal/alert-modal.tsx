'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?:
    | 'destructive'
    | 'default'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  children?: React.ReactNode; // Add this line
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Continue',
  cancelText = 'Cancel',
  variant = 'destructive',
  children // Add this line
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      title={title}
      description={description}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className='space-y-4'>
        {/* Render children if provided */}
        {children}

        <div className='flex w-full items-center justify-end space-x-2 pt-6'>
          <Button disabled={loading} variant='outline' onClick={onClose}>
            {cancelText}
          </Button>
          <Button disabled={loading} variant={variant} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
