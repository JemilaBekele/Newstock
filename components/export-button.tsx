// features/Inventory/Products/components/ExportButtons.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { IProduct } from '@/models/Product';
import {exportToExcel } from '@/lib/bb';

interface ExportButtonsProps {
  data: IProduct[];
}

export default function ExportButtons({ data }: ExportButtonsProps) {
  if (!data.length) return null;

  const handleExportExcel = () => {
    exportToExcel(data, 'products_export');
  };


  return (
    <div className="flex gap-2 mb-4">
      <Button 
        onClick={handleExportExcel} 
        variant="outline" 
        size="sm"
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Export to Excel
      </Button>
    </div>
  );
}