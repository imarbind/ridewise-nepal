"use client";

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wrench, X, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ServiceRecord } from '@/lib/types';

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<ServiceRecord, 'id'>) => void;
}

const partSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Part name can't be empty"),
  cost: z.coerce.number().min(0),
  reminderType: z.enum(['none', 'km', 'days']),
  reminderValue: z.string().optional(),
}).refine(data => {
    if (data.reminderType !== 'none') {
        return data.reminderValue && !isNaN(parseFloat(data.reminderValue)) && parseFloat(data.reminderValue) > 0;
    }
    return true;
}, {
    message: "Value required",
    path: ["reminderValue"],
});

const serviceSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  odo: z.coerce.number().min(1, 'Odometer reading is required'),
  work: z.string().min(3, 'Service title is required'),
  labor: z.coerce.number().min(0).default(0),
  parts: z.array(partSchema).min(1, 'At least one part or item is required'),
});

export function ServiceModal({ isOpen, onClose, onSubmit }: ServiceModalProps) {
  const form = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      work: '',
      labor: 0,
      parts: [{ id: '1', name: '', cost: 0, reminderType: 'none', reminderValue: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "parts",
  });
  
  useEffect(() => {
    if (isOpen) {
      form.reset({
        date: new Date().toISOString().split('T')[0],
        work: '',
        labor: 0,
        parts: [{ id: String(Date.now()), name: '', cost: 0, reminderType: 'none', reminderValue: '' }],
      });
    }
  }, [isOpen, form]);

  const onFormSubmit = (data: z.infer<typeof serviceSchema>) => {
    const partsTotal = data.parts.reduce((sum, p) => sum + p.cost, 0);
    const totalCost = (data.labor || 0) + partsTotal;
    const finalData = { ...data, totalCost };
    onSubmit(finalData);
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[2rem] p-6 border-slate-200 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-blue-400"></div>
        <DialogHeader className="mt-2">
          <DialogTitle className="text-2xl font-black uppercase text-slate-800 tracking-tighter flex items-center gap-2">
            <Wrench className="text-blue-500"/>
            New Service
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem><FormControl><Input type="date" {...field} className="w-full bg-slate-50 p-4 h-auto rounded-2xl border-slate-200 font-bold text-sm text-slate-800 focus:outline-none focus:border-blue-500" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="odo" render={({ field }) => (
                    <FormItem><FormControl><Input type="number" placeholder="Odo (KM)" {...field} className="w-full bg-slate-50 p-4 h-auto rounded-2xl border-slate-200 font-bold text-sm text-slate-800 focus:outline-none focus:border-blue-500" /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
            <FormField control={form.control} name="work" render={({ field }) => (
                <FormItem><FormControl><Input placeholder="Service Title (e.g. Oil Change)" {...field} className="w-full bg-slate-50 p-4 h-auto rounded-2xl border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-blue-500" /></FormControl><FormMessage /></FormItem>
            )} />

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Parts & Items</p>
                <Button type="button" size="sm" variant="ghost" onClick={() => append({ id: String(Date.now()), name: '', cost: 0, reminderType: 'none', reminderValue: '' })} className="text-blue-500 text-[10px] font-bold flex items-center gap-1 bg-blue-50 px-3 py-1.5 h-auto rounded-full hover:bg-blue-100 transition-colors"><Plus size={12}/> ADD ITEM</Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-3 animate-in slide-in-from-left-4 fade-in duration-300">
                    <div className="flex gap-2">
                        <FormField control={form.control} name={`parts.${index}.name`} render={({ field }) => (
                            <FormItem className="flex-1"><FormControl><Input placeholder="Item name" {...field} className="flex-1 bg-white p-3 h-auto rounded-xl border-slate-200 font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-500" /></FormControl><FormMessage className="text-xs px-1" /></FormItem>
                        )} />
                        <FormField control={form.control} name={`parts.${index}.cost`} render={({ field }) => (
                            <FormItem className="w-24"><FormControl><Input type="number" placeholder="Cost" {...field} className="w-full bg-white p-3 h-auto rounded-xl border-slate-200 font-bold text-xs text-slate-800 focus:outline-none focus:border-blue-500" /></FormControl></FormItem>
                        )} />
                        {fields.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-red-500 hover:bg-red-50 p-2 h-auto w-auto rounded-lg transition-colors shrink-0"><X size={16}/></Button>}
                    </div>
                     <div className="flex gap-2 items-start">
                        <FormField control={form.control} name={`parts.${index}.reminderType`} render={({ field }) => (
                            <FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl>
                                <SelectTrigger className="bg-white p-2 h-auto rounded-xl border-slate-200 text-[10px] font-bold text-slate-500 focus:outline-none focus:border-blue-500"><SelectValue /></SelectTrigger>
                            </FormControl><SelectContent>
                                <SelectItem value="none">No Reminder</SelectItem>
                                <SelectItem value="km">Remind in (KM)</SelectItem>
                                <SelectItem value="days">Remind in (Days)</SelectItem>
                            </SelectContent></Select></FormItem>
                        )} />
                        {form.watch(`parts.${index}.reminderType`) !== 'none' && (
                             <FormField control={form.control} name={`parts.${index}.reminderValue`} render={({ field }) => (
                                <FormItem className="flex-1"><FormControl><Input type="number" placeholder="Value" {...field} className="w-full bg-white p-2 h-auto rounded-xl border-slate-200 font-bold text-[10px] text-slate-800 focus:outline-none focus:border-blue-500 animate-in fade-in" /></FormControl><FormMessage className="text-xs px-1" /></FormItem>
                             )} />
                        )}
                    </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <FormField control={form.control} name="labor" render={({ field }) => (
                  <FormItem><FormControl><Input type="number" placeholder="Labor Charge (रू)" {...field} className="w-full bg-slate-50 p-4 h-auto rounded-2xl border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-blue-500 placeholder:text-slate-400" /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 py-4 h-auto rounded-2xl font-black text-white text-lg shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:scale-[1.02] transition-all active:scale-95 uppercase tracking-wide mt-4">Save Service Record</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
