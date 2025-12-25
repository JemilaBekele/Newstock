/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';
import { toast } from 'sonner';
import {
  Package,
  Calendar,
  User,
  Info,
  Check,
  X,
  Loader2,
  ShoppingCart,
  Truck,
  CreditCard,
  AlertTriangle,
  Printer,
  DollarSign,
  Tag,
  Scale
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ISell, ISellItem, SaleStatus, ItemSaleStatus } from '@/models/Sell';
import {
  ISellStockCorrection,
  SellStockCorrectionStatus,
  ISellStockCorrectionItem
} from '@/models/SellStockCorrection';
import { cancelSale, getSellId, updateSaleStatus } from '@/service/Sell';
import {
  approveSellStockCorrection,
  deleteSellStockCorrection,
  getSellStockCorrectionsBySellId,
  rejectSellStockCorrection
} from '@/service/SellStockCorrection';
import { AlertModal } from '@/components/modal/alert-modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { getAvailableBatchesByProductAndShop } from '@/service/shop';

type SaleViewProps = {
  id?: string;
};

interface NetTotalAdjustment {
  totalAdjustment: number;
  adjustments: Array<{
    productName: string;
    batchNumber: string;
    quantity: number;
    unitPrice: number;
    adjustmentValue: number;
    type: 'increase' | 'decrease';
    reason: string;
  }>;
}

interface PrintableSaleData {
  sale: ISell;
  stockCorrections: ISellStockCorrection[];
  netTotalAdjustment: NetTotalAdjustment | null;
  printedAt: string;
}

interface PriceAnalysis {
  productId: string;
  productName: string;
  sellPrice: number;
  additionalPrices: Array<{
    label: string;
    price: number;
    shopId: string | null;
    isMatch: boolean;
    difference: number;
  }>;
  hasMatchingPrice: boolean;
}

const SaleDetailPage: React.FC<SaleViewProps> = ({ id }) => {
  const [sale, setSale] = useState<ISell | null>(null);
  const [stockCorrections, setStockCorrections] = useState<
    ISellStockCorrection[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadingCorrections, setLoadingCorrections] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedCorrectionId, setSelectedCorrectionId] = useState<
    string | null
  >(null);
  const [actionType, setActionType] = useState<
    'approve' | 'reject' | 'delete' | null
  >(null);
  const [statusUpdateDialog, setStatusUpdateDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<SaleStatus | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [netTotalAdjustment, setNetTotalAdjustment] =
    useState<NetTotalAdjustment | null>(null);
  const [priceAnalysisModalOpen, setPriceAnalysisModalOpen] = useState(false);
  const [priceAnalysis, setPriceAnalysis] = useState<PriceAnalysis[]>([]);
  const [loadingPriceAnalysis, setLoadingPriceAnalysis] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const calculateNetTotalAdjustment = useCallback(
    (corrections: ISellStockCorrection[], currentSale: ISell | null) => {
      if (!currentSale || !currentSale.items || corrections.length === 0) {
        setNetTotalAdjustment(null);
        return;
      }

      const adjustments: NetTotalAdjustment['adjustments'] = [];
      let totalAdjustment = 0;

      corrections.forEach((correction) => {
        if (
          !correction.items ||
          correction.status !== SellStockCorrectionStatus.APPROVED
        ) {
          return;
        }

        correction.items.forEach((correctionItem: ISellStockCorrectionItem) => {
          // Find the sale item by product and shop
          const saleItem = currentSale.items?.find(
            (item) =>
              item.product?.id === correctionItem.productId &&
              item.shop?.id === correctionItem.shopId
          );

          if (saleItem && correctionItem.quantity !== 0) {
            const adjustmentValue =
              correctionItem.quantity * saleItem.unitPrice;
            const type = correctionItem.quantity > 0 ? 'decrease' : 'increase';
            const absoluteQuantity = Math.abs(correctionItem.quantity);

            // Get batch information from correction item batches
            const batchNumbers =
              correctionItem.batches
                ?.map((batch) => batch.batch?.batchNumber || 'Unknown Batch')
                .join(', ') || 'Unknown Batch';

            adjustments.push({
              productName: correctionItem.product?.name || 'Unknown Product',
              batchNumber: batchNumbers,
              quantity: absoluteQuantity,
              unitPrice: saleItem.unitPrice,
              adjustmentValue: Math.abs(adjustmentValue),
              type,
              reason:
                correctionItem.quantity > 0
                  ? `Items returned to stock (overstated sale)`
                  : `Items deducted from stock (understated sale)`
            });

            totalAdjustment -= adjustmentValue;
          }
        });
      });

      setNetTotalAdjustment({
        totalAdjustment,
        adjustments
      });
    },
    []
  );

  // Function to analyze prices
  const analyzePrices = async () => {
    if (!sale || !sale.items) return;

    setLoadingPriceAnalysis(true);
    try {
      const analysis: PriceAnalysis[] = [];

      for (const item of sale.items) {
        if (!item.product?.id || !item.shop?.id) continue;

        try {
          // Fetch batches and additional prices for this product and shop
          const response = await getAvailableBatchesByProductAndShop(
            item.shop.id,
            item.product.id
          );

          const additionalPrices = response.additionalPrices || [];

          // Compare sell price with additional prices
          const priceComparisons = additionalPrices.map(
            (ap: { price: number; label: any; shopId: any }) => {
              const isMatch = Math.abs(ap.price - item.unitPrice) < 0.01; // Consider prices equal if difference is less than 0.01
              const difference = item.unitPrice - ap.price;

              return {
                label: ap.label,
                price: ap.price,
                shopId: ap.shopId,
                isMatch,
                difference
              };
            }
          );

          analysis.push({
            productId: item.product.id,
            productName: item.product.name,
            sellPrice: item.unitPrice,
            additionalPrices: priceComparisons,
            hasMatchingPrice: priceComparisons.some(
              (ap: { isMatch: any }) => ap.isMatch
            )
          });
        } catch  {
          // Add product with error state
          analysis.push({
            productId: item.product.id,
            productName: item.product.name,
            sellPrice: item.unitPrice,
            additionalPrices: [],
            hasMatchingPrice: false
          });
        }
      }

      setPriceAnalysis(analysis);
      setPriceAnalysisModalOpen(true);
    } catch  {
      toast.error('Failed to analyze prices');
    } finally {
      setLoadingPriceAnalysis(false);
    }
  };

  useEffect(() => {
    const fetchSaleAndCorrections = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const saleData = await getSellId(id);
        setSale(saleData);

        setLoadingCorrections(true);
        const corrections = await getSellStockCorrectionsBySellId(id);
        setStockCorrections(corrections);

        calculateNetTotalAdjustment(corrections, saleData);
      } catch {
        toast.error('Failed to fetch sale details');
      } finally {
        setLoading(false);
        setLoadingCorrections(false);
      }
    };

    fetchSaleAndCorrections();
  }, [id, refreshTrigger, calculateNetTotalAdjustment]);

  useEffect(() => {
    if (sale && stockCorrections.length > 0) {
      calculateNetTotalAdjustment(stockCorrections, sale);
    } else {
      setNetTotalAdjustment(null);
    }
  }, [sale, stockCorrections, calculateNetTotalAdjustment]);

  const handlePrint = () => {
    if (!sale) return;

    const printableData: PrintableSaleData = {
      sale,
      stockCorrections: stockCorrections.filter(
        (corr) => corr.status === SellStockCorrectionStatus.APPROVED
      ),
      netTotalAdjustment,
      printedAt: new Date().toLocaleString()
    };

    const printHTML = generatePrintHTML(printableData);

    // Create a print container
    const printContainer = document.createElement('div');
    printContainer.id = 'print-container-temp';
    printContainer.innerHTML = printHTML;

    document.body.appendChild(printContainer);

    // Add CSS to hide everything except the print container
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #print-container-temp, #print-container-temp * {
          visibility: visible;
        }
        #print-container-temp {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);

    // Print
    window.print();

    // Clean up
    setTimeout(() => {
      if (document.body.contains(printContainer)) {
        document.body.removeChild(printContainer);
      }
      document.head.removeChild(style);
    }, 100);
  };

  const generatePrintHTML = (data: PrintableSaleData) => {
    const { sale, stockCorrections, printedAt } = data;
    const netTotal = sale.NetTotal || 0;

    // Create a map to combine items by product and shop
    const combinedItemsMap = new Map();

    // Process sale items
    if (sale.items) {
      sale.items.forEach((item) => {
        const key = `${item.product?.name}-${item.shop?.name}`;
        const batchInfo =
          item.batches && item.batches.length > 0
            ? item.batches.map((b) => b.batch?.batchNumber).join(', ')
            : 'N/A';

        combinedItemsMap.set(key, {
          type: 'sale',
          product: item.product?.name || 'Unknown Product',
          batch: batchInfo,
          shop: item.shop?.name || 'N/A',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          status: item.itemSaleStatus,
          operation: 'sale',
          adjustments: [],
          finalQuantity: item.quantity
        });
      });
    }

    // Process approved stock corrections and combine with sale items
    stockCorrections
      .filter((corr) => corr.status === SellStockCorrectionStatus.APPROVED)
      .forEach((correction) => {
        correction.items?.forEach((item: ISellStockCorrectionItem) => {
          const key = `${item.product?.name}-${item.shop?.name}`;
          const isAddition = item.quantity > 0;

          if (combinedItemsMap.has(key)) {
            // Combine with existing sale item
            const existingItem = combinedItemsMap.get(key);
            existingItem.adjustments.push({
              type: 'correction',
              quantity: item.quantity,
              operation: isAddition ? 'addition' : 'reduction',
              reason: correction.notes || 'Stock Correction',
              reference: correction.reference
            });
            // Adjust the final quantity
            existingItem.finalQuantity += item.quantity;
            existingItem.totalPrice =
              existingItem.finalQuantity * existingItem.unitPrice;
          } else {
            // Create new adjustment item if no sale item exists
            combinedItemsMap.set(key, {
              type: 'correction',
              product: item.product?.name || 'Unknown Product',
              batch:
                item.batches?.map((b) => b.batch?.batchNumber).join(', ') ||
                'N/A',
              shop: item.shop?.name || 'N/A',
              quantity: item.quantity,
              unitPrice: item.unitPrice || 0,
              totalPrice: item.totalPrice || 0,
              status: 'ADJUSTMENT',
              operation: isAddition ? 'addition' : 'reduction',
              adjustments: [],
              finalQuantity: item.quantity,
              reason: correction.notes || 'Stock Correction',
              reference: correction.reference
            });
          }
        });
      });

    // Convert map to array for rendering
    const combinedItems = Array.from(combinedItemsMap.values());

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sale Invoice - ${sale.invoiceNo}</title>
          <style>
            @media print {
              @page {
                margin: 0.5in;
                size: letter;
              }
              body {
                font-family: 'Arial', sans-serif;
                font-size: 12px;
                line-height: 1.4;
                color: #000;
                margin: 0;
                padding: 0;
              }
              .print-container {
                max-width: 100%;
                margin: 0 auto;
              }
              .header {
                text-align: center;
                border-bottom: 2px solid #000;
                padding-bottom: 10px;
                margin-bottom: 20px;
              }
              .company-info {
                margin-bottom: 20px;
              }
              .invoice-title {
                font-size: 24px;
                font-weight: bold;
                margin: 10px 0;
              }
              .section {
                margin-bottom: 20px;
                page-break-inside: avoid;
              }
              .section-title {
                font-size: 16px;
                font-weight: bold;
                border-bottom: 1px solid #000;
                padding-bottom: 5px;
                margin-bottom: 10px;
              }
              .grid-2 {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 15px;
              }
              .grid-3 {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 15px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 10px 0;
              }
              th, td {
                border: 1px solid #000;
                padding: 6px 8px;
                text-align: left;
              }
              th {
                background-color: #f0f0f0;
                font-weight: bold;
              }
              .text-right {
                text-align: right;
              }
              .text-center {
                text-align: center;
              }
              .bold {
                font-weight: bold;
              }
              .total-row {
                background-color: #f8f8f8;
              }
              .adjustment-increase {
                color: #059669;
              }
              .adjustment-decrease {
                color: #dc2626;
              }
              .badge {
                display: inline-block;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: bold;
              }
              .badge-approved {
                background-color: #d1fae5;
                color: #065f46;
              }
              .badge-pending {
                background-color: #fef3c7;
                color: #92400e;
              }
              .badge-rejected {
                background-color: #fee2e2;
                color: #991b1b;
              }
              .badge-adjustment {
                background-color: #e0e7ff;
                color: #3730a3;
              }
              .badge-combined {
                background-color: #f3e8ff;
                color: #6b21a8;
              }
              .summary-box {
                border: 1px solid #000;
                padding: 15px;
                margin: 10px 0;
                background-color: #f9fafb;
              }
              .footer {
                margin-top: 30px;
                padding-top: 10px;
                border-top: 1px solid #000;
                text-align: center;
                font-size: 10px;
                color: #666;
              }
              .no-break {
                page-break-inside: avoid;
              }
              .row-sale {
                background-color: #ffffff;
              }
              .row-correction {
                background-color: #f8fafc;
              }
              .row-combined {
                background-color: #f0f9ff;
              }
              .operation-addition {
                color: #059669;
                font-weight: bold;
              }
              .operation-reduction {
                color: #dc2626;
                font-weight: bold;
              }
              .adjustment-details {
                font-size: 10px;
                color: #666;
                margin-top: 2px;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <!-- Header -->
            <div class="header">
              <div class="company-info">
                <h1>COMPANY NAME</h1>
                <p>Company Address • Phone: (123) 456-7890 • Email: info@company.com</p>
              </div>
              <div class="invoice-title">SALE INVOICE</div>
              <div class="grid-3">
                <div><strong>Invoice No:</strong> ${sale.invoiceNo}</div>
                <div><strong>Date:</strong> ${formatDate(sale.saleDate || sale.createdAt)}</div>
                <div><strong>Status:</strong> ${sale.saleStatus}</div>
              </div>
            </div>

            <!-- Sale Information -->
            <div class="section">
              <div class="section-title">Sale Information</div>
              <div class="grid-2">
                <div>
                  <p><strong>Customer:</strong> ${sale.customer?.name || 'N/A'}</p>
                  <p><strong>Branch:</strong> ${sale.branch?.name || 'N/A'}</p>
                  <p><strong>Created By:</strong> ${sale.createdBy?.name || 'N/A'}</p>
                </div>
              </div>
            </div>

            <!-- Combined Sale Items with Adjusted Quantities -->
            <div class="section no-break">
              <div class="section-title">Sale Items with Stock Corrections</div>
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Product</th>
                    <th>Batch</th>
                    <th>Shop</th>
                    <th class="text-right">Final Quantity</th>
                    <th class="text-right">Unit Price</th>
                    <th class="text-right">Total Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    combinedItems.length > 0
                      ? combinedItems
                          .map((item) => {
                            const hasAdjustments =
                              item.adjustments && item.adjustments.length > 0;
                            const rowClass = hasAdjustments
                              ? 'row-combined'
                              : item.type === 'sale'
                                ? 'row-sale'
                                : 'row-correction';
                            const badgeType = hasAdjustments
                              ? 'badge-combined'
                              : item.type === 'sale'
                                ? 'badge-approved'
                                : 'badge-adjustment';
                            const badgeText = hasAdjustments
                              ? 'COMBINED'
                              : item.type === 'sale'
                                ? 'SALE'
                                : 'ADJUSTMENT';

                            return `
                    <tr class="${rowClass}">
                      <td>
                        <span class="badge ${badgeType}">${badgeText}</span>
                        ${
                          hasAdjustments
                            ? `
                          <div class="adjustment-details">
                            ${item.adjustments
                              .map(
                                (adj: {
                                  operation: string;
                                  quantity: number;
                                }) =>
                                  `${adj.operation === 'addition' ? '+' : '-'}${Math.abs(adj.quantity)} ${adj.operation}`
                              )
                              .join(', ')}
                          </div>
                        `
                            : ''
                        }
                      </td>
                      <td>${item.product}</td>
                      <td>${item.batch}</td>
                      <td>${item.shop}</td>
                      <td class="text-right ${hasAdjustments ? 'bold' : ''}">
                        ${item.finalQuantity}
                        ${
                          hasAdjustments
                            ? `
                          <div class="adjustment-details">
                            (Base: ${item.quantity})
                          </div>
                        `
                            : ''
                        }
                      </td>
                      <td class="text-right">${item.unitPrice.toFixed(2)}</td>
                      <td class="text-right">${item.totalPrice.toFixed(2)}</td>
                      <td>
                        ${item.status}
                        ${
                          hasAdjustments
                            ? `
                          <div class="adjustment-details">
                            Adjusted
                          </div>
                        `
                            : ''
                        }
                      </td>
                    </tr>
                  `;
                          })
                          .join('')
                      : '<tr><td colspan="8" class="text-center">No items found</td></tr>'
                  }
                </tbody>
              </table>
            </div>

            <!-- Financial Summary -->
            <div class="section">
              <div class="grid-2">
                <div class="summary-box">
                  <h3>Original Totals</h3>
                  ${sale.discount > 0 ? `<p><strong>Discount:</strong> -${sale.discount.toFixed(2)}</p>` : ''}
                  ${sale.vat > 0 ? `<p><strong>VAT:</strong> ${sale.vat.toFixed(2)}</p>` : ''}
                  <p><strong>Net Total:</strong> ${netTotal.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p>Printed on: ${printedAt}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handleStatusUpdate = async (newStatus: SaleStatus) => {
    if (!id) return;

    setSelectedStatus(newStatus);
    setStatusUpdateDialog(true);
  };

  const confirmStatusUpdate = async () => {
    if (!id || !selectedStatus) return;

    setUpdating(true);
    try {
      const updatedSale = await updateSaleStatus(id, selectedStatus);
      setSale(updatedSale);
      toast.success(`Sale status updated to ${selectedStatus}`);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          `Failed to update sale status to ${selectedStatus}`
      );
    } finally {
      setUpdating(false);
      setStatusUpdateDialog(false);
      setSelectedStatus(null);
    }
  };

  const handleCorrectionAction = async (
    correctionId: string,
    action: 'approve' | 'reject' | 'delete'
  ) => {
    setOpen(true);
    setActionType(action);
    setSelectedCorrectionId(correctionId);
  };

  const onConfirm = async () => {
    if (!id && !selectedCorrectionId && actionType !== 'delete') return;

    setUpdating(true);
    try {
      if (actionType === 'delete' && !selectedCorrectionId) {
        const updatedSale = await cancelSale(id!);
        setSale(updatedSale);
        toast.success('Sale cancelled successfully');
      } else if (actionType === 'approve' && selectedCorrectionId) {
        await approveSellStockCorrection(selectedCorrectionId);
        toast.success('Stock correction approved successfully');
      } else if (actionType === 'reject' && selectedCorrectionId) {
        await rejectSellStockCorrection(selectedCorrectionId);
        toast.success('Stock correction rejected successfully');
      } else if (actionType === 'delete' && selectedCorrectionId) {
        await deleteSellStockCorrection(selectedCorrectionId);
        toast.success('Stock correction deleted successfully');
      }
      setRefreshTrigger((prev) => prev + 1);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          `Failed to ${actionType} ${selectedCorrectionId ? 'stock correction' : 'sale'}`
      );
    } finally {
      setUpdating(false);
      setOpen(false);
      setActionType(null);
      setSelectedCorrectionId(null);
    }
  };

  const handleItemSelection = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (!sale?.items) return;

    const undeliveredItemIds = sale.items
      .filter((item) => item.itemSaleStatus !== ItemSaleStatus.DELIVERED)
      .map((item) => item.id);

    if (selectedItems.length === undeliveredItemIds.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(undeliveredItemIds);
    }
  };

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2 className='mr-2 h-8 w-8 animate-spin' />
        <p>Loading sale details...</p>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <p>Sale not found</p>
      </div>
    );
  }

  const isImmutable = [SaleStatus.DELIVERED, SaleStatus.CANCELLED].includes(
    sale.saleStatus
  );
  const hasUndeliveredItems = sale.items?.some(
    (item) => item.itemSaleStatus !== ItemSaleStatus.DELIVERED
  );
  const undeliveredItemsCount =
    sale.items?.filter(
      (item) => item.itemSaleStatus !== ItemSaleStatus.DELIVERED
    ).length || 0;

  const getStatusVariant = (
    status: SaleStatus
  ): 'default' | 'destructive' | 'outline' | 'secondary' => {
    switch (status) {
      case SaleStatus.APPROVED:
      case SaleStatus.PARTIALLY_DELIVERED:
        return 'secondary';
      case SaleStatus.CANCELLED:
        return 'destructive';
      case SaleStatus.DELIVERED:
        return 'outline';
      default:
        return 'default';
    }
  };

  const grandTotal = sale.grandTotal || 0;
  const netTotal = sale.NetTotal || 0;

  return (
    <div className='container mx-auto space-y-6 p-4 md:p-8'>
      {/* Print Section - Hidden from screen but visible in print */}
      <div ref={printRef} className='hidden'>
        {/* This div will be used for print content */}
      </div>

      {/* Print and Analysis Buttons */}
      <div className='flex justify-end gap-2'>
        <Button
          onClick={analyzePrices}
          variant='outline'
          className='flex items-center gap-2'
          disabled={loadingPriceAnalysis}
        >
          {loadingPriceAnalysis ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Scale className='h-4 w-4' />
          )}
          Price Analysis
        </Button>
        <Button
          onClick={handlePrint}
          variant='outline'
          className='flex items-center gap-2'
        >
          <Printer className='h-4 w-4' />
          Print Invoice
        </Button>
      </div>

      {/* Price Analysis Modal */}
      <Dialog
        open={priceAnalysisModalOpen}
        onOpenChange={setPriceAnalysisModalOpen}
      >
        <DialogContent className='max-h-[80vh] max-w-4xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Scale className='h-5 w-5' />
              Price Analysis
            </DialogTitle>
            <DialogDescription>
              Comparison between sell prices and additional prices for each
              product in this sale.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            {priceAnalysis.map((analysis) => (
              <Card
                key={analysis.productId}
                className='border-l-4 border-l-blue-500'
              >
                <CardContent className='pt-4'>
                  <div className='mb-4 flex items-start justify-between'>
                    <div>
                      <h4 className='text-lg font-semibold'>
                        {analysis.productName}
                      </h4>
                      <p className='text-muted-foreground'>
                        Sell Price:{' '}
                        <span className='text-primary font-bold'>
                          ${analysis.sellPrice.toFixed(2)}
                        </span>
                      </p>
                    </div>
                    <Badge
                      variant={
                        analysis.hasMatchingPrice ? 'default' : 'secondary'
                      }
                      className={
                        analysis.hasMatchingPrice
                          ? 'bg-green-100 text-green-800'
                          : ''
                      }
                    >
                      {analysis.hasMatchingPrice ? (
                        <Check className='mr-1 h-3 w-3' />
                      ) : (
                        <X className='mr-1 h-3 w-3' />
                      )}
                      {analysis.hasMatchingPrice
                        ? 'Price Match Found'
                        : 'No Match'}
                    </Badge>
                  </div>

                  {analysis.additionalPrices.length > 0 ? (
                    <div className='space-y-2'>
                      <h5 className='text-muted-foreground text-sm font-medium'>
                        Additional Prices:
                      </h5>
                      <div className='grid gap-2'>
                        {analysis.additionalPrices.map((ap, index) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between rounded-lg border p-3 ${
                              ap.isMatch
                                ? 'border-green-200 bg-green-50'
                                : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div className='flex items-center gap-3'>
                              <div
                                className={`rounded p-1 ${
                                  ap.isMatch ? 'bg-green-100' : 'bg-gray-100'
                                }`}
                              >
                                <Tag
                                  className={`h-4 w-4 ${
                                    ap.isMatch
                                      ? 'text-green-600'
                                      : 'text-gray-600'
                                  }`}
                                />
                              </div>
                              <div>
                                <p className='font-medium'>{ap.label}</p>
                                <p className='text-muted-foreground text-xs'>
                                  {ap.shopId ? 'Shop-specific' : 'Global'}
                                </p>
                              </div>
                            </div>
                            <div className='text-right'>
                              <p
                                className={`font-bold ${
                                  ap.isMatch
                                    ? 'text-green-600'
                                    : 'text-gray-600'
                                }`}
                              >
                                {ap.price.toFixed(2)}
                              </p>
                              {!ap.isMatch && (
                                <p
                                  className={`text-xs ${
                                    ap.difference > 0
                                      ? 'text-red-500'
                                      : 'text-blue-500'
                                  }`}
                                >
                                  {ap.difference > 0 ? '+' : ''}
                                  {ap.difference.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className='text-muted-foreground py-4 text-center'>
                      <DollarSign className='mx-auto mb-2 h-8 w-8 opacity-50' />
                      <p>No additional prices found for this product</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={updating}
        title={
          actionType === 'delete' && !selectedCorrectionId
            ? 'Cancel Sale'
            : actionType === 'approve'
              ? 'Approve Correction'
              : actionType === 'reject'
                ? 'Reject Correction'
                : 'Delete Correction'
        }
        description={
          actionType === 'delete' && !selectedCorrectionId
            ? 'Are you sure you want to cancel this sale? This action cannot be undone.'
            : actionType === 'approve'
              ? 'Are you sure you want to approve this stock correction?'
              : actionType === 'reject'
                ? 'Are you sure you want to reject this stock correction?'
                : 'Are you sure you want to delete this stock correction?'
        }
      />

      <AlertDialog
        open={statusUpdateDialog}
        onOpenChange={setStatusUpdateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update the sale status to{' '}
              <strong>{selectedStatus}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusUpdate}
              disabled={updating}
            >
              {updating ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : null}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!isImmutable && (
        <Card className='shadow-lg'>
          <CardHeader>
            <CardTitle className='text-xl font-bold'>
              Update Sale Status
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center'>
              <div className='flex w-full flex-col gap-2 sm:flex-row'>
                <div className='flex-1'>
                  <Select
                    value={sale.saleStatus}
                    onValueChange={(value: SaleStatus) =>
                      handleStatusUpdate(value)
                    }
                    disabled={updating || isImmutable}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Sale Status' />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        SaleStatus.APPROVED,
                        SaleStatus.CANCELLED,
                        SaleStatus.NOT_APPROVED
                      ].map((status) => (
                        <SelectItem
                          key={status}
                          value={status}
                          disabled={status === sale.saleStatus}
                        >
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className='shadow-lg'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-2xl font-bold'>
            <ShoppingCart className='text-primary' />
            Sale {sale.invoiceNo}
            <Badge variant={getStatusVariant(sale.saleStatus)} className='ml-2'>
              {sale.saleStatus === SaleStatus.DELIVERED ? (
                <>
                  <Check className='mr-1 h-3 w-3' /> {sale.saleStatus}
                </>
              ) : sale.saleStatus === SaleStatus.CANCELLED ? (
                <>
                  <X className='mr-1 h-3 w-3' /> {sale.saleStatus}
                </>
              ) : sale.saleStatus === SaleStatus.PARTIALLY_DELIVERED ? (
                <>
                  <Truck className='mr-1 h-3 w-3' /> {sale.saleStatus}
                </>
              ) : (
                <>{sale.saleStatus}</>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div className='space-y-4'>
              <h3 className='flex items-center gap-2 text-lg font-semibold'>
                <Info className='text-primary h-5 w-5' />
                Sale Information
              </h3>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <ShoppingCart className='text-muted-foreground h-4 w-4' />
                  <p>
                    <span className='font-medium'>Invoice No:</span>{' '}
                    {sale.invoiceNo}
                  </p>
                </div>
                {sale.branch && (
                  <div className='flex items-center gap-2'>
                    <Package className='text-muted-foreground h-4 w-4' />
                    <p>
                      <span className='font-medium'>Branch:</span>{' '}
                      {sale.branch.name}
                    </p>
                  </div>
                )}
                {sale.customer && (
                  <div className='flex items-center gap-2'>
                    <User className='text-muted-foreground h-4 w-4' />
                    <p>
                      <span className='font-medium'>Customer:</span>{' '}
                      {sale.customer.name}
                    </p>
                  </div>
                )}
                {sale.createdBy && (
                  <div className='flex items-center gap-2'>
                    <User className='text-muted-foreground h-4 w-4' />
                    <p>
                      <span className='font-medium'>Created By:</span>{' '}
                      {sale.createdBy.name}
                    </p>
                  </div>
                )}
                {sale.updatedBy && (
                  <div className='flex items-center gap-2'>
                    <User className='text-muted-foreground h-4 w-4' />
                    <p>
                      <span className='font-medium'>Updated By:</span>{' '}
                      {sale.updatedBy.name}
                    </p>
                  </div>
                )}
                {sale.notes && (
                  <div>
                    <p className='font-medium'>Notes:</p>
                    <p className='text-muted-foreground'>{sale.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='flex items-center gap-2 text-lg font-semibold'>
                <CreditCard className='text-primary h-5 w-5' />
                Financial Details
              </h3>
              <div className='space-y-2'>
                {sale.subTotal > 0 && (
                  <div>
                    <p className='font-medium'>Sub Total:</p>
                    <p className='text-muted-foreground'>
                      {(sale.subTotal || 0).toFixed(2)}
                    </p>
                  </div>
                )}
                {sale.discount > 0 && (
                  <div>
                    <p className='font-medium'>Discount:</p>
                    <p className='text-muted-foreground'>
                      -{(sale.discount || 0).toFixed(2)}
                    </p>
                  </div>
                )}
                {sale.vat > 0 && (
                  <div>
                    <p className='font-medium'>VAT:</p>
                    <p className='text-muted-foreground'>
                      {(sale.vat || 0).toFixed(2)}
                    </p>
                  </div>
                )}
                <div>
                  <p className='font-medium'>Total:</p>
                  <p className='text-muted-foreground font-bold'>
                    {grandTotal.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className='font-medium'>Net Total:</p>
                  <p className='text-muted-foreground font-bold'>
                    {netTotal.toFixed(2)}
                  </p>
                </div>

                <div className='flex items-center gap-2'>
                  <Calendar className='text-muted-foreground h-4 w-4' />
                  <p>
                    <span className='font-medium'>Sale Date:</span>{' '}
                    {formatDate(sale.saleDate || sale.createdAt)}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <Package className='text-muted-foreground h-4 w-4' />
                  <p>
                    <span className='font-medium'>Total Items:</span>{' '}
                    {sale.totalProducts}
                  </p>
                </div>
                {hasUndeliveredItems && (
                  <div className='flex items-center gap-2'>
                    <Truck className='h-4 w-4 text-amber-500' />
                    <p className='font-medium text-amber-600'>
                      Undelivered Items: {undeliveredItemsCount}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {sale.items && sale.items.length > 0 ? (
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold'>Sale Items</h3>
                {hasUndeliveredItems && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleSelectAll}
                    disabled={updating}
                  >
                    {selectedItems.length === undeliveredItemsCount
                      ? 'Deselect All'
                      : 'Select All'}
                  </Button>
                )}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    {hasUndeliveredItems && (
                      <TableHead className='w-12.5'>
                        <Checkbox
                          checked={
                            selectedItems.length === undeliveredItemsCount &&
                            undeliveredItemsCount > 0
                          }
                          onCheckedChange={handleSelectAll}
                          disabled={updating}
                        />
                      </TableHead>
                    )}
                    <TableHead>Product</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Shop</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sale.items.map((item: ISellItem) => {
                    // Get batch information from batches relation
                    const batchInfo =
                      item.batches && item.batches.length > 0
                        ? item.batches
                            .map(
                              (b) =>
                                `Batch Number: ${b.batch?.batchNumber || 'N/A'} , Quantity: ${b.quantity}`
                            )
                            .join(', ')
                        : 'N/A';

                    return (
                      <TableRow key={item.id}>
                        {hasUndeliveredItems && (
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={() =>
                                handleItemSelection(item.id)
                              }
                              disabled={
                                updating ||
                                item.itemSaleStatus === ItemSaleStatus.DELIVERED
                              }
                            />
                          </TableCell>
                        )}
                        <TableCell className='font-medium'>
                          {item.product?.name || 'Unknown Product'}
                        </TableCell>
                        <TableCell>{batchInfo}</TableCell>
                        <TableCell>
                          {item.shop?.name || 'Unknown Shop'}
                        </TableCell>
                        <TableCell>
                          {item.unitOfMeasure?.name || 'Unknown Unit'}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell>{item.totalPrice.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.itemSaleStatus === ItemSaleStatus.DELIVERED
                                ? 'default'
                                : item.itemSaleStatus === ItemSaleStatus.PENDING
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {item.itemSaleStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className='text-muted-foreground py-4 text-center'>
              No items found in this sale
            </div>
          )}

          {/* Stock Corrections Section */}
          <Card className='shadow-lg'>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle className='flex items-center gap-2 text-xl font-bold'>
                <AlertTriangle className='text-amber-500' />
                Stock Corrections
                {stockCorrections.length > 0 && (
                  <Badge variant='secondary' className='ml-2'>
                    {stockCorrections.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCorrections ? (
                <div className='flex items-center justify-center py-4'>
                  <Loader2 className='mr-2 h-6 w-6 animate-spin' />
                  <p>Loading stock corrections...</p>
                </div>
              ) : stockCorrections.length === 0 ? (
                <div className='text-muted-foreground py-6 text-center'>
                  <p>No stock corrections found for this sale</p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {stockCorrections.map((correction) => (
                    <Card
                      key={correction.id}
                      className='border-l-4 border-l-amber-500'
                    >
                      <CardContent className='pt-4'>
                        <div className='mb-4 flex items-start justify-between'>
                          <div>
                            <div className='mt-2 flex flex-wrap gap-4'>
                              <Badge
                                variant={
                                  correction.status ===
                                  SellStockCorrectionStatus.APPROVED
                                    ? 'default'
                                    : correction.status ===
                                        SellStockCorrectionStatus.REJECTED
                                      ? 'destructive'
                                      : 'secondary'
                                }
                                className='capitalize'
                              >
                                Status: {correction.status.toLowerCase()}
                              </Badge>
                            </div>
                          </div>
                          <div className='flex gap-2'>
                            {correction.status ===
                              SellStockCorrectionStatus.PENDING && (
                              <>
                                <Button
                                  variant='destructive'
                                  size='sm'
                                  onClick={() =>
                                    handleCorrectionAction(
                                      correction.id,
                                      'reject'
                                    )
                                  }
                                  disabled={updating}
                                >
                                  Reject
                                </Button>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() =>
                                    handleCorrectionAction(
                                      correction.id,
                                      'delete'
                                    )
                                  }
                                  disabled={updating}
                                >
                                  Delete
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
                          <div>
                            <p className='text-muted-foreground text-sm'>
                              <span className='font-medium'>Created:</span>{' '}
                              {formatDate(correction.createdAt)}
                              {correction.createdBy &&
                                ` by ${correction.createdBy.name}`}
                            </p>
                          </div>
                          {correction.reference && (
                            <div>
                              <p className='text-muted-foreground text-sm'>
                                <span className='font-medium'>Reference:</span>{' '}
                                {correction.reference}
                              </p>
                            </div>
                          )}
                        </div>

                        {correction.notes && (
                          <div className='bg-muted mb-4 rounded-md p-3'>
                            <p className='text-sm font-medium'>Notes:</p>
                            <p className='text-muted-foreground text-sm'>
                              {correction.notes}
                            </p>
                          </div>
                        )}

                        <div className='mt-4'>
                          <h5 className='mb-3 font-medium'>
                            Correction Items:
                          </h5>
                          <div className='overflow-hidden rounded-lg border'>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className='w-50'>
                                    Product
                                  </TableHead>
                                  <TableHead className='w-30'>
                                    Batch
                                  </TableHead>
                                  <TableHead className='w-30'>
                                    Shop
                                  </TableHead>
                                  <TableHead className='w-25 text-right'>
                                    Unit Price
                                  </TableHead>
                                  <TableHead className='w-35 text-center'>
                                    Adjustment Qty
                                  </TableHead>
                                  <TableHead className='w-25 text-right'>
                                    Total Price
                                  </TableHead>
                                  <TableHead className='w-20'>
                                    Unit
                                  </TableHead>
                                  <TableHead className='w-25'>
                                    Type
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {correction.items &&
                                  correction.items.map(
                                    (item: ISellStockCorrectionItem, index) => {
                                      const isAddition = item.quantity > 0;
                                      // const isSubtraction = item.quantity < 0;

                                      // Get batch information
                                      // Get batch information from batches relation
                                      const batchInfo =
                                        item.batches && item.batches.length > 0
                                          ? item.batches
                                              .map(
                                                (b) =>
                                                  `Batch Number: ${b.batch?.batchNumber || 'N/A'} , Quantity: ${b.quantity}`
                                              )
                                              .join(', ')
                                          : 'N/A';
                                      return (
                                        <TableRow key={index}>
                                          <TableCell className='font-medium'>
                                            <div>
                                              <div>
                                                {item.product?.name ||
                                                  'Unknown Product'}
                                              </div>
                                              <div className='text-muted-foreground text-xs'>
                                                {item.product?.productCode ||
                                                  'No code'}
                                              </div>
                                            </div>
                                          </TableCell>
                                          <TableCell>{batchInfo}</TableCell>
                                          <TableCell>
                                            <div>
                                              <div>
                                                {item.shop?.name ||
                                                  'Unknown Shop'}
                                              </div>
                                              <div className='text-muted-foreground text-xs'>
                                                {isAddition
                                                  ? '➕ Stock added'
                                                  : '➖ Stock reduced'}
                                              </div>
                                            </div>
                                          </TableCell>
                                          <TableCell className='text-right'>
                                            {(item.unitPrice || 0).toFixed(2)}
                                          </TableCell>
                                          <TableCell className='text-center'>
                                            <Badge
                                              variant={
                                                isAddition
                                                  ? 'default'
                                                  : 'destructive'
                                              }
                                              className={
                                                isAddition ? 'bg-green-600' : ''
                                              }
                                            >
                                              {isAddition ? '+' : ''}
                                              {item.quantity}
                                            </Badge>
                                          </TableCell>
                                          <TableCell className='text-right font-medium'>
                                            {(item.totalPrice || 0).toFixed(2)}
                                          </TableCell>
                                          <TableCell>
                                            {item.unitOfMeasure?.name || 'N/A'}
                                          </TableCell>
                                          <TableCell>
                                            <Badge
                                              variant='outline'
                                              className={
                                                isAddition
                                                  ? 'border-green-600 text-green-600'
                                                  : 'border-red-600 text-red-600'
                                              }
                                            >
                                              {isAddition
                                                ? 'Addition'
                                                : 'Reduction'}
                                            </Badge>
                                          </TableCell>
                                        </TableRow>
                                      );
                                    }
                                  )}
                              </TableBody>
                            </Table>
                          </div>

                          {/* Correction Summary */}
                          {correction.items && correction.items.length > 0 && (
                            <div className='mt-4 space-y-2'>
                              <div className='flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800'>
                                <div>
                                  <span className='font-medium'>
                                    Items Count:{' '}
                                  </span>
                                  <span className='text-muted-foreground'>
                                    {correction.items.length} items
                                  </span>
                                </div>
                                <div className='text-right'>
                                  <span className='font-medium'>
                                    Correction Total:{' '}
                                  </span>
                                  <span className='text-lg font-bold text-blue-600 dark:text-blue-400'>
                                    {(correction.total || 0).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default SaleDetailPage;
