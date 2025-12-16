'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { buttonVariants } from '@/components/ui/button';
import RoleForm from './form'; // Adjust path to your role form component
import { IRole } from '@/service/roleService';

interface RoleModalProps {
  initialData?: IRole | null;
  pageTitle?: string;
}

export default function RoleModal({
  initialData = null,
  pageTitle = 'Add New Role'
}: RoleModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  return (
    <>
      <button
        onClick={handleModalOpen}
        className={
          buttonVariants({ variant: 'default' }) + ' text-xs md:text-sm'
        }
      >
        <Plus className='mr-2 h-4 w-4' />
        {initialData ? 'Edit Role' : 'Add New Role'}
      </button>

      <Modal
        title={initialData ? 'Edit Role' : pageTitle}
        description={
          initialData
            ? 'Update the role details below.'
            : 'Fill in the details below to add a new role.'
        }
        isOpen={isModalOpen}
        onClose={handleModalClose}
        size='xl'
      >
        <RoleForm
          closeModal={handleModalClose}
          initialData={initialData}
          isEdit={!!initialData}
        />
      </Modal>
    </>
  );
}
