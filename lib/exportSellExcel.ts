import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ISell } from '@/models/Sell';
import { SaleStatus } from '@/models/Sell';

export const exportSellsToExcel = (data: ISell[], filename: string = 'sales_report') => {
  // Helper function to format sale status
  const formatSaleStatus = (status: SaleStatus): string => {
    switch (status) {
      case SaleStatus.APPROVED:
        return 'Approved';
      case SaleStatus.NOT_APPROVED:
        return 'Not Approved';
      case SaleStatus.PARTIALLY_DELIVERED:
        return 'Partially Delivered';
      case SaleStatus.DELIVERED:
        return 'Delivered';
      case SaleStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  };

  // Transform data for Excel export
  const excelData = data.map(sell => ({
    'Invoice No': sell.invoiceNo,
    'Customer': sell.customer?.name || 'N/A',
    'Sale Date': new Date(sell.saleDate).toLocaleDateString(),
    'Status': formatSaleStatus(sell.saleStatus),
    'Total Products': sell.totalProducts,
    'Sub Total': sell.subTotal,
    'Discount': sell.discount,
    'VAT': sell.vat,
    'Grand Total': sell.grandTotal,
    'Net Total': sell.NetTotal,
    'Branch': sell.branch?.name || 'N/A',
    'Created By': sell.createdBy?.name || 'N/A',
    'Notes': sell.notes || '',
    'Created Date': new Date(sell.createdAt).toLocaleDateString(),
    'Updated Date': new Date(sell.updatedAt).toLocaleDateString(),
    'Locked': sell.locked ? 'Yes' : 'No'
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  
  // Set column widths
  const colWidths = [
    { wch: 15 }, // Invoice No
    { wch: 20 }, // Customer
    { wch: 15 }, // Customer Phone
    { wch: 12 }, // Sale Date
    { wch: 20 }, // Status
    { wch: 12 }, // Total Products
    { wch: 12 }, // Sub Total
    { wch: 10 }, // Discount
    { wch: 10 }, // VAT
    { wch: 12 }, // Grand Total
    { wch: 12 }, // Net Total
    { wch: 15 }, // Branch
    { wch: 15 }, // Created By
    { wch: 30 }, // Notes
    { wch: 12 }, // Created Date
    { wch: 12 }, // Updated Date
    { wch: 8 }  // Locked
  ];
  worksheet['!cols'] = colWidths;
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { 
    bookType: 'xlsx', 
    type: 'array' 
  });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  // Download file
  saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Export summary report
export const exportSalesSummaryToExcel = (
  statusCounts: Record<string, number>, 
  totalSells: number,
  filename: string = 'sales_summary'
) => {
  const summaryData = [
    ['Sales Summary Report', ''],
    ['Generated Date', new Date().toLocaleDateString()],
    ['', ''],
    ['Status', 'Count'],
    ['All Sells', totalSells],
    ['Approved', statusCounts[SaleStatus.APPROVED] || 0],
    ['Not Approved', statusCounts[SaleStatus.NOT_APPROVED] || 0],
    ['Partially Delivered', statusCounts[SaleStatus.PARTIALLY_DELIVERED] || 0],
    ['Delivered', statusCounts[SaleStatus.DELIVERED] || 0],
    ['Cancelled', statusCounts[SaleStatus.CANCELLED] || 0],
    ['', ''],
    ['Total Revenue (Approved Sales)', ''],
    ['Average Sale Value', '']
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Style the header
  worksheet['A1'] = { t: 's', v: 'Sales Summary Report' };
  worksheet['A1'].s = { font: { bold: true, sz: 16 } };
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Summary');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};