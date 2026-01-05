"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Fuel } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { FuelLog } from '@/lib/types';

interface FuelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<FuelLog, 'id'>, id?: number) => void;
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
  
  const { watch, setValue, reset } = form;
  const [price, liters, amount] = watch(['price', 'liters', 'amount']);

  useEffect(() => {
    if (isOpen) {
      if (editingFuel) {
        reset(editingFuel);
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

  const handleValueChange = (changedField: 'price' | 'liters' | 'amount', value: number) => {
    if (isNaN(value) || value <= 0) return;
  
    if (changedField === 'liters') {
      if (price > 0) setValue('amount', parseFloat((value * price).toFixed(2)), { shouldValidate: true });
    } else if (changedField === 'amount') {
      if (price > 0) setValue('liters', parseFloat((value / price).toFixed(2)), { shouldValidate: true });
    } else if (changedField === 'price') {
      if (liters > 0) setValue('amount', parseFloat((liters * value).toFixed(2)), { shouldValidate: true });
      else if (amount > 0) setValue('liters', parseFloat((amount / value).toFixed(2)), { shouldValidate: true });
    }
  };

  const onFormSubmit = (data: FuelFormData) => {
    onSubmit(data, editingFuel?.id);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[2rem] p-6 border-slate-200 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-red-400"></div>
        <DialogHeader className="mt-2">
          <DialogTitle className="text-2xl font-black uppercase text-slate-800 tracking-tighter flex items-center gap-2">
            <Fuel className="text-primary"/>
            {editingFuel ? 'Edit Fuel Log' : 'New Fuel Log'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
            <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="date" {...field} className="w-full bg-slate-50 p-4 h-auto rounded-2xl border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-primary transition-all" />
                  </FormControl><FormMessage />
                </FormItem>
              )} />
            <FormField control={form.control} name="odo" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="number" placeholder="Odometer (KM)" {...field} className="w-full bg-slate-50 p-4 h-auto rounded-2xl border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-primary transition-all" />
                  </FormControl><FormMessage />
                </FormItem>
              )} />
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-primary rounded-full"></div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calculations</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <FormField control={form.control} name="price" render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="Price Per Liter (रू)" {...field} onChange={e => { field.onChange(e); handleValueChange('price', parseFloat(e.target.value)); }} className="w-full bg-card p-4 h-auto rounded-xl border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-primary transition-all placeholder:text-slate-400" />
                          </FormControl><FormMessage />
                        </FormItem>
                      )} />
                </div>
                <FormField control={form.control} name="liters" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="Liters" {...field} onChange={e => { field.onChange(e); handleValueChange('liters', parseFloat(e.target.value)); }} className="w-full bg-card p-4 h-auto rounded-xl border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-primary transition-all placeholder:text-slate-400" />
                      </FormControl><FormMessage />
                    </FormItem>
                  )} />
                <FormField control={form.control} name="amount" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="number" placeholder="Total (रू)" {...field} onChange={e => { field.onChange(e); handleValueChange('amount', parseFloat(e.target.value)); }} className="w-full bg-card p-4 h-auto rounded-xl border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-primary transition-all placeholder:text-slate-400" />
                      </FormControl><FormMessage />
                    </FormItem>
                  )} />
              </div>
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-red-700 py-4 h-auto rounded-2xl font-black text-white text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all active:scale-95 uppercase tracking-wide">
              {editingFuel ? 'Update Fuel Log' : 'Add Fuel Log'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
