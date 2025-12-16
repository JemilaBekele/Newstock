'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { buttonVariants } from '@/components/ui/button';
import { ISubCategory } from '@/models/Category';
import SubCategoryForm from './form'; // Adjust the path as needed

interface SubCategoryModalProps {
  initialData?: ISubCategory | null;
  pageTitle?: string;
}

export default function SubCategoryModal({
  initialData = null,
  pageTitle = 'Add New Subcategory'
}: SubCategoryModalProps) {
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
        {initialData ? 'Edit Subcategory' : 'Add New Subcategory'}
      </button>

      <Modal
        title={initialData ? 'Edit Subcategory' : pageTitle}
        description={
          initialData
            ? 'Update the subcategory details below.'
            : 'Fill in the details below to add a new subcategory.'
        }
        isOpen={isModalOpen}
        onClose={handleModalClose}
        size='xl'
      >
        <SubCategoryForm
          closeModal={handleModalClose}
          initialData={initialData || null}
          isEdit={!!initialData}
        />
      </Modal>
    </>
  );
}
