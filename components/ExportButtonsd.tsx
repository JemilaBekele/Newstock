'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ISell } from '@/models/Sell';
import { exportSellsToExcel } from '@/lib/exportSellExcel';

interface ExportButtonsProps {
  data: ISell[];
  statusCounts?: Record<string, number>;
  totalSells?: number;
  showSummaryExport?: boolean;
}

export default function ExportButtons({ 
  data, 
}: ExportButtonsProps) {
  if (!data.length) return null;

  const handleExportExcel = () => {
    exportSellsToExcel(data, 'sales_report');
  };



  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button 
        onClick={handleExportExcel} 
        variant="outline" 
        size="sm"
        className="gap-2"
        disabled={data.length === 0}
      >
        <Download className="h-4 w-4" />
        Export Sales to Excel
      </Button>
    </div>
  );
}