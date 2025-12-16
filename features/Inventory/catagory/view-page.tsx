'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { buttonVariants } from '@/components/ui/button';
import { ICategory } from '@/models/Category';
import CategoryForm from './form'; // Adjust path if needed

interface CategoryModalProps {
  initialData?: ICategory | null;
  pageTitle?: string;
}

export default function CategoryModal({
  initialData = null,
  pageTitle = 'Add New Category'
}: CategoryModalProps) {
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
        {initialData ? 'Edit Category' : 'Add New Category'}
      </button>

      <Modal
        title={initialData ? 'Edit Category' : pageTitle}
        description={
          initialData
            ? 'Update the category details below.'
            : 'Fill in the details below to add a new category.'
        }
        isOpen={isModalOpen}
        onClose={handleModalClose}
        size='xl'
      >
        <CategoryForm
          closeModal={handleModalClose}
          initialData={initialData || null}
          isEdit={!!initialData}
        />
      </Modal>
    </>
  );
}
