'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { buttonVariants } from '@/components/ui/button';
import { IBranch } from '@/models/Branch';
import BranchForm from './form'; // Make sure the path is correct

interface BranchModalProps {
  initialData?: IBranch | null;
  pageTitle?: string;
}

export default function BranchModal({
  initialData = null,
  pageTitle = 'Add New Branch'
}: BranchModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => {
    setIsModalOpen(false);
    router.refresh(); // Refresh page on modal close
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
        {initialData ? 'Edit Branch' : 'Add New Branch'}
      </button>

      <Modal
        title={initialData ? 'Edit Branch' : pageTitle}
        description={
          initialData
            ? 'Update the branch details below.'
            : 'Fill in the details below to add a new branch.'
        }
        isOpen={isModalOpen}
        onClose={handleModalClose}
        size='xl'
      >
        <BranchForm
          closeModal={handleModalClose}
          initialData={initialData}
          isEdit={!!initialData}
        />
      </Modal>
    </>
  );
}
