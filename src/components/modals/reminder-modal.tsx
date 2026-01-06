
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BellRing } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ManualReminder } from '@/lib/types';

interface ReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<ManualReminder, 'id' | 'isCompleted'>) => void;
    lastOdo: number;
}

const reminderSchema = z.object({
  date: z.string().optional(),
  odo: z.coerce.number().optional(),
  notes: z.string().optional(),
}).refine(data => data.date || data.odo, {
  message: 'Either a date or an odometer reading is required.',
  path: ['date'], 
});


type ReminderFormData = z.infer<typeof reminderSchema>;

export function ReminderModal({ isOpen, onClose, onSubmit, lastOdo }: ReminderModalProps) {
  const form = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {}
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        date: '',
        odo: undefined,
        notes: '',
      });
    }
  }, [isOpen, form]);

  const onFormSubmit = (data: ReminderFormData) => {
    const reminderData = {
        ...data,
        odo: data.odo || 0, // Ensure odo is a number
    };
    onSubmit(reminderData);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-3xl p-6 sm:p-8 border-slate-200 shadow-2xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center border border-blue-200">
                <BellRing className="text-blue-600"/>
            </div>
            Set Service Reminder
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-slate-600">
            Set a reminder for your next service. The app will notify you based on date or kilometers, whichever comes first.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6 pt-4">
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

            <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl><Textarea placeholder="e.g., General check-up, change oil..." {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            <Button type="submit" className="w-full h-12 text-base font-bold text-white bg-slate-800 rounded-xl shadow-none border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all duration-150 hover:bg-slate-700">
              Set Reminder
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
