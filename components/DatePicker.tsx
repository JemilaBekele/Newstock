'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Options } from 'nuqs';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

interface DatePickerProps {
  selectedDate: Date | undefined;
  onSelect: (date: Date | undefined, options?: Options) => Promise<void>;
  fromDate?: Date;
}

export function DatePicker({
  selectedDate,
  onSelect,
  fromDate
}: DatePickerProps) {
  const handleSelect = async (date: Date | undefined) => {
    try {
      await onSelect(date, {
        shallow: false,
        scroll: false
      });
    } catch (error) {}
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={'outline'}>
          <CalendarIcon className='mr-2 h-4 w-4' />
          {selectedDate ? (
            format(selectedDate, 'PPP')
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          selected={selectedDate}
          onSelect={handleSelect}
          fromDate={fromDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
