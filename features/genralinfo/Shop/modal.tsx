'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { buttonVariants } from '@/components/ui/button';
import { IShop } from '@/models/shop';
import ShopForm from './form'; // Ensure this path points to your ShopForm

interface ShopModalProps {
  initialData?: IShop | null;
  pageTitle?: string;
}

export default function ShopModal({
  initialData = null,
  pageTitle = 'Add New Shop'
}: ShopModalProps) {
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
        {initialData ? 'Edit Shop' : 'Add New Shop'}
      </button>

      <Modal
        title={initialData ? 'Edit Shop' : pageTitle}
        description={
          initialData
            ? 'Update the shop details below.'
            : 'Fill in the details below to add a new shop.'
        }
        isOpen={isModalOpen}
        onClose={handleModalClose}
        size='xl'
      >
        <ShopForm
          closeModal={handleModalClose}
          initialData={initialData}
          isEdit={!!initialData}
        />
      </Modal>
    </>
  );
}
