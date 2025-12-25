/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';
import { toast } from 'sonner';
import Image from 'next/image';
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
  Plus,
  Minus,
  Printer,
  Eye,
  Lock,
  Unlock,
  Trash2
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ISell, ISellItem, SaleStatus, ItemSaleStatus } from '@/models/Sell';
import {
  ISellStockCorrection,
  SellStockCorrectionStatus,
  ISellStockCorrectionItem
} from '@/models/SellStockCorrection';
import {
  getSellByIdByUser,
  getSellId,
  partialSaleDelivery
} from '@/service/Sell';
import { deliverAllSaleItems, completeSaleDelivery } from '@/service/Sell';
import {
  approveSellStockCorrection,
  deleteSellStockCorrection,
  getSellStockCorrectionsfilterSellId,
  rejectSellStockCorrection
} from '@/service/SellStockCorrection';
import { unlockSellById } from '@/service/Sell'; // Import the unlock function
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
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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

type DeliveryMode = 'all' | 'partial' | 'complete';

// Batch related types
interface IBatch {
  id: string;
  batchNumber: string;
  expiryDate: string;
  product: {
    name: string;
    unitOfMeasure: {
      name: string;
    };
  };
  ShopStock: Array<{
    quantity: number;
    unitOfMeasure: {
      name: string;
    };
  }>;
}

interface BatchAssignment {
  batchId: string;
  quantity: number;
  batchNumber: string;
  availableQuantity: number;
}

interface DeliveryItemData {
  itemId: string;
  batches: BatchAssignment[];
}

interface DeliveryData {
  items: DeliveryItemData[];
}

// Create a separate component for Batch Item to avoid hooks inside map
const BatchItem = ({
  batch,
  assignment,
  availableQty,
  maxAllowed,
  isMaxReached,
  remainingQuantity,
  updateBatchQuantity,
  removeBatchAssignment,
  handleAssignAllToBatch,
  availableBatches
}: {
  batch: IBatch;
  assignment?: BatchAssignment;
  availableQty: number;
  maxAllowed: number;
  isMaxReached: boolean;
  remainingQuantity: number;
  updateBatchQuantity: (batchId: string, newQuantity: number) => void;
  removeBatchAssignment: (batchId: string) => void;
  handleAssignAllToBatch: (batchId: string, availableQty: number) => void;
  availableBatches: IBatch[];
}) => {
  const [inputError, setInputError] = useState(false);

  const handleIncrement = () => {
    const newValue = (assignment?.quantity || 0) + 1;
    if (newValue <= maxAllowed) {
      updateBatchQuantity(batch.id, newValue);
      setInputError(false);
    } else {
      setInputError(true);
      toast.error(`Cannot assign more than ${maxAllowed} units to this batch`);
    }
  };

  const handleDecrement = () => {
    const newValue = (assignment?.quantity || 0) - 1;
    updateBatchQuantity(batch.id, newValue);
    setInputError(false);
  };

  const handleInputChange = (value: string) => {
    const numValue = parseInt(value) || 0;

    if (numValue > maxAllowed) {
      setInputError(true);
      toast.error(`Cannot assign more than ${maxAllowed} units to this batch`);
    } else {
      setInputError(false);
      updateBatchQuantity(batch.id, numValue);
    }
  };

  const handleInputBlur = () => {
    const currentValue = assignment?.quantity || 0;
    if (currentValue <= maxAllowed) {
      setInputError(false);
    }
  };

  return (
    <div
      key={batch.id}
      className={`flex items-center justify-between rounded-lg border p-3 ${isMaxReached ? 'opacity-50' : ''}`}
    >
      <div className='flex-1'>
        <div className='flex items-center gap-4'>
          <div>
            <p className='font-medium'>{batch.batchNumber}</p>
            <p className='text-muted-foreground text-sm'>
              Expires: {formatDate(batch.expiryDate)}
            </p>
          </div>
          <Badge variant='outline'>Available: {availableQty}</Badge>
          {assignment?.quantity && (
            <Badge variant='secondary'>Assigned: {assignment.quantity}</Badge>
          )}
        </div>
      </div>
      <div className='flex items-center gap-2'>
        {/* Assign All Button */}
        {remainingQuantity > 0 && availableQty > 0 && (
          <Button
            size='sm'
            variant='outline'
            onClick={() => handleAssignAllToBatch(batch.id, availableQty)}
            disabled={isMaxReached || remainingQuantity === 0}
            title={`Assign all remaining quantity (${remainingQuantity}) to this batch`}
            className='border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
          >
            <Check className='mr-1 h-3 w-3' />
            Assign All ({Math.min(remainingQuantity, availableQty)})
          </Button>
        )}

        <Button
          size='sm'
          variant='outline'
          onClick={handleDecrement}
          disabled={!assignment?.quantity || isMaxReached}
        >
          <Minus className='h-4 w-4' />
        </Button>

        {/* Input with validation */}
        <Input
          type='number'
          className={`w-20 text-center ${inputError ? 'border-red-500 bg-red-50' : ''}`}
          value={assignment?.quantity || 0}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={handleInputBlur}
          min={0}
          max={maxAllowed}
          disabled={isMaxReached && !assignment?.quantity}
          title={
            inputError
              ? `Exceeds available quantity! Maximum: ${maxAllowed}`
              : isMaxReached
                ? 'Maximum quantity reached for this item'
                : `Maximum: ${maxAllowed}`
          }
        />

        {inputError && (
          <div className='absolute -bottom-6 left-0 text-xs text-red-500'>
            Max: {maxAllowed}
          </div>
        )}

        <Button
          size='sm'
          variant='outline'
          onClick={handleIncrement}
          disabled={isMaxReached || (assignment?.quantity || 0) >= maxAllowed}
          title={
            isMaxReached
              ? 'Maximum quantity reached for this item'
              : `Maximum: ${maxAllowed}`
          }
        >
          <Plus className='h-4 w-4' />
        </Button>

        {assignment?.quantity && (
          <Button
            size='sm'
            variant='destructive'
            onClick={() => {
              removeBatchAssignment(batch.id);
              setInputError(false);
            }}
          >
            <X className='h-4 w-4' />
          </Button>
        )}
      </div>
    </div>
  );
};

const StoreSaleDetailPage: React.FC<SaleViewProps> = ({ id }) => {
  const [sale, setSale] = useState<ISell | null>(null);
  const [allSaleItems, setAllSaleItems] = useState<ISell | null>(null);
  const [stockCorrections, setStockCorrections] = useState<
    ISellStockCorrection[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadingCorrections, setLoadingCorrections] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [unlocking, setUnlocking] = useState(false); // State for unlock loading
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deliveryDialog, setDeliveryDialog] = useState(false);
  const [unlockDialog, setUnlockDialog] = useState(false); // State for unlock dialog
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Batch selection modal state
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<ISellItem | null>(null);
  const [availableBatches, setAvailableBatches] = useState<IBatch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [batchAssignments, setBatchAssignments] = useState<BatchAssignment[]>(
    []
  );
  const [deliveryData, setDeliveryData] = useState<DeliveryData>({ items: [] });

  // Stock correction state
  const [open, setOpen] = useState(false);
  const [selectedCorrectionId, setSelectedCorrectionId] = useState<
    string | null
  >(null);
  const [actionType, setActionType] = useState<
    'approve' | 'reject' | 'delete' | null
  >(null);

  // State for stock correction delivery
  const [stockCorrectionDelivery, setStockCorrectionDelivery] = useState<{
    [correctionId: string]: string[]; // correctionId -> array of delivered item IDs
  }>({});

  // State for stock correction approve modal
  const [approveCorrectionDialog, setApproveCorrectionDialog] = useState(false);
  const [selectedCorrectionForApprove, setSelectedCorrectionForApprove] =
    useState<ISellStockCorrection | null>(null);

  const [netTotalAdjustment, setNetTotalAdjustment] =
    useState<NetTotalAdjustment | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ordere.net';

  // Helper functions
  const normalizeImagePath = (path?: string | File) => {
    if (!path) return '/placeholder-image.jpg';
    if (typeof path !== 'string') return '/placeholder-image.jpg';

    const normalizedPath = path.replace(/\\/g, '/');
    if (normalizedPath.startsWith('http')) return normalizedPath;

    const cleanPath = normalizedPath.replace(/^\/+/, '');
    return `${BACKEND_URL}/${cleanPath}`;
  };

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

  useEffect(() => {
    const fetchSaleAndCorrections = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Get sale items for the current user's shop (for editing/delivery)
        const saleData = await getSellByIdByUser(id);
        setSale(saleData);

        // Get all sale items for viewing only
        const allSaleData = await getSellId(id);
        setAllSaleItems(allSaleData);

        setLoadingCorrections(true);
        const corrections = await getSellStockCorrectionsfilterSellId(id);
        setStockCorrections(corrections);

        calculateNetTotalAdjustment(corrections, allSaleData);
      } catch  {
        toast.error('Failed to fetch sale details');
      } finally {
        setLoading(false);
        setLoadingCorrections(false);
      }
    };

    fetchSaleAndCorrections();
  }, [id, refreshTrigger, calculateNetTotalAdjustment]);

  useEffect(() => {
    if (allSaleItems && stockCorrections.length > 0) {
      calculateNetTotalAdjustment(stockCorrections, allSaleItems);
    } else {
      setNetTotalAdjustment(null);
    }
  }, [allSaleItems, stockCorrections, calculateNetTotalAdjustment]);

  // Get items that can be edited (user's shop items)
  const getEditableItems = (): ISellItem[] => {
    if (!allSaleItems?.items || !sale?.items) return [];
    return allSaleItems.items.filter((item) =>
      sale.items?.some((userItem) => userItem.id === item.id)
    );
  };

  // Get items that are view-only (other shops' items)
  const getViewOnlyItems = (): ISellItem[] => {
    if (!allSaleItems?.items || !sale?.items) return allSaleItems?.items || [];
    return allSaleItems.items.filter(
      (item) => !sale.items?.some((userItem) => userItem.id === item.id)
    );
  };

  // Handle unlock sale
  const handleUnlockSale = async () => {
    if (!id) return;

    setUnlocking(true);
    try {
      await unlockSellById(id);
      toast.success('Sale unlocked successfully');

      // Refresh the sale data
      setRefreshTrigger((prev) => prev + 1);

      // Update the local state immediately
      if (allSaleItems) {
        setAllSaleItems({
          ...allSaleItems,
          locked: false
        });
      }

      if (sale) {
        setSale({
          ...sale,
          locked: false
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to unlock sale');
    } finally {
      setUnlocking(false);
      setUnlockDialog(false);
    }
  };

  const handlePrint = () => {
    if (!allSaleItems) return;

    const printableData: PrintableSaleData = {
      sale: allSaleItems,
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
        // Get batch information from batches relation with batch number and quantity
        const batchInfo =
          item.batches && item.batches.length > 0
            ? item.batches
                .map(
                  (b) =>
                    `Batch Number: ${b.batch?.batchNumber || 'N/A'} , Quantity: ${b.quantity}`
                )
                .join(', ')
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
                item.batches
                  ?.map(
                    (b) =>
                      `Batch Number: ${b.batch?.batchNumber || 'N/A'} , Quantity: ${b.quantity}`
                  )
                  .join(', ') || 'N/A',
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
                <div><strong>Lock Status:</strong> ${sale.locked ? 'Locked' : 'Unlocked'}</div>
              </div>
            </div>

            <!-- Sale Information -->
            <div class="section">
              <div class="section-title">Sale Information</div>
              <div class="grid-2">
                <div>
                  <p><strong>Customer:</strong> ${sale.customer?.name || 'N/A'}</p>
                  <p><strong>Initiated By:</strong> ${sale.createdBy?.name || 'N/A'}</p>
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
                      <td class="text-right">$${item.unitPrice.toFixed(2)}</td>
                      <td class="text-right">$${item.totalPrice.toFixed(2)}</td>
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
                  ${sale.discount > 0 ? `<p><strong>Discount:</strong> -$${sale.discount.toFixed(2)}</p>` : ''}
                  ${sale.vat > 0 ? `<p><strong>VAT:</strong> $${sale.vat.toFixed(2)}</p>` : ''}
                  <p><strong>Net Total:</strong> $${netTotal.toFixed(2)}</p>
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

  // Open batch selection modal
  const openBatchModal = async (item: ISellItem) => {
    if (!item.shop?.id || !item.product?.id) {
      toast.error('Shop or product information missing');
      return;
    }

    setCurrentItem(item);
    setLoadingBatches(true);
    setBatchModalOpen(true);

    try {
      const batchesData = await getAvailableBatchesByProductAndShop(
        item.shop.id,
        item.product.id
      );
      setAvailableBatches(batchesData.batches || []);

      // Initialize batch assignments for this item
      const existingAssignments =
        deliveryData.items.find((i) => i.itemId === item.id)?.batches || [];
      setBatchAssignments(existingAssignments);
    } catch  {
      toast.error('Failed to load available batches');
    } finally {
      setLoadingBatches(false);
    }
  };

  // Calculate remaining quantity that can be assigned
  const getRemainingQuantity = () => {
    if (!currentItem) return 0;
    const totalAssigned = batchAssignments.reduce(
      (sum, b) => sum + b.quantity,
      0
    );
    return Math.max(0, currentItem.quantity - totalAssigned);
  };

  // Calculate maximum quantity that can be assigned to a specific batch
  const getMaxQuantityForBatch = (batchId: string, availableQty: number) => {
    const remainingQty = getRemainingQuantity();
    const currentAssignment = batchAssignments.find(
      (b) => b.batchId === batchId
    );
    const currentQty = currentAssignment?.quantity || 0;

    return Math.min(availableQty, currentQty + remainingQty);
  };

  // Update batch quantity with validation
  const updateBatchQuantity = (batchId: string, newQuantity: number) => {
    const batch = availableBatches.find((b) => b.id === batchId);
    if (!batch) return;

    const availableQty = batch.ShopStock[0]?.quantity || 0;
    const maxAllowed = getMaxQuantityForBatch(batchId, availableQty);

    const validatedQuantity = Math.max(0, Math.min(newQuantity, maxAllowed));

    setBatchAssignments((prev) => {
      const existing = prev.find((b) => b.batchId === batchId);
      if (existing) {
        return prev.map((b) =>
          b.batchId === batchId ? { ...b, quantity: validatedQuantity } : b
        );
      } else {
        return [
          ...prev,
          {
            batchId,
            quantity: validatedQuantity,
            batchNumber: batch.batchNumber,
            availableQuantity: availableQty
          }
        ];
      }
    });
  };

  // Remove batch assignment
  const removeBatchAssignment = (batchId: string) => {
    setBatchAssignments((prev) => prev.filter((b) => b.batchId !== batchId));
  };

  // NEW: Clear all batch assignments for current item
  const clearBatchAssignments = () => {
    setBatchAssignments([]);
    toast.success('Cleared all batch assignments');
  };

  // Save batch assignments for current item
  const saveBatchAssignments = () => {
    if (!currentItem) return;

    const totalAssignedQuantity = batchAssignments.reduce(
      (sum, b) => sum + b.quantity,
      0
    );

    if (totalAssignedQuantity !== currentItem.quantity) {
      toast.error(
        `Total assigned quantity (${totalAssignedQuantity}) must match item quantity (${currentItem.quantity})`
      );
      return;
    }

    // Validate no assignment exceeds available quantity
    const invalidAssignment = batchAssignments.find(
      (b) => b.quantity > b.availableQuantity
    );
    if (invalidAssignment) {
      toast.error(
        `Quantity for batch ${invalidAssignment.batchNumber} exceeds available stock`
      );
      return;
    }

    // Update delivery data
    setDeliveryData((prev) => ({
      items: [
        ...prev.items.filter((i) => i.itemId !== currentItem.id),
        {
          itemId: currentItem.id,
          batches: batchAssignments
        }
      ]
    }));

    // Add to selected items if not already selected
    if (!selectedItems.includes(currentItem.id)) {
      setSelectedItems((prev) => [...prev, currentItem.id]);
    }

    setBatchModalOpen(false);
    toast.success('Batch assignments saved successfully');
  };

  // Get assigned batches for an item
  const getAssignedBatches = (itemId: string): BatchAssignment[] => {
    return deliveryData.items.find((i) => i.itemId === itemId)?.batches || [];
  };

  // Get total assigned quantity for an item
  const getTotalAssignedQuantity = (itemId: string): number => {
    return getAssignedBatches(itemId).reduce((sum, b) => sum + b.quantity, 0);
  };

  // Clear batch assignments for a specific item
  const clearItemBatchAssignments = (itemId: string) => {
    setDeliveryData((prev) => ({
      items: prev.items.filter((i) => i.itemId !== itemId)
    }));

    // Remove from selected items
    setSelectedItems((prev) => prev.filter((id) => id !== itemId));

    toast.success('Cleared batch assignments for this item');
  };

  // Clear all batch assignments
  const clearAllBatchAssignments = () => {
    setDeliveryData({ items: [] });
    setSelectedItems([]);
    toast.success('Cleared all batch assignments');
  };

  const handleDelivery = async (mode: DeliveryMode) => {
    if (!id) return;

    // Validate all selected items have batch assignments
    const itemsWithoutAssignments = selectedItems.filter(
      (itemId) =>
        !deliveryData.items.some((i) => i.itemId === itemId) ||
        deliveryData.items.find((i) => i.itemId === itemId)?.batches.length ===
          0
    );

    if (itemsWithoutAssignments.length > 0) {
      toast.error(
        'Please assign batches for all selected items before delivery'
      );
      return;
    }

    // Validate quantities match
    const invalidItems = selectedItems.filter((itemId) => {
      const item = sale?.items?.find((i) => i.id === itemId);
      const assignedQuantity = getTotalAssignedQuantity(itemId);
      return item && assignedQuantity !== item.quantity;
    });

    if (invalidItems.length > 0) {
      toast.error('Assigned batch quantities must match item quantities');
      return;
    }

    setDeliveryMode(mode);
    setDeliveryDialog(true);
  };

  const confirmDelivery = async () => {
    if (!id || !deliveryMode) return;

    setUpdating(true);
    try {
      const itemsToDeliver = deliveryData.items.filter((item) =>
        selectedItems.includes(item.itemId)
      );

      const deliveryPayload = {
        items: itemsToDeliver
      };

      let updatedSale;

      switch (deliveryMode) {
        case 'all':
          updatedSale = await deliverAllSaleItems(id, deliveryPayload);
          break;
        case 'complete':
          updatedSale = await completeSaleDelivery(id, deliveryPayload);
          break;
        case 'partial':
          updatedSale = await partialSaleDelivery(id, deliveryPayload);
          break;
        default:
          throw new Error('Invalid delivery mode');
      }

      setSale(updatedSale);
      toast.success(`Sale delivered successfully`);
      setRefreshTrigger((prev) => prev + 1);
      setSelectedItems([]);
      setDeliveryData({ items: [] });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          `Failed to ${deliveryMode} deliver sale`
      );
    } finally {
      setUpdating(false);
      setDeliveryDialog(false);
      setDeliveryMode(null);
    }
  };

  // Handle stock correction item delivery selection
  const handleCorrectionItemDelivery = (correctionId: string, itemId: string) => {
    setStockCorrectionDelivery((prev) => {
      const currentDeliveredItems = prev[correctionId] || [];
      const isAlreadyDelivered = currentDeliveredItems.includes(itemId);
      
      if (isAlreadyDelivered) {
        // Remove from delivered items
        return {
          ...prev,
          [correctionId]: currentDeliveredItems.filter(id => id !== itemId)
        };
      } else {
        // Add to delivered items
        return {
          ...prev,
          [correctionId]: [...currentDeliveredItems, itemId]
        };
      }
    });
  };

  // Handle approve stock correction with selected items
  const handleApproveCorrectionWithItems = (correction: ISellStockCorrection) => {
    setSelectedCorrectionForApprove(correction);
    setApproveCorrectionDialog(true);
  };

  const confirmApproveCorrection = async () => {
    if (!selectedCorrectionForApprove) return;

    setUpdating(true);
    try {
      const deliveredItemIds = stockCorrectionDelivery[selectedCorrectionForApprove.id] || [];
      
      await approveSellStockCorrection(
        selectedCorrectionForApprove.id,
        deliveredItemIds
      );
      
      toast.success('Stock correction approved successfully');
      setRefreshTrigger((prev) => prev + 1);
      
      // Clear the delivery selection for this correction
      setStockCorrectionDelivery((prev) => {
        const { [selectedCorrectionForApprove.id]: _, ...rest } = prev;
        return rest;
      });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          'Failed to approve stock correction'
      );
    } finally {
      setUpdating(false);
      setApproveCorrectionDialog(false);
      setSelectedCorrectionForApprove(null);
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
      if (actionType === 'approve' && selectedCorrectionId) {
        // For old approve method (without item selection)
        await approveSellStockCorrection(selectedCorrectionId, []);
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
          `Failed to ${actionType} stock correction`
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
    const editableItems = getEditableItems();
    const undeliveredItemIds = editableItems
      .filter((item) => item.itemSaleStatus !== ItemSaleStatus.DELIVERED)
      .map((item) => item.id);

    if (selectedItems.length === undeliveredItemIds.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(undeliveredItemIds);
    }
  };

  // Get product name from product relation
  const getProductName = (item: ISellItem): string => {
    return item.product?.name || 'Unknown Product';
  };

  const handleAssignAllToBatch = (batchId: string, availableQty: number) => {
    const batch = availableBatches.find((b) => b.id === batchId);
    if (!batch) return;

    const remainingQuantity = getRemainingQuantity();
    const quantityToAssign = Math.min(remainingQuantity, availableQty);

    if (quantityToAssign <= 0) {
      toast.error('No quantity available to assign');
      return;
    }

    // Update the batch assignment with the remaining quantity
    updateBatchQuantity(batchId, quantityToAssign);

    toast.success(
      `Assigned ${quantityToAssign} units to batch ${batch.batchNumber}`
    );
  };

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2 className='mr-2 h-8 w-8 animate-spin' />
        <p>Loading sale details...</p>
      </div>
    );
  }

  if (!allSaleItems) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <p>Sale not found</p>
      </div>
    );
  }

  const isImmutable = [SaleStatus.DELIVERED, SaleStatus.CANCELLED].includes(
    allSaleItems.saleStatus
  );
  const editableItems = getEditableItems();
  const viewOnlyItems = getViewOnlyItems();
  const hasUndeliveredItems = editableItems.some(
    (item) => item.itemSaleStatus !== ItemSaleStatus.DELIVERED
  );
  const undeliveredItemsCount =
    editableItems.filter(
      (item) => item.itemSaleStatus !== ItemSaleStatus.DELIVERED
    ).length || 0;

  // Check if all selected items have batch assignments
  const allSelectedItemsHaveBatches =
    selectedItems.length > 0 &&
    selectedItems.every((itemId) => {
      const assignments = getAssignedBatches(itemId);
      const item = editableItems.find((i) => i.id === itemId);
      return (
        assignments.length > 0 &&
        assignments.reduce((sum, b) => sum + b.quantity, 0) === item?.quantity
      );
    });

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

  const getItemStatusVariant = (
    itemStatus: ItemSaleStatus
  ): 'default' | 'destructive' | 'outline' | 'secondary' => {
    switch (itemStatus) {
      case ItemSaleStatus.DELIVERED:
        return 'default';
      case ItemSaleStatus.PENDING:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const grandTotal = allSaleItems.grandTotal || 0;
  const netTotal = allSaleItems.NetTotal || 0;
  const isSaleLocked = allSaleItems.locked === true;

  return (
    <div className='container mx-auto space-y-6 p-4 md:p-8'>
      {/* Print Section - Hidden from screen but visible in print */}
      <div ref={printRef} className='hidden'>
        {/* This div will be used for print content */}
      </div>

      {/* Unlock Confirmation Dialog */}
      <AlertDialog open={unlockDialog} onOpenChange={setUnlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlock Sale</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlock this sale?
              <br />
              <br />
              <strong>Invoice No:</strong> {allSaleItems.invoiceNo}
              <br />
              <strong>Sale Date:</strong>{' '}
              {formatDate(allSaleItems.saleDate || allSaleItems.createdAt)}
              <br />
              <strong>Current Status:</strong> {allSaleItems.saleStatus}
              <br />
              <br />
              Once unlocked, you will be able to make modifications to this
              sale.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={unlocking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnlockSale}
              disabled={unlocking}
              className='bg-green-600 hover:bg-green-700'
            >
              {unlocking ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Unlocking...
                </>
              ) : (
                <>
                  <Unlock className='mr-2 h-4 w-4' />
                  Yes, Unlock Sale
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Correction with Items Dialog */}
      <AlertDialog open={approveCorrectionDialog} onOpenChange={setApproveCorrectionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Stock Correction</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCorrectionForApprove && (
                <>
                  <p>Select which items have been delivered for correction:</p>
                  <div className='mt-4 max-h-60 overflow-y-auto'>
                    {selectedCorrectionForApprove.items?.map((item) => {
                      const isDelivered = stockCorrectionDelivery[selectedCorrectionForApprove.id]?.includes(item.id);
                      const isAddition = item.quantity > 0;
                      
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-2 rounded mb-2 ${isDelivered ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}
                        >
                          <div className='flex items-center gap-3'>
                            <Checkbox
                              checked={isDelivered}
                              onCheckedChange={() => handleCorrectionItemDelivery(selectedCorrectionForApprove.id, item.id)}
                            />
                            <div>
                              <p className='font-medium'>{item.product?.name}</p>
                              <p className='text-sm text-gray-600'>
                                {isAddition ? '+' : ''}{item.quantity} units • {item.shop?.name}
                              </p>
                            </div>
                          </div>
                          <Badge variant={isAddition ? 'default' : 'destructive'}>
                            {isAddition ? 'Addition' : 'Reduction'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApproveCorrection}
              disabled={updating}
              className='bg-green-600 hover:bg-green-700'
            >
              {updating ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Approving...
                </>
              ) : (
                <>
                  <Check className='mr-2 h-4 w-4' />
                  Approve Selected Items
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Print Button and Unlock Button (if locked) */}
      <div className='flex justify-between gap-2'>
        <div>
            <Button
              onClick={() => setUnlockDialog(true)}
              variant='destructive'
              className='flex items-center gap-2'
              disabled={unlocking}
            >
              {unlocking ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Lock className='h-4 w-4' />
              )}
               Click to Unlock/Locked
            </Button>
          
        </div>
        <div className='flex gap-2'>
          {/* Clear All Button */}
          <Button
            onClick={handlePrint}
            variant='outline'
            className='flex items-center gap-2'
          >
            <Printer className='h-4 w-4' />
            Print Invoice
          </Button>
        </div>
      </div>

      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={updating}
        title={
          actionType === 'approve'
            ? 'Approve Correction'
            : actionType === 'reject'
              ? 'Reject Correction'
              : 'Delete Correction'
        }
        description={
          actionType === 'approve'
            ? 'Are you sure you want to approve this stock correction?'
            : actionType === 'reject'
              ? 'Are you sure you want to reject this stock correction?'
              : 'Are you sure you want to delete this stock correction?'
        }
      />

      {/* Batch Selection Modal */}
      <Dialog open={batchModalOpen} onOpenChange={setBatchModalOpen}>
        <DialogContent className='max-w-20xl max-h-[180vh] overflow-y-auto'>
          <DialogHeader>
            <div className='flex items-start gap-4'>
              {currentItem?.product?.imageUrl && (
                <div className='relative h-20 w-20 shrink-0'>
                  <Image
                    src={normalizeImagePath(currentItem.product.imageUrl)}
                    alt={currentItem.product.name}
                    fill
                    className='rounded-lg border object-cover'
                    sizes='80px'
                    onError={(e) => {
                      e.currentTarget.src = '/clinic1.jpg';
                    }}
                  />
                </div>
              )}
              <div className='flex-1'>
                <DialogTitle className='text-xl'>
                  Assign Batches for {currentItem?.product?.name}
                </DialogTitle>
                <DialogDescription className='mt-2 space-y-2'>
                  Assign quantities to available batches. Total assigned
                  quantity must equal {currentItem?.quantity}.
                  <div className='rounded bg-blue-50 p-2 text-sm text-blue-700'>
                    <strong>
                      Remaining to assign: {getRemainingQuantity()}
                    </strong>
                  </div>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {loadingBatches ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='mr-2 h-8 w-8 animate-spin' />
              <p>Loading available batches...</p>
            </div>
          ) : (
            <div className='space-y-6'>
              {/* Available Batches */}
              <div>
                <h4 className='mb-3 font-semibold'>Available Batches</h4>
                <div className='max-h-60 space-y-2 overflow-y-auto'>
                  {availableBatches.map((batch) => {
                    const assignment = batchAssignments.find(
                      (b) => b.batchId === batch.id
                    );
                    const availableQty = batch.ShopStock[0]?.quantity || 0;
                    const maxAllowed = getMaxQuantityForBatch(
                      batch.id,
                      availableQty
                    );
                    const isMaxReached =
                      maxAllowed === 0 && !assignment?.quantity;
                    const remainingQuantity = getRemainingQuantity();

                    return (
                      <BatchItem
                        key={batch.id}
                        batch={batch}
                        assignment={assignment}
                        availableQty={availableQty}
                        maxAllowed={maxAllowed}
                        isMaxReached={isMaxReached}
                        remainingQuantity={remainingQuantity}
                        updateBatchQuantity={updateBatchQuantity}
                        removeBatchAssignment={removeBatchAssignment}
                        handleAssignAllToBatch={handleAssignAllToBatch}
                        availableBatches={availableBatches}
                      />
                    );
                  })}
                </div>
                {availableBatches.length === 0 && (
                  <p className='text-muted-foreground py-4 text-center'>
                    No available batches found
                  </p>
                )}
              </div>

              {/* Current Assignments Summary */}
              {batchAssignments.length > 0 && (
                <div className='border-t pt-4'>
                  <div className='flex items-center justify-between mb-3'>
                    <h4 className='font-semibold'>Current Assignments</h4>
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={clearBatchAssignments}
                    >
                      <Trash2 className='mr-1 h-3 w-3' />
                      Clear All
                    </Button>
                  </div>
                  <div className='space-y-2'>
                    {batchAssignments.map((assignment) => (
                      <div
                        key={assignment.batchId}
                        className='bg-muted flex items-center justify-between rounded p-2'
                      >
                        <div>
                          <span className='font-medium'>
                            {assignment.batchNumber}
                          </span>
                          <span className='text-muted-foreground ml-2 text-sm'>
                            (max: {assignment.availableQuantity})
                          </span>
                        </div>
                        <span>{assignment.quantity} units</span>
                      </div>
                    ))}
                    <div className='flex items-center justify-between border-t pt-2 font-semibold'>
                      <span>Total Assigned:</span>
                      <span
                        className={
                          getRemainingQuantity() === 0
                            ? 'text-green-600'
                            : 'text-amber-600'
                        }
                      >
                        {batchAssignments.reduce(
                          (sum, b) => sum + b.quantity,
                          0
                        )}{' '}
                        / {currentItem?.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className='flex flex-col gap-2 sm:flex-row'>
            <Button variant='outline' onClick={() => setBatchModalOpen(false)}>
              Cancel
            </Button>
            {batchAssignments.length > 0 && (
              <Button
                variant='destructive'
                onClick={clearBatchAssignments}
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Clear
              </Button>
            )}
            <Button
              onClick={saveBatchAssignments}
              disabled={
                batchAssignments.reduce((sum, b) => sum + b.quantity, 0) !==
                  currentItem?.quantity ||
                // Additional validation: check if any assignment exceeds available quantity
                batchAssignments.some(
                  (assignment) =>
                    assignment.quantity > assignment.availableQuantity
                )
              }
              className={
                batchAssignments.some(
                  (assignment) =>
                    assignment.quantity > assignment.availableQuantity
                )
                  ? 'bg-red-500 hover:bg-red-600'
                  : ''
              }
            >
              Save Assignments
              {batchAssignments.some(
                (assignment) =>
                  assignment.quantity > assignment.availableQuantity
              ) && (
                <span className='ml-2 text-xs'>⚠️ Some batches exceeded!</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery Confirmation Dialog */}
      <AlertDialog open={deliveryDialog} onOpenChange={setDeliveryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deliveryMode === 'all'
                ? 'Confirm Complete Delivery'
                : deliveryMode === 'complete'
                  ? 'Confirm Complete Delivery'
                  : 'Confirm Partial Delivery'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deliveryMode === 'all'
                ? 'Are you sure you want to deliver ALL items of this sale? This action cannot be undone.'
                : deliveryMode === 'complete'
                  ? `Are you sure you want to deliver ${selectedItems.length} selected item(s)? This will mark the sale as COMPLETELY delivered.`
                  : `Are you sure you want to  deliver ${selectedItems.length} item(s)? The sale will be marked as  DELIVERED.`}

              {selectedItems.length > 0 && (
                <div className='bg-muted mt-4 rounded p-3'>
                  <p className='mb-2 font-medium'>Items to be delivered:</p>
                  {selectedItems.map((itemId) => {
                    const item = editableItems.find((i) => i.id === itemId);
                    const assignments = getAssignedBatches(itemId);
                    return (
                      <div key={itemId} className='text-sm'>
                        <p className='font-medium'>{item?.product?.name}</p>
                        <p className='text-muted-foreground'>
                          {assignments
                            .map((a) => `${a.batchNumber}: ${a.quantity}`)
                            .join(', ')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelivery} disabled={updating}>
              {updating ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : null}
              Confirm Delivery
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delivery Action Card - Only show if user has editable items and sale is not locked */}
      {!isImmutable && selectedItems.length > 0 && (
        <Card className='border-green-200 bg-green-50 shadow-lg dark:border-green-900 dark:bg-green-950'>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-xl font-bold text-green-800 dark:text-green-300'>
              <Truck className='h-5 w-5' />
              Deliver Selected Items
            </CardTitle>
          </CardHeader>

          <CardContent className='space-y-4'>
            <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
              <div className='space-y-2'>
                <p className='font-medium text-green-700 dark:text-green-400'>
                  {selectedItems.length} item(s) selected for delivery
                </p>

                {!allSelectedItemsHaveBatches && (
                  <div className='flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400'>
                    <AlertTriangle className='h-4 w-4' />
                    <span>
                      Some selected items don&apos;t have complete batch
                      assignments
                    </span>
                  </div>
                )}
              </div>

              <div className='flex flex-col gap-2 sm:flex-row'>
                <Button
                  onClick={() => handleDelivery('partial')}
                  disabled={updating || !allSelectedItemsHaveBatches}
                  variant='default'
                  className='bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
                  size='lg'
                >
                  <Truck className='mr-2 h-5 w-5' />
                  Deliver Selected ({selectedItems.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Sale Card */}
      <Card className='shadow-lg'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-2xl font-bold'>
            <ShoppingCart className='text-primary' />
            Sale {allSaleItems.invoiceNo}
            <Badge
              variant={getStatusVariant(allSaleItems.saleStatus)}
              className='ml-2'
            >
              {allSaleItems.saleStatus === SaleStatus.DELIVERED ? (
                <>
                  <Check className='mr-1 h-3 w-3' /> {allSaleItems.saleStatus}
                </>
              ) : allSaleItems.saleStatus === SaleStatus.CANCELLED ? (
                <>
                  <X className='mr-1 h-3 w-3' /> {allSaleItems.saleStatus}
                </>
              ) : allSaleItems.saleStatus === SaleStatus.PARTIALLY_DELIVERED ? (
                <>
                  <Truck className='mr-1 h-3 w-3' /> {allSaleItems.saleStatus}
                </>
              ) : (
                <>{allSaleItems.saleStatus}</>
              )}
            </Badge>
            {isSaleLocked && (
              <Badge
                variant='destructive'
                className='ml-2 flex items-center gap-1'
              >
                <Lock className='h-3 w-3' />
                Locked
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* Sale Information */}
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
                    {allSaleItems?.invoiceNo}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  {isSaleLocked ? (
                    <Lock className='h-4 w-4 text-red-600' />
                  ) : (
                    <Unlock className='h-4 w-4 text-green-600' />
                  )}
                  <p>
                    <span className='font-medium'>Status:</span>{' '}
                    {isSaleLocked ? 'Locked' : 'Unlocked'}
                  </p>
                </div>
                {allSaleItems.branch && (
                  <div className='flex items-center gap-2'>
                    <Package className='text-muted-foreground h-4 w-4' />
                    <p>
                      <span className='font-medium'>Branch:</span>{' '}
                      {allSaleItems?.branch?.name}
                    </p>
                  </div>
                )}
                {allSaleItems.customer && (
                  <div className='flex items-center gap-2'>
                    <User className='text-muted-foreground h-4 w-4' />
                    <p>
                      <span className='font-medium'>Customer:</span>{' '}
                      {allSaleItems?.customer?.name}
                    </p>
                  </div>
                )}
                {allSaleItems.createdBy && (
                  <div className='flex items-center gap-2'>
                    <User className='text-muted-foreground h-4 w-4' />
                    <p>
                      <span className='font-medium'>Created By:</span>{' '}
                      {allSaleItems?.createdBy?.name}
                    </p>
                  </div>
                )}
                {allSaleItems.updatedBy && (
                  <div className='flex items-center gap-2'>
                    <User className='text-muted-foreground h-4 w-4' />
                    <p>
                      <span className='font-medium'>Last Updated By:</span>{' '}
                      {allSaleItems?.updatedBy?.name}
                    </p>
                    <span className='font-medium'>Last Updated At:</span>{' '}
                    {formatDate(allSaleItems.updatedAt)}
                  </div>
                )}
              </div>
            </div>

            {/* Financial Details */}
            <div className='space-y-4'>
              <h3 className='flex items-center gap-2 text-lg font-semibold'>
                <CreditCard className='text-primary h-5 w-5' />
                Financial Details
              </h3>
              <div className='space-y-2'>
                <div>
                  {allSaleItems.subTotal > 0 && (
                    <div>
                      <p className='font-medium'>Sub Total:</p>
                      <p className='text-muted-foreground'>
                        {(allSaleItems.subTotal || 0).toFixed(2)}
                      </p>
                    </div>
                  )}
                  {allSaleItems.discount > 0 && (
                    <div>
                      <p className='font-medium'>Discount:</p>
                      <p className='text-muted-foreground'>
                        -{(allSaleItems.discount || 0).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
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
                    {formatDate(
                      allSaleItems.saleDate || allSaleItems.createdAt
                    )}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <Package className='text-muted-foreground h-4 w-4' />
                  <p>
                    <span className='font-medium'>Total Items:</span>{' '}
                    {allSaleItems.totalProducts}
                  </p>
                </div>
                {hasUndeliveredItems && (
                  <div className='flex items-center gap-2'>
                    <Truck className='h-4 w-4 text-amber-500' />
                    <p className='font-medium text-amber-600'>
                      Undelivered Items (Your Shop): {undeliveredItemsCount}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sale Items Table */}
          {allSaleItems.items && allSaleItems.items.length > 0 ? (
            <div className='space-y-6'>
              {/* Editable Items (User's Shop) */}
              {editableItems.length > 0 && (
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <h3 className='flex items-center gap-2 text-lg font-semibold'>
                      <Truck className='h-5 w-5 text-green-600' />
                      Your Shop Items - Ready for Delivery
                    </h3>
                    <div className='flex gap-2'>
                      {selectedItems.length > 0 && (
                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={clearAllBatchAssignments}
                          disabled={updating}
                        >
                          <Trash2 className='mr-1 h-3 w-3' />
                          Clear All
                        </Button>
                      )}
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
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {hasUndeliveredItems && (
                          <TableHead className='w-12.5'>
                            <Checkbox
                              checked={
                                selectedItems.length ===
                                  undeliveredItemsCount &&
                                undeliveredItemsCount > 0
                              }
                              onCheckedChange={handleSelectAll}
                              disabled={updating}
                            />
                          </TableHead>
                        )}
                        <TableHead>Product</TableHead>
                        <TableHead>Batch Assignment</TableHead>
                        <TableHead>Shop</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total Price</TableHead>
                        <TableHead>Status</TableHead>
                        {hasUndeliveredItems && <TableHead>Action</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editableItems.map((item: ISellItem) => {
                        const isSelected = selectedItems.includes(item.id);
                        const assignedBatches = getAssignedBatches(item.id);
                        const totalAssigned = getTotalAssignedQuantity(item.id);
                        const isFullyAssigned = totalAssigned === item.quantity;

                        const existingBatches = item.batches ?? [];
                        const hasExistingBatches = existingBatches.length > 0;
                        const existingBatchTotal = hasExistingBatches
                          ? existingBatches.reduce(
                              (sum, batch) => sum + (batch?.quantity || 0),
                              0
                            )
                          : 0;
                        const isExistingFullyAssigned =
                          existingBatchTotal === item.quantity;

                        return (
                          <TableRow
                            key={item.id}
                            className='bg-green-50 dark:bg-green-950/40'
                          >
                            {hasUndeliveredItems && (
                              <TableCell>
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() =>
                                    handleItemSelection(item.id)
                                  }
                                  disabled={
                                    updating ||
                                    item.itemSaleStatus ===
                                      ItemSaleStatus.DELIVERED
                                  }
                                />
                              </TableCell>
                            )}

                            <TableCell className='font-medium'>
                              {getProductName(item)}
                            </TableCell>

                            <TableCell>
                              <div className='space-y-1'>
                                {hasExistingBatches ? (
                                  <>
                                    {existingBatches.map((batchItem) => (
                                      <div
                                        key={batchItem.id}
                                        className='flex items-center gap-2 text-sm'
                                      >
                                        <Badge
                                          variant='outline'
                                          className='text-xs'
                                        >
                                          {batchItem.batch?.batchNumber ||
                                            'Unknown Batch'}
                                        </Badge>

                                        <span className='text-muted-foreground'>
                                          {batchItem.quantity} quantity
                                        </span>
                                      </div>
                                    ))}
                                    <div
                                      className={`text-xs ${
                                        isExistingFullyAssigned
                                          ? 'text-green-600 dark:text-green-400'
                                          : 'text-amber-600 dark:text-amber-400'
                                      } `}
                                    >
                                      {existingBatchTotal}/{item.quantity}{' '}
                                      assigned
                                    </div>
                                  </>
                                ) : assignedBatches.length > 0 ? (
                                  <>
                                    {assignedBatches.map((batch, index) => (
                                      <div
                                        key={index}
                                        className='flex items-center gap-2 text-sm'
                                      >
                                        <Badge
                                          variant='outline'
                                          className='text-xs'
                                        >
                                          {batch.batchNumber}
                                        </Badge>

                                        <span className='text-muted-foreground'>
                                          {batch.quantity} units
                                        </span>
                                      </div>
                                    ))}
                                    <div
                                      className={`text-xs ${
                                        isFullyAssigned
                                          ? 'text-green-600 dark:text-green-400'
                                          : 'text-amber-600 dark:text-amber-400'
                                      } `}
                                    >
                                      {totalAssigned}/{item.quantity} assigned
                                    </div>
                                  </>
                                ) : (
                                  <span className='text-muted-foreground text-sm'>
                                    Not assigned
                                  </span>
                                )}
                                {assignedBatches.length > 0 && (
                                  <Button
                                    size='sm'
                                    variant='ghost'
                                    className='mt-1 h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50'
                                    onClick={() => clearItemBatchAssignments(item.id)}
                                    disabled={updating}
                                  >
                                    <Trash2 className='mr-1 h-3 w-3' />
                                    Clear
                                  </Button>
                                )}
                              </div>
                            </TableCell>

                            <TableCell>
                              {item.shop?.name || 'Unknown Shop'}
                            </TableCell>
                            <TableCell>
                              {item.unitOfMeasure?.name || 'Unknown Unit'}
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                            <TableCell>${item.totalPrice.toFixed(2)}</TableCell>

                            <TableCell>
                              <Badge
                                variant={getItemStatusVariant(
                                  item.itemSaleStatus
                                )}
                              >
                                {item.itemSaleStatus}
                              </Badge>
                            </TableCell>

                            {hasUndeliveredItems && (
                              <TableCell>
                                {item.itemSaleStatus !==
                                  ItemSaleStatus.DELIVERED && (
                                  <div className='flex gap-1'>
                                    <Button
                                      size='sm'
                                      variant='outline'
                                      onClick={() => openBatchModal(item)}
                                      disabled={updating}
                                      className='hover:bg-green-100 dark:hover:bg-green-900'
                                    >
                                      {hasExistingBatches
                                        ? 'Reassign Batches'
                                        : 'Assign Batches'}
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* View Only Items (Other Shops) */}
              {viewOnlyItems.length > 0 && (
                <div className='space-y-4'>
                  <h3 className='flex items-center gap-2 text-lg font-semibold'>
                    <Eye className='h-5 w-5 text-blue-600' />
                    Other Shop Items - View Only
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Batch Assignment</TableHead>
                        <TableHead>Shop</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Access</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewOnlyItems.map((item: ISellItem) => {
                        const existingBatches = item.batches ?? [];
                        const hasExistingBatches = existingBatches.length > 0;

                        return (
                          <TableRow
                            key={item.id}
                            className='bg-blue-50 dark:bg-blue-950/40'
                          >
                            <TableCell className='font-medium'>
                              {getProductName(item)}
                            </TableCell>

                            <TableCell>
                              {hasExistingBatches ? (
                                <div className='space-y-1'>
                                  {existingBatches.map((batchItem) => (
                                    <div
                                      key={batchItem.id}
                                      className='flex items-center gap-2 text-sm'
                                    >
                                      <Badge
                                        variant='outline'
                                        className='text-xs'
                                      >
                                        {batchItem.batch?.batchNumber ||
                                          'Unknown Batch'}
                                      </Badge>
                                      <span className='text-muted-foreground'>
                                        {batchItem.quantity} quantity
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className='text-muted-foreground text-sm'>
                                  Not assigned
                                </span>
                              )}
                            </TableCell>

                            <TableCell>
                              {item.shop?.name || 'Unknown Shop'}
                            </TableCell>
                            <TableCell>
                              {item.unitOfMeasure?.name || 'Unknown Unit'}
                            </TableCell>

                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                            <TableCell>${item.totalPrice.toFixed(2)}</TableCell>

                            <TableCell>
                              <Badge
                                variant={getItemStatusVariant(
                                  item.itemSaleStatus
                                )}
                              >
                                {item.itemSaleStatus}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              <Badge
                                variant='outline'
                                className='text-blue-700 dark:text-blue-300'
                              >
                                View Only
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
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
  {(correction.status === SellStockCorrectionStatus.PENDING || 
    correction.status === SellStockCorrectionStatus.PARTIAL) && (
    <>
      <Button
        variant='default'
        size='sm'
        onClick={() => handleApproveCorrectionWithItems(correction)}
        disabled={updating}
      >
        <Truck className='mr-2 h-4 w-4' />
        Approve with Delivery
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
                                  <TableHead className='w-20'>
                                    Delivered
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {correction.items &&
                                  correction.items.map(
                                    (item: ISellStockCorrectionItem, index) => {
                                      const isAddition = item.quantity > 0;
                                      const isDelivered = stockCorrectionDelivery[correction.id]?.includes(item.id);

                                      // Get batch information from batches relation with batch number and quantity
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
                                            ${(item.unitPrice || 0).toFixed(2)}
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
                                            ${(item.totalPrice || 0).toFixed(2)}
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
                                     <TableCell>
  {/* Show checkbox for PENDING or PARTIAL corrections where item is not yet DELIVERED */}
  {(correction.status === SellStockCorrectionStatus.PENDING || 
    correction.status === SellStockCorrectionStatus.PARTIAL) && 
    item.itemSaleStatus !== 'DELIVERED' ? (
    <Checkbox
      checked={isDelivered}
      onCheckedChange={() => handleCorrectionItemDelivery(correction.id, item.id)}
      disabled={updating}
    />
  ) : item.itemSaleStatus ? (
    <Badge
      variant={item.itemSaleStatus === 'DELIVERED' ? 'default' : 'secondary'}
      className='capitalize'
    >
      {item.itemSaleStatus.toLowerCase()}
    </Badge>
  ) : null}
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
                                  {correction.status === SellStockCorrectionStatus.PENDING && (
                                    <div className='mt-1 text-sm'>
                                      <span className='font-medium'>
                                        Selected for delivery:{' '}
                                      </span>
                                      <span className='text-muted-foreground'>
                                        {(stockCorrectionDelivery[correction.id] || []).length} items
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className='text-right'>
                                  <span className='font-medium'>
                                    Correction Total:{' '}
                                  </span>
                                  <span className='text-lg font-bold text-blue-600 dark:text-blue-400'>
                                    ${(correction.total || 0).toFixed(2)}
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

export default StoreSaleDetailPage;