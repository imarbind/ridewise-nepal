
"use client";

import { useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wrench, X, Plus, BellRing, ChevronsUpDown, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import type { ServiceRecord, ManualReminder } from '@/lib/types';
import { Textarea } from '../ui/textarea';
import { bikeServices, bikeParts } from '@/lib/master-data';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

type ModalMode = 'service' | 'reminder';

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmitService: (data: Omit<ServiceRecord, 'id'>, id?: string) => void;
    onSubmitReminder: (data: Omit<ManualReminder, 'id' | 'isCompleted'>) => void;
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

const serviceObjectSchema = z.object({
  mode: z.literal("service"),
  date: z.string().min(1, 'Date is required'),
  odo: z.coerce.number().min(1, 'Odometer reading is required'),
  labor: z.coerce.number().min(0).default(0),
  parts: z.array(partSchema).min(1, 'At least one part or item is required'),
  totalCost: z.coerce.number().optional(),
  serviceType: z.enum(['regular', 'repair', 'emergency']).optional(),
  notes: z.string().optional(),
  invoiceUrl: z.string().optional(),
});


const reminderObjectSchema = z.object({
  mode: z.literal("reminder"),
  date: z.string().optional(),
  odo: z.coerce.number().optional(),
  notes: z.string().min(1, 'Reminder notes are required.'),
});

const combinedSchema = z.discriminatedUnion("mode", [
  serviceObjectSchema,
  reminderObjectSchema,
]).refine((data) => {
    if (data.mode === 'reminder') {
        return data.date || data.odo;
    }
    return true;
}, {
    message: 'Either a date or an odometer reading is required for a reminder.',
    path: ['date'], 
});


type ServiceFormData = z.infer<typeof combinedSchema>;

const MasterSelect = ({ value, onValueChange, placeholder, items }: { value: string; onValueChange: (val: string) => void; placeholder: string; items: readonly string[] }) => {
    const [open, setOpen] = useState(false);
    const [customValue, setCustomValue] = useState('');

    const handleSelect = (selectedValue: string) => {
        onValueChange(selectedValue);
        setCustomValue("");
        setOpen(false);
    }
    
    const handleCustomValue = () => {
        if(customValue && !items.includes(customValue)) {
            onValueChange(customValue);
        }
        setOpen(false);
    }

    return (
        <Popover open={open} onOpenChange={handleCustomValue}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    onClick={() => setOpen(prev => !prev)}
                    className="w-full justify-between font-bold text-sm text-slate-800 bg-white p-3 h-auto rounded-xl border-slate-200"
                >
                    {value ? items.find((item) => item === value) || value : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput 
                        placeholder="Search or type custom..."
                        value={customValue}
                        onValueChange={setCustomValue}
                    />
                    <CommandEmpty>
                         <CommandItem
                            onSelect={() => handleSelect(customValue)}
                            >
                            Add: "{customValue}"
                        </CommandItem>
                    </CommandEmpty>
                    <CommandGroup>
                        {items.map((item) => (
                            <CommandItem
                                key={item}
                                onSelect={() => handleSelect(item)}
                            >
                                <Check className={cn("mr-2 h-4 w-4", value === item ? "opacity-100" : "opacity-0")} />
                                {item}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
};


export function ServiceModal({ isOpen, onClose, onSubmitService, onSubmitReminder, lastOdo, editingService }: ServiceModalProps) {
  const [mode, setMode] = useState<ModalMode>('service');

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      mode: 'service',
      labor: 0,
      serviceType: 'regular',
      notes: '',
      invoiceUrl: '',
    }
  });

  const { control, reset, watch, setValue, handleSubmit } = form;
  const { fields, append, remove } = useFieldArray({
    control: control,
    name: "parts",
  });

  const watchedMode = watch('mode');
  const parts = watch('parts');
  const labor = watch('labor');

  useEffect(() => {
    if (isOpen) {
        if (editingService) {
            setMode('service');
            reset({ mode: 'service', ...editingService });
        } else {
            // Reset to default for service mode when opened
            reset({
                mode: 'service',
                date: new Date().toISOString().split('T')[0],
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

  useEffect(() => {
    // When mode changes, reset the form with appropriate defaults
    if (isOpen && !editingService) {
        if (mode === 'reminder') {
            reset({
                mode: 'reminder',
                date: '',
                odo: undefined,
                notes: '',
            });
        } else {
             reset({
                mode: 'service',
                date: new Date().toISOString().split('T')[0],
                labor: 0,
                odo: lastOdo > 0 ? lastOdo : undefined,
                parts: [{ id: String(Date.now()), name: '', cost: 0, quantity: 1, reminderType: 'none', reminderValue: '' }],
                serviceType: 'regular',
                notes: '',
                invoiceUrl: '',
            });
        }
    }
  }, [mode, isOpen, editingService, reset, setValue, lastOdo]);


  const onFormSubmit = (data: ServiceFormData) => {
    setValue('mode', mode);
    if (data.mode === 'service') {
        const partsTotal = data.parts.reduce((sum, p) => sum + (p.cost * p.quantity), 0);
        const totalCost = (data.labor || 0) + partsTotal;
        const serviceTitle = data.parts.length > 0 ? data.parts[0].name : "Service";
        const finalData = { ...data, totalCost, work: serviceTitle };
        onSubmitService(finalData, editingService?.id);
    } else if (data.mode === 'reminder') {
        onSubmitReminder({
            date: data.date,
            odo: data.odo,
            notes: data.notes
        });
    }
    onClose();
  }
  
  const calculatedTotal = useMemo(() => {
      if (!parts) return labor || 0;
      const partsTotal = (parts || []).reduce((sum, p) => sum + ((p.cost || 0) * (p.quantity || 1)), 0);
      return (labor || 0) + partsTotal;
  }, [parts, labor]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[2rem] p-6 border-slate-200 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-red-400"></div>
        <DialogHeader className="mt-2">
           <RadioGroup defaultValue="service" value={mode} onValueChange={(value: ModalMode) => setMode(value)} className="grid grid-cols-2 gap-2 mb-4 bg-slate-100 p-1 rounded-full">
                <label htmlFor="mode-service" className={cn("text-center rounded-full p-2 text-sm font-bold cursor-pointer transition-colors", mode === 'service' ? 'bg-white text-primary shadow' : 'text-slate-500')}>
                  Add Service
                </label>
                <RadioGroupItem value="service" id="mode-service" className="sr-only" />
                <label htmlFor="mode-reminder" className={cn("text-center rounded-full p-2 text-sm font-bold cursor-pointer transition-colors", mode === 'reminder' ? 'bg-white text-primary shadow' : 'text-slate-500')}>
                  Set Reminder
                </label>
                <RadioGroupItem value="reminder" id="mode-reminder" className="sr-only" />
            </RadioGroup>
          <DialogTitle className="text-2xl font-black uppercase text-slate-800 tracking-tighter flex items-center gap-2">
            {mode === 'service' ? <Wrench className="text-primary"/> : <BellRing className="text-primary"/>}
            {mode === 'service' ? (editingService ? 'Edit Service' : 'New Service') : 'Set Service Reminder'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
             <input type="hidden" {...form.register('mode')} value={mode} />
            {watchedMode === 'service' ? (
            <>
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
                             <FormField
                                control={control}
                                name={`parts.${index}.name`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Item Name</FormLabel>
                                        <FormControl>
                                            <MasterSelect
                                                items={bikeParts}
                                                placeholder="Select part or type custom..."
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs px-1"/>
                                    </FormItem>
                                )}
                            />
                            {fields.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-red-500 hover:bg-red-50 p-2 h-auto w-auto rounded-lg transition-colors shrink-0 self-center"><X size={16}/></Button>}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                             <FormField control={form.control} name={`parts.${index}.quantity`} render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Qty</FormLabel>
                                    <FormControl><Input type="number" {...field} className="w-full bg-white p-3 h-auto rounded-xl border-slate-200 font-bold text-xs text-slate-800 focus:outline-none focus:border-primary" /></FormControl>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name={`parts.${index}.cost`} render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Cost</FormLabel>
                                    <FormControl><Input type="number" {...field} className="w-full bg-white p-3 h-auto rounded-xl border-slate-200 font-bold text-xs text-slate-800 focus:outline-none focus:border-primary" /></FormControl>
                                </FormItem>
                            )} />
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
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Total Cost (रू)</p>
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
            </>
            ) : (
            <>
                <p className="text-sm text-slate-600">
                    Set a reminder for your next service. The app will notify you based on date or kilometers, whichever comes first.
                </p>
                 <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Notes (Required)</FormLabel>
                        <FormControl><Textarea placeholder="e.g., General check-up, change oil..." {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Next Service Date</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                
                <div className="flex items-center gap-4">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="text-xs font-bold text-slate-400">OR</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <FormField control={form.control} name="odo" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Next Service at Odometer (KM)</FormLabel>
                        <FormControl><Input type="number" placeholder={`e.g., ${lastOdo + 5000}`} {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <Button type="submit" className="w-full h-12 text-base font-bold text-white bg-slate-800 rounded-xl shadow-none border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all duration-150 hover:bg-slate-700">
                  Set Reminder
                </Button>
            </>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
