
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Fuel, Droplets } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { FuelLog } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '@/lib/utils';

interface FuelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<FuelLog, 'id'>, id?: string) => void;
    lastOdo: number;
    lastPrice?: number;
    editingFuel: FuelLog | null;
}

const fuelSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  odo: z.coerce.number().min(1, 'Odometer reading is required'),
  price: z.coerce.number().positive('Price must be positive'),
  liters: z.coerce.number().positive('Liters must be positive'),
  amount: z.coerce.number().positive('Total amount must be positive'),
  tankStatus: z.enum(['full', 'partial']),
  estimatedMileage: z.coerce.number().optional(),
});

type FuelFormData = z.infer<typeof fuelSchema>;

export function FuelModal({ isOpen, onClose, onSubmit, lastOdo, lastPrice, editingFuel }: FuelModalProps) {
  const form = useForm<FuelFormData>({
    resolver: zodResolver(fuelSchema),
    defaultValues: {
      tankStatus: 'full',
    }
  });
  
  const { watch, setValue, reset, getValues, formState } = form;
  const { isDirty, touchedFields } = formState;
  const tankStatus = watch('tankStatus');

  useEffect(() => {
    if (isOpen) {
      if (editingFuel) {
        reset({
          ...editingFuel,
          odo: editingFuel.odo,
        });
      } else {
        reset({
          date: new Date().toISOString().split('T')[0],
          odo: lastOdo > 0 ? lastOdo : undefined,
          price: lastPrice,
          liters: undefined,
          amount: undefined,
          tankStatus: 'full',
          estimatedMileage: undefined
        });
      }
    }
  }, [isOpen, editingFuel, lastOdo, lastPrice, reset]);

  const handleValueChange = (changedValue: string, changedField: 'amount' | 'liters' | 'price') => {
      const { price } = getValues();
      const value = parseFloat(changedValue);

      if (isNaN(value) || value < 0) return;

      if (changedField === 'liters') {
        const currentPrice = parseFloat(String(price || 0));
        if (currentPrice > 0) {
          setValue('amount', parseFloat((value * currentPrice).toFixed(2)), { shouldValidate: true });
        }
      } else if (changedField === 'amount') {
        const currentPrice = parseFloat(String(price || 0));
        if (currentPrice > 0) {
          setValue('liters', parseFloat((value / currentPrice).toFixed(3)), { shouldValidate: true });
        }
      }
  };


  const onFormSubmit = (data: FuelFormData) => {
    onSubmit(data, editingFuel?.id);
    onClose();
  }

  const FloatingLabelInput = ({ name, label, ...props }: { name: any, label: string } & React.ComponentProps<typeof Input>) => (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem className="relative">
        <FormControl>
          <Input
            {...field}
            placeholder=" "
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-slate-50 rounded-lg border border-slate-200 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
            {...props}
            onChange={(e) => {
                field.onChange(e);
                if (props.onChange) props.onChange(e);
            }}
          />
        </FormControl>
        <FormLabel
          className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-slate-50 px-2 peer-focus:px-2 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
        >
          {label}
        </FormLabel>
        <FormMessage className="px-2 text-xs"/>
      </FormItem>
    )} />
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-3xl p-6 sm:p-8 border-slate-200 shadow-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center border border-green-200">
                <Fuel className="text-green-600"/>
            </div>
            {editingFuel ? 'Edit Fuel Log' : 'New Fuel Log'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6 pt-4">
             <div className="grid grid-cols-2 gap-4">
                <FloatingLabelInput name="date" label="Date" type="date" />
                <FloatingLabelInput name="odo" label="Odometer (KM)" type="number" />
             </div>
            
            <FormField
              control={form.control}
              name="tankStatus"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tank Status</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem value="full" id="full" className="peer sr-only" />
                        </FormControl>
                        <FormLabel htmlFor="full" className="flex flex-col items-center justify-between rounded-lg border-2 p-4 cursor-pointer peer-data-[state=checked]:border-primary hover:bg-slate-50">
                          Full Tank
                        </FormLabel>
                      </FormItem>
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem value="partial" id="partial" className="peer sr-only"/>
                        </FormControl>
                        <FormLabel htmlFor="partial" className="flex flex-col items-center justify-between rounded-lg border-2 p-4 cursor-pointer peer-data-[state=checked]:border-primary hover:bg-slate-50">
                          Partial Fill
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {tankStatus === 'partial' && (
                <div className="animate-in fade-in">
                    <FloatingLabelInput name="estimatedMileage" label="Estimated Average (KM/L)" type="number" />
                    <p className="text-[11px] text-slate-500 mt-1 px-1">Helps calculate mileage when two consecutive full-tank logs aren't available.</p>
                </div>
            )}

            <div className="space-y-4">
                <FloatingLabelInput name="price" label="Rate / Liter" type="number" step="0.01" />
                <div className="grid grid-cols-2 gap-4">
                    <FloatingLabelInput name="liters" label="Liters" type="number" step="0.01" onChange={(e) => handleValueChange(e.target.value, 'liters')} />
                    <FloatingLabelInput name="amount" label="Total Cost (रू)" type="number" onChange={(e) => handleValueChange(e.target.value, 'amount')} />
                </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-bold text-white bg-slate-800 rounded-xl shadow-none border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all duration-150 hover:bg-slate-700">
              {editingFuel ? 'Update Fuel Log' : 'Add Fuel Log'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
