// lib/exportStockLedgerExcel.ts
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface StockLedgerExportData {
  Date: string;
  Type: string;
  Batch: string;
  Location: string;
  Branch: string;
  In: string;
  Out: string;
  Balance: string;
  'Reference/Invoice': string;
  User: string;
  Notes: string;
}

export interface StockLedgerExportOptions {
  productName: string;
  productCode: string;
  unitSymbol: string;
  selectedBranch?: string;
  finalBalance?: string;
}

export const exportStockLedgerToExcel = (
  data: StockLedgerExportData[],
  options: StockLedgerExportOptions,
  filename: string = 'stock_ledger'
) => {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    // Create header information
    const headerInfo = [
      ['STOCK LEDGER REPORT', ''],
      ['Product Name', options.productName],
      ['Product Code', options.productCode],
      ['Unit', options.unitSymbol],
      ['Branch', options.selectedBranch || 'All Branches'],
      ['Generated Date', new Date().toLocaleDateString()],
      ['Final Balance', options.finalBalance || 'N/A'],
      ['', ''], // Empty row
      // Column headers
      ['Date', 'Type', 'Batch', 'Location', 'Branch', 'In', 'Out', 'Balance', 'Reference/Invoice', 'User', 'Notes']
    ];

    // Add summary row at the end
    const summaryRow: StockLedgerExportData = {
      Date: '',
      Type: 'SUMMARY',
      Batch: '',
      Location: '',
      Branch: '',
      In: '',
      Out: '',
      Balance: options.finalBalance || '',
      'Reference/Invoice': 'Final Balance',
      User: '',
      Notes: ''
    };

    // Combine all data
    const allData = [...data, summaryRow];

    // Create worksheet with header
    const ws = XLSX.utils.aoa_to_sheet(headerInfo);
    
    // Add the data starting after the header
    XLSX.utils.sheet_add_json(ws, allData, {
      skipHeader: true,
      origin: `A${headerInfo.length + 1}`
    });

    // Set column widths
    const colWidths = [
      { wch: 20 }, // Date
      { wch: 15 }, // Type
      { wch: 15 }, // Batch
      { wch: 20 }, // Location
      { wch: 15 }, // Branch
      { wch: 10 }, // In
      { wch: 10 }, // Out
      { wch: 15 }, // Balance
      { wch: 25 }, // Reference/Invoice
      { wch: 20 }, // User
      { wch: 30 }  // Notes
    ];
    ws['!cols'] = colWidths;

    // Style the header
    for (let col = 0; col < headerInfo[0].length; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: { bold: true, sz: 16 },
          alignment: { horizontal: 'center' }
        };
      }
    }

    // Merge title cells
    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } });

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock Ledger');

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Download file
    saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};