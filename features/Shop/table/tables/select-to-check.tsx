/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { getSellStockCorrectionsBySellId, markAsCheckedSellStockCorrection } from '@/service/SellStockCorrection';
import { ISellStockCorrection } from '@/models/SellStockCorrection'; // Import the correct type

// Add props interface
interface SelectCorrectionsToCheckPageProps {
  sellId: string;
}

export default function SelectCorrectionsToCheckPage({ sellId }: SelectCorrectionsToCheckPageProps) {
  const router = useRouter();
  const [corrections, setCorrections] = useState<ISellStockCorrection[]>([]);
  const [selectedCorrections, setSelectedCorrections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load corrections on component mount
  useEffect(() => {
    const loadCorrections = async () => {
      if (!sellId) {
        toast.error('Sell ID is missing');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        
        // Use getSellStockCorrectionsBySellId to fetch stock corrections
        const stockCorrections = await getSellStockCorrectionsBySellId(sellId);
        
        // Filter only unchecked corrections
        const unchecked = stockCorrections.filter(
          (c: ISellStockCorrection) => !c.isChecked
        );
        
        setCorrections(unchecked);
        
        if (unchecked.length === 0) {
          toast.info('No unchecked corrections found');
        } else {
          toast.success(`Found ${unchecked.length} unchecked correction(s)`);
        }
      } catch (error: any) {
        console.error('Error loading sell stock corrections:', error);
        toast.error(error?.response?.data?.message || 'Failed to load sell stock corrections');
      } finally {
        setLoading(false);
      }
    };
    
    loadCorrections();
  }, [sellId]);

  const handleSelectAll = () => {
    if (selectedCorrections.length === corrections.length) {
      setSelectedCorrections([]);
    } else {
      setSelectedCorrections(corrections.map(c => c.id));
    }
  };

  const handleSelectCorrection = (correctionId: string) => {
    setSelectedCorrections(prev =>
      prev.includes(correctionId)
        ? prev.filter(id => id !== correctionId)
        : [...prev, correctionId]
    );
  };

  const handleMarkSelected = async () => {
    if (selectedCorrections.length === 0) {
      toast.error('Please select at least one correction');
      return;
    }

    setSubmitting(true);
    try {
      const results = [];
      const errors = [];
      
      // Mark each selected correction
      for (const correctionId of selectedCorrections) {
        try {
          const result = await markAsCheckedSellStockCorrection(correctionId);
          results.push(result);
        } catch (error: any) {
          errors.push({
            correctionId,
            error: error?.response?.data?.message || 'Unknown error'
          });
        }
      }
      
      if (errors.length > 0) {
        toast.error(`Failed to mark ${errors.length} correction(s)`);
        console.error('Errors:', errors);
      }
      
      if (results.length > 0) {
        toast.success(`${results.length} correction(s) marked as checked successfully`);
      }
      
      router.push(`/dashboard/Sell/${sellId}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to mark corrections as checked');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkSingle = async (correctionId: string) => {
    setSubmitting(true);
    try {
      await markAsCheckedSellStockCorrection(correctionId);
      toast.success('Correction marked as checked');
      
      // Remove the marked correction from the list
      setCorrections(prev => prev.filter(c => c.id !== correctionId));
      setSelectedCorrections(prev => prev.filter(id => id !== correctionId));
      
      // Refresh the page data
      router.refresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to mark correction as checked');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">Loading stock corrections...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
  <div className="container mx-auto p-6">
  <Card>
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle>Select Stock Corrections to Mark as Checked</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Select one or more stock corrections to mark as checked
          </p>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      {corrections.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No unchecked corrections found</p>
          <div className="space-y-4">
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={() => router.push(`/dashboard/Sell`)}
              >
                Back to Sell Details
              </Button>
              <Button
                variant="outline"
                onClick={() => router.refresh()}
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={selectedCorrections.length === corrections.length && corrections.length > 0}
                  onCheckedChange={handleSelectAll}
                  disabled={corrections.length === 0}
                />
                <span className="font-medium">
                  Select All ({corrections.length})
                </span>
              </label>
              <Button
                onClick={handleMarkSelected}
                disabled={selectedCorrections.length === 0 || submitting}
              >
                {submitting ? 'Processing...' : `Mark Selected (${selectedCorrections.length})`}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedCorrections.length} of {corrections.length} corrections selected
            </p>
          </div>

          <div className="space-y-3">
            {corrections.map((correction) => (
              <div
                key={correction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <Checkbox
                    checked={selectedCorrections.includes(correction.id)}
                    onCheckedChange={() => handleSelectCorrection(correction.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {correction.reference || `Correction #${correction.id.substring(0, 8)}`}
                      </p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        correction.status === 'PENDING' 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          : correction.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : correction.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {correction.status}
                      </span>
                      {!correction.isChecked && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                          Unchecked
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                      {correction.createdAt && (
                        <span>
                          Created: {new Date(correction.createdAt).toLocaleDateString()}
                        </span>
                      )}
                      {correction.updatedAt && (
                        <span>
                          Updated: {new Date(correction.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMarkSingle(correction.id)}
                  disabled={submitting}
                >
                  Mark as Checked
                </Button>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/Sell/${sellId}`)}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSelectAll}
                disabled={corrections.length === 0}
              >
                {selectedCorrections.length === corrections.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button
                onClick={handleMarkSelected}
                disabled={selectedCorrections.length === 0 || submitting}
              >
                {submitting ? 'Processing...' : `Mark ${selectedCorrections.length} Selected`}
              </Button>
            </div>
          </div>
        </>
      )}
    </CardContent>
  </Card>
</div>
  );
}