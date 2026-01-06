
"use client";

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wrench, X, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ServiceRecord } from '@/lib/types';
import { Textarea } from '../ui/textarea';

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<ServiceRecord, 'id'>, id?: string) => void;
    lastOdo: number;
    editingService: ServiceRecord | null;
}

const partSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Part name can't be empty"),
  cost: z.coerce.number().min(0),
  quantity: z.coerce.number().min(1, "Qty must be at least 1").default(1),
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
  totalCost: z.coerce.number().optional(), // totalCost is calculated in submit
  serviceType: z.enum(['regular', 'repair', 'emergency']).optional(),
  notes: z.string().optional(),
  invoiceUrl: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export function ServiceModal({ isOpen, onClose, onSubmit, lastOdo, editingService }: ServiceModalProps) {
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      labor: 0,
      serviceType: 'regular',
      notes: '',
      invoiceUrl: '',
    }
  });

  const { control, reset, watch, setValue } = form;
  const { fields, append, remove } = useFieldArray({
    control: control,
    name: "parts",
  });

  const parts = watch('parts');
  const labor = watch('labor');

  useEffect(() => {
    if (isOpen) {
      if (editingService) {
        reset(editingService);
      } else {
        reset({
          date: new Date().toISOString().split('T')[0],
          work: '',
          labor: 0,
          odo: lastOdo > 0 ? lastOdo : undefined,
          parts: [{ id: String(Date.now()), name: '', cost: 0, quantity: 1, reminderType: 'none', reminderValue: '' }],
          serviceType: 'regular',
          notes: '',
          invoiceUrl: '',
        });
      }
    }
  }, [isOpen, editingService, lastOdo, reset]);

  const onFormSubmit = (data: ServiceFormData) => {
    const partsTotal = data.parts.reduce((sum, p) => sum + (p.cost * p.quantity), 0);
    const totalCost = (data.labor || 0) + partsTotal;
    const finalData = { ...data, totalCost };
    onSubmit(finalData, editingService?.id);
    onClose();
  }
  
  const calculatedTotal = useMemo(() => {
      const partsTotal = (parts || []).reduce((sum, p) => sum + ((p.cost || 0) * (p.quantity || 1)), 0);
      return (labor || 0) + partsTotal;
  }, [parts, labor]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[2rem] p-6 border-slate-200 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-red-400"></div>
        <DialogHeader className="mt-2">
          <DialogTitle className="text-2xl font-black uppercase text-slate-800 tracking-tighter flex items-center gap-2">
            <Wrench className="text-primary"/>
            {editingService ? 'Edit Service' : 'New Service'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Date</FormLabel>
                        <FormControl><Input type="date" {...field} className="w-full bg-slate-50 p-4 h-auto rounded-2xl border-slate-200 font-bold text-sm text-slate-800 focus:outline-none focus:border-primary" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="odo" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Odometer (KM)</FormLabel>
                        <FormControl><Input type="number" {...field} className="w-full bg-slate-50 p-4 h-auto rounded-2xl border-slate-200 font-bold text-sm text-slate-800 focus:outline-none focus:border-primary" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
            <FormField control={form.control} name="work" render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Service Title</FormLabel>
                    <FormControl><Input placeholder="e.g. Regular Servicing" {...field} className="w-full bg-slate-50 p-4 h-auto rounded-2xl border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-primary" /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            
            <FormField control={form.control} name="serviceType" render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Service Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger className="w-full bg-slate-50 p-4 h-auto rounded-2xl border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-primary">
                                <SelectValue placeholder="Select service type" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="regular">Regular</SelectItem>
                            <SelectItem value="repair">Repair</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Parts & Items</p>
                <Button type="button" size="sm" variant="ghost" onClick={() => append({ id: String(Date.now()), name: '', cost: 0, quantity: 1, reminderType: 'none', reminderValue: '' })} className="text-primary text-[10px] font-bold flex items-center gap-1 bg-red-50 px-3 py-1.5 h-auto rounded-full hover:bg-red-100 transition-colors"><Plus size={12}/> ADD ITEM</Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-3 animate-in slide-in-from-left-4 fade-in duration-300">
                    <div className="flex gap-2 items-start">
                        <FormField control={form.control} name={`parts.${index}.name`} render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Item Name</FormLabel>
                                <FormControl><Input {...field} className="flex-1 bg-white p-3 h-auto rounded-xl border-slate-200 font-bold text-xs text-slate-800 focus:outline-none focus:border-primary" /></FormControl><FormMessage className="text-xs px-1" />
                            </FormItem>
                        )} />
                        <div className="flex gap-1">
                          <FormField control={form.control} name={`parts.${index}.quantity`} render={({ field }) => (
                              <FormItem className="w-16">
                                  <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Qty</FormLabel>
                                  <FormControl><Input type="number" {...field} className="w-full bg-white p-3 h-auto rounded-xl border-slate-200 font-bold text-xs text-slate-800 focus:outline-none focus:border-primary" /></FormControl>
                              </FormItem>
                          )} />
                          <FormField control={form.control} name={`parts.${index}.cost`} render={({ field }) => (
                              <FormItem className="w-20">
                                  <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Cost</FormLabel>
                                  <FormControl><Input type="number" {...field} className="w-full bg-white p-3 h-auto rounded-xl border-slate-200 font-bold text-xs text-slate-800 focus:outline-none focus:border-primary" /></FormControl>
                              </FormItem>
                          )} />
                        </div>
                        {fields.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-red-500 hover:bg-red-50 p-2 h-auto w-auto rounded-lg transition-colors shrink-0 self-end mb-1"><X size={16}/></Button>}
                    </div>
                     <div className="flex gap-2 items-start">
                        <FormField control={form.control} name={`parts.${index}.reminderType`} render={({ field }) => (
                            <FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl>
                                <SelectTrigger className="bg-white p-2 h-auto rounded-xl border-slate-200 text-[10px] font-bold text-slate-500 focus:outline-none focus:border-primary"><SelectValue /></SelectTrigger>
                            </FormControl><SelectContent>
                                <SelectItem value="none">No Reminder</SelectItem>
                                <SelectItem value="km">Remind in (KM)</SelectItem>
                                <SelectItem value="days">Remind in (Days)</SelectItem>
                            </SelectContent></Select></FormItem>
                        )} />
                        {form.watch(`parts.${index}.reminderType`) !== 'none' && (
                             <FormField control={form.control} name={`parts.${index}.reminderValue`} render={({ field }) => (
                                <FormItem className="flex-1"><FormControl><Input type="number" placeholder="Value" {...field} className="w-full bg-white p-2 h-auto rounded-xl border-slate-200 font-bold text-[10px] text-slate-800 focus:outline-none focus:border-primary animate-in fade-in" /></FormControl><FormMessage className="text-xs px-1" /></FormItem>
                             )} />
                        )}
                    </div>
                </div>
              ))}
            </div>

            <div className="pt-2 grid grid-cols-2 gap-4">
              <FormField control={form.control} name="labor" render={({ field }) => (
                  <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Labor Charge (रू)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g. 500" {...field} className="w-full bg-slate-50 p-4 h-auto rounded-2xl border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-primary" /></FormControl>
                      <FormMessage />
                  </FormItem>
              )} />
              <div className="text-right">
                  <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Total Cost (रू)</FormLabel>
                  <p className="font-black text-3xl text-primary mt-1">{calculatedTotal.toLocaleString()}</p>
              </div>
            </div>

            <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Notes</FormLabel>
                    <FormControl><Textarea placeholder="e.g., Chain was loose, tightened and lubed." {...field} className="w-full bg-slate-50 p-4 h-auto rounded-2xl border-slate-200 font-bold text-sm text-slate-800 focus:outline-none focus:border-primary" /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            <FormField control={form.control} name="invoiceUrl" render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Invoice URL (optional)</FormLabel>
                    <FormControl><Input placeholder="https://example.com/invoice.jpg" {...field} className="w-full bg-slate-50 p-4 h-auto rounded-2xl border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-primary" /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />


            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-red-700 py-4 h-auto rounded-2xl font-black text-white text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all active:scale-95 uppercase tracking-wide mt-4">
              {editingService ? 'Update Service Record' : 'Save Service Record'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
