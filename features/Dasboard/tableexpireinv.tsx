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

  if (loading) return <div className='p-8 text-center text-lg'>Loading...</div>;
  if (error)
    return <div className='p-8 text-center text-lg text-red-500'>{error}</div>;
  if (!inventoryData)
    return <div className='p-8 text-center text-lg'>No data available</div>;

  const { alerts, tables } = inventoryData;

  return (
    <div className='@container/dashboard space-y-6 p-4'>
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
                      Quantity
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.expiringSoon.length > 0 ? (
                    alerts.expiringSoon.map((item, index) => (
                      <TableRow
                        key={`${item.batchId}-${index}`}
                        className='hover:bg-muted/50'
                      >
                        <TableCell className='py-3 text-base font-medium'>
                          {item.productName}
                        </TableCell>
                        <TableCell className='py-3 text-base'>
                          {item.batchNumber || 'N/A'}
                        </TableCell>
                        <TableCell className='py-3 text-base'>
                          {item.expiryDate
                            ? new Date(item.expiryDate).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell className='py-3 text-base'>
                          {Number(item.totalQuantity || item.quantity || 0)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
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
                        const currentStock = Number(item.currentStock || 0);
                        const warningQuantity = Number(
                          item.warningQuantity || 0
                        );
                        const isLowStock = currentStock < warningQuantity;

                        return (
                          <TableRow
                            key={`${item._id}-${index}`}
                            className='hover:bg-muted/50'
                          >
                            <TableCell className='py-3 text-base font-medium'>
                              {item.productName}
                            </TableCell>
                            <TableCell className='py-3 text-base'>
                              {currentStock}
                            </TableCell>
                            <TableCell className='py-3 text-base'>
                              {warningQuantity}
                            </TableCell>
                            <TableCell className='py-3 text-base'>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  isLowStock
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {isLowStock ? 'Low Stock' : 'Adequate'}
                              </span>
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
              <CardTitle className='text-xl'>Top Items</CardTitle>
              <CardDescription className='text-base'>
                Items with highest stock value
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
                      tables.topItems.map((item, index) => (
                        <TableRow
                          key={`${item.productCode}-${index}`}
                          className='hover:bg-muted/50'
                        >
                          <TableCell className='py-3 text-base font-medium'>
                            {item.productName}
                          </TableCell>
                          <TableCell className='py-3 text-base'>
                            {Number(item.totalQuantity || 0)}
                          </TableCell>
                        </TableRow>
                      ))
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.agingReport.length > 0 ? (
                  tables.agingReport.map((item, index) => (
                    <TableRow
                      key={`${item.productCode}-${index}`}
                      className='hover:bg-muted/50'
                    >
                      <TableCell className='py-3 text-base font-medium'>
                        {item.productName}
                      </TableCell>
                      <TableCell className='py-3 text-base'>
                        {item.batchNumber || 'N/A'}
                      </TableCell>
                      <TableCell className='py-3 text-base'>
                        {Number(item.quantity || 0)}
                      </TableCell>
                      <TableCell className='py-3 text-base'>
                        {item.daysInInventory || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
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
