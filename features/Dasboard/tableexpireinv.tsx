/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { InventoryDashboardApi } from '@/service/invarelDash';
import { AlertTriangle, AlertCircle, TrendingUp, Clock, Package } from 'lucide-react';

interface InventoryItem {
  _id: any;
  id?: string;
  productName: string;
  productCode: string;
  batchNumber?: string;
  batchDate?: string;
  expiryDate?: string;
  quantity?: number | string;
  totalQuantity?: number | string;
  currentStock?: number | string;
  totalCostValue?: number | string;
  totalRetailValue?: number | string;
  daysInInventory?: number;
  inventoryValue?: number | string;
  category?: string;
  categoryName?: string;
  warningQuantity?: number | string;
  batchId?: string;
  sellPrice?: number | string;
  unitPrice?: number | string;
  daysUntilExpiry?: number;
  alertType?: 'LOW_STOCK' | 'OUT_OF_STOCK';
  stockPercentage?: number;
}

interface InventoryData {
  alerts: {
    expiringSoon: InventoryItem[];
    lowStockItems: InventoryItem[];
  };
  tables: {
    topItems: InventoryItem[];
    agingReport: InventoryItem[];
  };
  lastUpdated: string;
}

export function TableDashboard() {
  const [inventoryData, setInventoryData] = useState<InventoryData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await InventoryDashboardApi.getDashboard();
        setInventoryData(data);
      } catch  {
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-lg text-muted-foreground">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="text-lg font-semibold text-red-600">Error Loading Data</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!inventoryData) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No Data Available</h3>
          <p className="text-muted-foreground">No inventory data found.</p>
        </div>
      </div>
    );
  }

  const { alerts, tables } = inventoryData;

  // Helper function to calculate days until expiry
  const calculateDaysUntilExpiry = (expiryDate: string | undefined) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper function to get expiry alert colors
  const getExpiryAlertColors = (daysUntilExpiry: number | null) => {
    if (daysUntilExpiry === null) {
      return {
        bg: 'bg-muted/30 dark:bg-muted/10',
        text: 'text-foreground',
        border: 'border-l-4 border-l-muted',
        badgeBg: 'bg-gray-100 dark:bg-gray-800',
        badgeText: 'text-gray-800 dark:text-gray-200',
        iconColor: 'text-gray-600 dark:text-gray-400'
      };
    }

    if (daysUntilExpiry <= 180) { // 6 months or less
      return {
        bg: 'bg-red-50 dark:bg-red-950/20',
        text: 'text-red-700 dark:text-red-300',
        border: 'border-l-4 border-l-red-500 dark:border-l-red-400',
        badgeBg: 'bg-red-100 dark:bg-red-900/30',
        badgeText: 'text-red-800 dark:text-red-300',
        iconColor: 'text-red-600 dark:text-red-400'
      };
    }

    if (daysUntilExpiry <= 365) { // 1 year or less
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/20',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-l-4 border-l-amber-500 dark:border-l-amber-400',
        badgeBg: 'bg-amber-100 dark:bg-amber-900/30',
        badgeText: 'text-amber-800 dark:text-amber-300',
        iconColor: 'text-amber-600 dark:text-amber-400'
      };
    }

    return {
      bg: 'bg-green-50 dark:bg-green-950/20',
      text: 'text-green-700 dark:text-green-300',
      border: 'border-l-4 border-l-green-500 dark:border-l-green-400',
      badgeBg: 'bg-green-100 dark:bg-green-900/30',
      badgeText: 'text-green-800 dark:text-green-300',
      iconColor: 'text-green-600 dark:text-green-400'
    };
  };

  // Helper function to get stock alert colors
  const getStockAlertColors = (item: InventoryItem) => {
    const currentStock = Number(item.currentStock || 0);
    const warningQuantity = Number(item.warningQuantity || 0);
    
    if (currentStock === 0) {
      return {
        bg: 'bg-red-50 dark:bg-red-950/20',
        text: 'text-red-700 dark:text-red-300',
        border: 'border-l-4 border-l-red-500 dark:border-l-red-400',
        badgeBg: 'bg-red-100 dark:bg-red-900/30',
        badgeText: 'text-red-800 dark:text-red-300',
        status: 'Out of Stock',
        iconColor: 'text-red-600 dark:text-red-400'
      };
    }

    if (currentStock <= warningQuantity) {
      const percentage = (currentStock / warningQuantity) * 100;
      if (percentage <= 25) {
        return {
          bg: 'bg-red-50 dark:bg-red-950/20',
          text: 'text-red-700 dark:text-red-300',
          border: 'border-l-4 border-l-red-500 dark:border-l-red-400',
          badgeBg: 'bg-red-100 dark:bg-red-900/30',
          badgeText: 'text-red-800 dark:text-red-300',
          status: 'Critical',
          iconColor: 'text-red-600 dark:text-red-400'
        };
      } else if (percentage <= 50) {
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/20',
          text: 'text-amber-700 dark:text-amber-300',
          border: 'border-l-4 border-l-amber-500 dark:border-l-amber-400',
          badgeBg: 'bg-amber-100 dark:bg-amber-900/30',
          badgeText: 'text-amber-800 dark:text-amber-300',
          status: 'Low',
          iconColor: 'text-amber-600 dark:text-amber-400'
        };
      } else {
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-950/20',
          text: 'text-yellow-700 dark:text-yellow-300',
          border: 'border-l-4 border-l-yellow-500 dark:border-l-yellow-400',
          badgeBg: 'bg-yellow-100 dark:bg-yellow-900/30',
          badgeText: 'text-yellow-800 dark:text-yellow-300',
          status: 'Warning',
          iconColor: 'text-yellow-600 dark:text-yellow-400'
        };
      }
    }

    return {
      bg: 'bg-green-50 dark:bg-green-950/20',
      text: 'text-green-700 dark:text-green-300',
      border: 'border-l-4 border-l-green-500 dark:border-l-green-400',
      badgeBg: 'bg-green-100 dark:bg-green-900/30',
      badgeText: 'text-green-800 dark:text-green-300',
      status: 'Adequate',
      iconColor: 'text-green-600 dark:text-green-400'
    };
  };

  // Helper function to get aging report colors
  const getAgingAlertColors = (daysInInventory: number | undefined) => {
    if (!daysInInventory) {
      return {
        bg: 'bg-muted/30 dark:bg-muted/10',
        text: 'text-foreground',
        border: 'border-l-4 border-l-muted',
        badgeBg: 'bg-gray-100 dark:bg-gray-800',
        badgeText: 'text-gray-800 dark:text-gray-200'
      };
    }

    if (daysInInventory >= 365) { // 1 year or more
      return {
        bg: 'bg-red-50 dark:bg-red-950/20',
        text: 'text-red-700 dark:text-red-300',
        border: 'border-l-4 border-l-red-500 dark:border-l-red-400',
        badgeBg: 'bg-red-100 dark:bg-red-900/30',
        badgeText: 'text-red-800 dark:text-red-300'
      };
    }

    if (daysInInventory >= 180) { // 6 months or more
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/20',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-l-4 border-l-amber-500 dark:border-l-amber-400',
        badgeBg: 'bg-amber-100 dark:bg-amber-900/30',
        badgeText: 'text-amber-800 dark:text-amber-300'
      };
    }

    if (daysInInventory >= 90) { // 3 months or more
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-950/20',
        text: 'text-yellow-700 dark:text-yellow-300',
        border: 'border-l-4 border-l-yellow-500 dark:border-l-yellow-400',
        badgeBg: 'bg-yellow-100 dark:bg-yellow-900/30',
        badgeText: 'text-yellow-800 dark:text-yellow-300'
      };
    }

    return {
      bg: 'bg-green-50 dark:bg-green-950/20',
      text: 'text-green-700 dark:text-green-300',
      border: 'border-l-4 border-l-green-500 dark:border-l-green-400',
      badgeBg: 'bg-green-100 dark:bg-green-900/30',
      badgeText: 'text-green-800 dark:text-green-300'
    };
  };

  return (
    <div className='@container/dashboard space-y-6 p-4'>
      {/* Stats Cards Row */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Expiring Soon</CardTitle>
            <AlertTriangle className='h-4 w-4 text-red-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{alerts.expiringSoon.length}</div>
            <p className='text-xs text-muted-foreground'>
              Items expiring within 1 year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Low Stock</CardTitle>
            <AlertCircle className='h-4 w-4 text-amber-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{alerts.lowStockItems.length}</div>
            <p className='text-xs text-muted-foreground'>
              Items below warning level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Top Items</CardTitle>
            <TrendingUp className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{tables.topItems.length}</div>
            <p className='text-xs text-muted-foreground'>
              High-value inventory items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Aging Items</CardTitle>
            <Clock className='h-4 w-4 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{tables.agingReport.length}</div>
            <p className='text-xs text-muted-foreground'>
              Items older than 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout for Alerts */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Left Column: Expiring Soon */}
        <Card className='@container/card h-full'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-xl'>Expiring Soon</CardTitle>
            <CardDescription className='text-base'>
              Items nearing their expiry date
            </CardDescription>
          </CardHeader>
          <CardContent className='p-0'>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='text-lg font-semibold'>
                      Item Name
                    </TableHead>
                    <TableHead className='text-lg font-semibold'>
                      Batch Number
                    </TableHead>
                    <TableHead className='text-lg font-semibold'>
                      Expiry Date
                    </TableHead>
                    <TableHead className='text-lg font-semibold'>
                      Days Left
                    </TableHead>
                    <TableHead className='text-lg font-semibold'>
                      Quantity
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.expiringSoon.length > 0 ? (
                    alerts.expiringSoon.map((item, index) => {
                      const daysUntilExpiry = item.daysUntilExpiry || calculateDaysUntilExpiry(item.expiryDate);
                      const colors = getExpiryAlertColors(daysUntilExpiry);

                      return (
                        <TableRow
                          key={`${item.batchId}-${index}`}
                          className={`hover:bg-muted/50 ${colors.bg} ${colors.border}`}
                        >
                          <TableCell className={`py-3 text-base font-medium ${colors.text}`}>
                            <div className="flex items-center gap-2">
                              {item.productName}
                              {daysUntilExpiry !== null && daysUntilExpiry <= 180 && (
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colors.badgeBg} ${colors.badgeText}`}>
                                  <AlertTriangle className="h-3 w-3" />
                                  URGENT
                                </span>
                              )}
                              {daysUntilExpiry !== null && daysUntilExpiry > 180 && daysUntilExpiry <= 365 && (
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colors.badgeBg} ${colors.badgeText}`}>
                                  <AlertCircle className="h-3 w-3" />
                                  WARNING
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className={`py-3 text-base ${colors.text}`}>
                            {item.batchNumber || 'N/A'}
                          </TableCell>
                          <TableCell className={`py-3 text-base ${colors.text}`}>
                            <div className="flex flex-col">
                              <span>
                                {item.expiryDate
                                  ? new Date(item.expiryDate).toLocaleDateString()
                                  : 'N/A'}
                              </span>
                              {item.expiryDate && (
                                <span className="text-sm opacity-70">
                                  {new Date(item.expiryDate).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className={`py-3 text-base font-medium ${colors.text}`}>
                            {daysUntilExpiry !== null ? (
                              <div className="flex items-center gap-2">
                                <span>{daysUntilExpiry} days</span>
                                {daysUntilExpiry <= 180 && (
                                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                )}
                                {daysUntilExpiry > 180 && daysUntilExpiry <= 365 && (
                                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                )}
                              </div>
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                          <TableCell className={`py-3 text-base ${colors.text}`}>
                            {Number(item.totalQuantity || item.quantity || 0)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className='py-8 text-center text-lg'
                      >
                        No items expiring soon
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Low Stock Items and Top Items stacked */}
        <div className='space-y-6'>
          {/* Low Stock Items */}
          <Card className='@container/card'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-xl'>Low Stock Alert</CardTitle>
              <CardDescription className='text-base'>
                Items below warning quantity
              </CardDescription>
            </CardHeader>
            <CardContent className='p-0'>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='text-lg font-semibold'>
                        Item Name
                      </TableHead>
                      <TableHead className='text-lg font-semibold'>
                        Current Stock
                      </TableHead>
                      <TableHead className='text-lg font-semibold'>
                        Warning Level
                      </TableHead>
                      <TableHead className='text-lg font-semibold'>
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.lowStockItems.length > 0 ? (
                      alerts.lowStockItems.map((item, index) => {
                        const colors = getStockAlertColors(item);
                        const currentStock = Number(item.currentStock || 0);
                        const warningQuantity = Number(item.warningQuantity || 0);
                        const stockPercentage = item.stockPercentage || 
                          (warningQuantity > 0 ? (currentStock / warningQuantity) * 100 : 0);

                        return (
                          <TableRow
                            key={`${item._id}-${index}`}
                            className={`hover:bg-muted/50 ${colors.bg} ${colors.border}`}
                          >
                            <TableCell className={`py-3 text-base font-medium ${colors.text}`}>
                              <div className="flex items-center gap-2">
                                {item.productName}
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colors.badgeBg} ${colors.badgeText}`}>
                                  {colors.status}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className={`py-3 text-base ${colors.text}`}>
                              <div className="flex items-center gap-2">
                                {currentStock}
                                {currentStock === 0 && (
                                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className={`py-3 text-base ${colors.text}`}>
                              {warningQuantity}
                            </TableCell>
                            <TableCell className={`py-3 text-base ${colors.text}`}>
                              <div className="flex flex-col gap-1">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colors.badgeBg} ${colors.badgeText}`}>
                                  {colors.status}
                                </span>
                                {currentStock > 0 && (
                                  <div className="text-xs opacity-70">
                                    {Math.round(stockPercentage)}% of warning level
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className='py-8 text-center text-lg'
                        >
                          No low stock items
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Top Items */}
          <Card className='@container/card'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-xl'>Top Items by Quantity</CardTitle>
              <CardDescription className='text-base'>
                Items with highest stock Quantity
              </CardDescription>
            </CardHeader>
            <CardContent className='p-0'>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='text-lg font-semibold'>
                        Item Name
                      </TableHead>
                      <TableHead className='text-lg font-semibold'>
                        Quantity
                      </TableHead>
                     
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tables.topItems.length > 0 ? (
                      tables.topItems.map((item, index) => {
                        const totalQuantity = Number(item.totalQuantity || 0);
                        const isTopItem = index < 3;

                        return (
                          <TableRow
                            key={`${item.productCode}-${index}`}
                            className={`hover:bg-muted/50 `}
                          >
                            <TableCell className='py-3 text-base font-medium'>
                              <div className="flex items-center gap-2">
                                {item.productName}
                                {isTopItem && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    <TrendingUp className="h-3 w-3" />
                                    TOP {index + 1}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className='py-3 text-base'>
                              {totalQuantity.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className='py-8 text-center text-lg'
                        >
                          No top items available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Aging Report - Full Width */}
      <Card className='@container/card'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-xl'>Aging Report</CardTitle>
          <CardDescription className='text-base'>
            Items by days in inventory
          </CardDescription>
        </CardHeader>
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='text-lg font-semibold'>
                    Item Name
                  </TableHead>
                  <TableHead className='text-lg font-semibold'>
                    Batch Number
                  </TableHead>
                  <TableHead className='text-lg font-semibold'>
                    Quantity
                  </TableHead>
                  <TableHead className='text-lg font-semibold'>
                    Days in Inventory
                  </TableHead>
                  <TableHead className='text-lg font-semibold'>
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.agingReport.length > 0 ? (
                  tables.agingReport.map((item, index) => {
                    const colors = getAgingAlertColors(item.daysInInventory);
                    const daysInInventory = item.daysInInventory || 0;

                    return (
                      <TableRow
                        key={`${item.productCode}-${index}`}
                        className={`hover:bg-muted/50 ${colors.bg} ${colors.border}`}
                      >
                        <TableCell className={`py-3 text-base font-medium ${colors.text}`}>
                          {item.productName}
                        </TableCell>
                        <TableCell className={`py-3 text-base ${colors.text}`}>
                          {item.batchNumber || 'N/A'}
                        </TableCell>
                        <TableCell className={`py-3 text-base ${colors.text}`}>
                          {Number(item.quantity || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className={`py-3 text-base font-medium ${colors.text}`}>
                          <div className="flex items-center gap-2">
                            {daysInInventory} days
                            {daysInInventory >= 365 && (
                              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                            {daysInInventory >= 180 && daysInInventory < 365 && (
                              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className={`py-3 text-base ${colors.text}`}>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${colors.badgeBg.replace('100', '500').replace('900/30', '400')}`} />
                            {daysInInventory >= 365 ? 'Very Old (>1 year)' :
                             daysInInventory >= 180 ? 'Old (6-12 months)' :
                             daysInInventory >= 90 ? 'Aging (3-6 months)' :
                             daysInInventory >= 30 ? 'Recent (1-3 months)' : 'New (<1 month)'}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className='py-8 text-center text-lg'>
                      No aging report data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

   
    </div>
  );
}