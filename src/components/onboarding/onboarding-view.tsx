'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BikeDetails, EngineCc } from '@/lib/types';
import { useState } from 'react';

const onboardingSchema = z.object({
  make: z.string().min(2, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  name: z.string().min(2, 'Bike nickname is required'),
  number: z.string().min(3, 'Bike number is required'),
  year: z.string().length(4, 'Enter a valid year'),
  engineCc: z.enum(['50-125', '126-250', '251-500', '501-1000', '>1000']),
  initialOdo: z.coerce.number().min(0, 'Odometer reading must be positive'),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

interface OnboardingViewProps {
  onSubmit: (details: BikeDetails, initialOdo: number) => void;
}

const ccOptions: EngineCc[] = ['50-125', '126-250', '251-500', '501-1000', '>1000'];

export function OnboardingView({ onSubmit }: OnboardingViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      make: '',
      model: '',
      name: '',
      number: '',
      year: '',
      engineCc: '126-250',
      initialOdo: 0,
    },
  });

  const handleFormSubmit = (data: OnboardingFormData) => {
    setIsLoading(true);
    const { initialOdo, ...bikeDetails } = data;
    onSubmit(bikeDetails, initialOdo);
    // The parent component will handle unmounting this view.
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-3xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">
            Welcome to <span className="text-primary">Rydio</span>!
          </h1>
          <p className="text-slate-600 mt-2">Let's set up your vehicle profile to get started.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <h3 className="font-bold text-slate-600 border-b pb-2">Your Bike's Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="make" render={({ field }) => (
                <FormItem><FormLabel>Make</FormLabel><FormControl><Input placeholder="e.g., Bajaj" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="model" render={({ field }) => (
                <FormItem><FormLabel>Model</FormLabel><FormControl><Input placeholder="e.g., Pulsar 220F" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
             <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Bike Nickname</FormLabel><FormControl><Input placeholder="e.g., The Black Pearl" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            <FormField control={form.control} name="number" render={({ field }) => (
                <FormItem><FormLabel>Bike Number</FormLabel><FormControl><Input placeholder="e.g., BA 01 PA 0001" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            <div className="grid grid-cols-2 gap-4">
               <FormField control={form.control} name="year" render={({ field }) => (
                <FormItem><FormLabel>Year</FormLabel><FormControl><Input placeholder="e.g., 2023" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="engineCc" render={({ field }) => (
                <FormItem><FormLabel>Engine CC</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select CC" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {ccOptions.map(cc => <SelectItem key={cc} value={cc}>{cc} cc</SelectItem>)}
                        </SelectContent>
                    </Select>
                <FormMessage /></FormItem>
              )} />
            </div>

            <h3 className="font-bold text-slate-600 border-b pb-2 pt-4">Current Reading</h3>
            <FormField control={form.control} name="initialOdo" render={({ field }) => (
              <FormItem><FormLabel>Odometer Reading (KM)</FormLabel><FormControl><Input type="number" placeholder="e.g., 15000" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            
            <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save and Continue'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
