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
});

type FuelFormData = z.infer<typeof fuelSchema>;

export function FuelModal({ isOpen, onClose, onSubmit, lastOdo, lastPrice, editingFuel }: FuelModalProps) {
  const form = useForm<FuelFormData>({
    resolver: zodResolver(fuelSchema),
  });
  
  const { watch, setValue, reset, getValues } = form;

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
        });
      }
    }
  }, [isOpen, editingFuel, lastOdo, lastPrice, reset]);

  const handleValueChange = (changedValue: string, changedField: 'amount' | 'liters' | 'price') => {
      const [amount, liters, price] = getValues(['amount', 'liters', 'price']);
      
      const numericAmount = parseFloat(String(changedField === 'amount' ? changedValue : amount));
      const numericLiters = parseFloat(String(changedField === 'liters' ? changedValue : liters));
      const numericPrice = parseFloat(String(changedField === 'price' ? changedValue : price));

      if (changedField === 'price') {
        if (!isNaN(numericPrice) && numericPrice > 0) {
            if (!isNaN(numericLiters) && numericLiters > 0) {
                setValue('amount', parseFloat((numericLiters * numericPrice).toFixed(2)), { shouldValidate: true });
            }
        }
      } else if (changedField === 'liters') {
          if (!isNaN(numericLiters) && numericLiters > 0 && !isNaN(numericPrice) && numericPrice > 0) {
            setValue('amount', parseFloat((numericLiters * numericPrice).toFixed(2)), { shouldValidate: true });
          }
      } else if (changedField === 'amount') {
        if (!isNaN(numericAmount) && numericAmount > 0 && !isNaN(numericPrice) && numericPrice > 0) {
          setValue('liters', parseFloat((numericAmount / numericPrice).toFixed(3)), { shouldValidate: true });
        }
      }
  };


  const onFormSubmit = (data: FuelFormData) => {
    onSubmit(data, editingFuel?.id);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[2rem] p-6 border-slate-200 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-600 to-green-400"></div>
        <DialogHeader className="mt-2">
          <DialogTitle className="text-2xl font-black uppercase text-slate-800 tracking-tighter flex items-center gap-2">
            <Fuel className="text-green-600"/>
            {editingFuel ? 'Edit Fuel Log' : 'New Fuel Log'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
             <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Date</FormLabel>
                        <FormControl>
                            <Input type="date" {...field} className="w-full bg-slate-50 p-4 h-auto rounded-2xl border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-green-600 transition-all" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="odo" render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Odometer (KM)</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} className="w-full bg-slate-50 p-4 h-auto rounded-2xl border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-green-600 transition-all" />
                    </FormControl><FormMessage />
                    </FormItem>
                )} />
             </div>
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4 relative overflow-hidden">
              <div className="absolute -bottom-8 -right-8 text-green-600/10">
                <Droplets size={100} strokeWidth={1} />
              </div>
              <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-green-600 rounded-full"></div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calculations</p>
              </div>
              <div className="space-y-3 relative z-10">
                <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Rate/Liter</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" {...field} onChange={e => { field.onChange(e.target.value); handleValueChange(e.target.value, 'price'); }} className="w-full bg-card p-4 h-auto rounded-xl border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-green-600 transition-all" />
                    </FormControl><FormMessage />
                    </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="liters" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Liters</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} onChange={e => { field.onChange(e.target.value); handleValueChange(e.target.value, 'liters'); }} className="w-full bg-card p-4 h-auto rounded-xl border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-green-600 transition-all" />
                          </FormControl><FormMessage />
                        </FormItem>
                      )} />
                     <FormField control={form.control} name="amount" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Total Cost (रू)</FormLabel>
                            <FormControl>
                            <Input type="number" {...field} onChange={e => { field.onChange(e.target.value); handleValueChange(e.target.value, 'amount'); }} className="w-full bg-card p-4 h-auto rounded-xl border-slate-200 font-black text-slate-800 text-lg focus:outline-none focus:border-green-600 transition-all" />
                            </FormControl><FormMessage />
                        </FormItem>
                        )} />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-green-700 py-4 h-auto rounded-2xl font-black text-white text-lg shadow-lg shadow-green-600/20 hover:shadow-green-600/40 hover:scale-[1.02] transition-all active:scale-95 uppercase tracking-wide">
              {editingFuel ? 'Update Fuel Log' : 'Add Fuel Log'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
