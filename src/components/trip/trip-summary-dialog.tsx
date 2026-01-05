"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trip } from '@/lib/types';
import { Award, Calendar, CheckCircle, CircleDollarSign, Gauge, MapPin } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';

interface TripSummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
}

export function TripSummaryDialog({ isOpen, onClose, trip }: TripSummaryDialogProps) {
  if (!trip) return null;

  const startDate = new Date(trip.start);
  const endDate = trip.end ? new Date(trip.end) : new Date();
  const durationDays = differenceInDays(endDate, startDate) || 1;
  const distanceTraveled = (trip.endOdo || 0) - (trip.startOdo || 0);
  const totalExpenses = (trip.expenses || []).reduce((sum, expense) => sum + expense.cost, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[2rem] p-6 border-slate-200 shadow-2xl">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 border-4 border-green-200">
            <Award size={32} className="text-green-600" />
          </div>
          <DialogTitle className="text-2xl font-black uppercase text-slate-800 tracking-tighter">
            Trip Completed!
          </DialogTitle>
           <p className="text-slate-500 text-sm">Great job! Here's a summary of your trip to <span className="font-bold">{trip.destination}</span>.</p>
        </DialogHeader>

        <div className="my-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <Gauge size={24} className="mx-auto text-primary mb-1"/>
                    <p className="text-xs font-bold text-slate-500">Distance</p>
                    <p className="text-lg font-black text-slate-800">{distanceTraveled.toLocaleString()} km</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <Calendar size={24} className="mx-auto text-primary mb-1"/>
                    <p className="text-xs font-bold text-slate-500">Duration</p>
                    <p className="text-lg font-black text-slate-800">{durationDays} {durationDays === 1 ? 'Day' : 'Days'}</p>
                </div>
            </div>
             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 mb-2 text-center uppercase flex items-center justify-center gap-2"><CircleDollarSign size={14} />Expenses Summary</h4>
                <div className="space-y-2">
                {(trip.expenses || []).map(exp => (
                    <div key={exp.id} className="flex justify-between items-center text-sm border-b border-slate-200 pb-1 last:border-0">
                        <span className="text-slate-600">{exp.item}</span>
                        <span className="font-bold text-slate-800">रू {exp.cost.toLocaleString()}</span>
                    </div>
                ))}
                {(!trip.expenses || trip.expenses.length === 0) && (
                    <p className="text-xs text-slate-400 italic text-center py-2">No expenses were logged for this trip.</p>
                )}
                </div>
                <div className="flex justify-between items-center mt-3 pt-2 border-t-2 border-dashed border-slate-300">
                    <span className="font-black text-slate-800">Total Cost</span>
                    <span className="font-black text-lg text-primary">रू {totalExpenses.toLocaleString()}</span>
                </div>
            </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full h-12 text-lg">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    