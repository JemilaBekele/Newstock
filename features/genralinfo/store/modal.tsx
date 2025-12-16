'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { buttonVariants } from '@/components/ui/button';
import { IStore } from '@/models/store';
import StoreForm from './form'; // Ensure this path points to your StoreForm

interface StoreModalProps {
  initialData?: IStore | null;
  pageTitle?: string;
}

export default function StoreModal({
  initialData = null,
  pageTitle = 'Add New Store'
}: StoreModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => {
    setIsModalOpen(false);
    router.refresh(); // Refresh the page when the modal is closed
  };

  return (
    <>
      <button
        onClick={handleModalOpen}
        className={
          buttonVariants({ variant: 'default' }) + ' text-xs md:text-sm'
        }
      >
        <Plus className='mr-2 h-4 w-4' />
        {initialData ? 'Edit Store' : 'Add New Store'}
      </button>

      <Modal
        title={initialData ? 'Edit Store' : pageTitle}
        description={
          initialData
            ? 'Update the store details below.'
            : 'Fill in the details below to add a new store.'
        }
        isOpen={isModalOpen}
        onClose={handleModalClose}
        size='xl'
      >
        <StoreForm
          closeModal={handleModalClose}
          initialData={initialData}
          isEdit={!!initialData}
        />
      </Modal>
    </>
  );
}
