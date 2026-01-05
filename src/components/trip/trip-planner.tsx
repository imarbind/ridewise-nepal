"use client";

import React, { useState, useTransition, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { ShieldCheck, TrendingUp, CheckCircle2, AlertOctagon, Loader2 } from 'lucide-react';
import type { Trip, Stats, ServiceRecord } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getTripMaintenanceAdviceAction } from '@/app/actions';
import { TripMaintenanceAdvisoryOutput } from '@/ai/flows/trip-maintenance-advisor';
import { differenceInDays } from 'date-fns';

interface TripPlannerProps {
  onCreateTrip: (tripData: Omit<Trip, 'id'|'status'|'expenses'|'end'>) => void;
  stats: Stats;
  services: ServiceRecord[];
}

const initialTripState = { destination: '', start: '', distance: '' };

export function TripPlanner({ onCreateTrip, stats, services }: TripPlannerProps) {
  const [newTrip, setNewTrip] = useState(initialTripState);
  const [analysis, setAnalysis] = useState<TripMaintenanceAdvisoryOutput | null>(null);
  const [isPending, startTransition] = useTransition();

  const getAiAnalysis = useCallback((distance: string, startDate: string) => {
    if (!distance || !startDate || !stats.lastOdo) {
      setAnalysis(null);
      return;
    }

    const tripStartDate = new Date(startDate);
    const today = new Date();
    // Use today if trip start date is in the past for duration calculation
    const durationStartDate = tripStartDate < today ? today : tripStartDate;
    
    // Approximate duration, assuming a return trip might not be immediate. 
    // This is a placeholder; a more accurate end date would be better.
    // For now, let's assume a trip lasts at least 1 day.
    const estimatedTripDays = Math.max(1, Math.ceil(parseFloat(distance) / Math.max(parseFloat(stats.dailyAvg), 50)));

    
    startTransition(async () => {
      const result = await getTripMaintenanceAdviceAction(
        newTrip.destination || "Trip",
        startDate.split('T')[0],
        parseFloat(distance),
        stats.lastOdo,
        services,
        parseFloat(stats.dailyAvg),
        estimatedTripDays
      );
      if ("advisory" in result) {
        setAnalysis(result);
      } else {
        console.error(result.error);
        setAnalysis(null);
      }
    });
  }, [newTrip.destination, stats.lastOdo, stats.dailyAvg, services]);

  const debouncedAnalysis = useCallback(debounce(getAiAnalysis, 500), [getAiAnalysis]);

  useEffect(() => {
    debouncedAnalysis(newTrip.distance, newTrip.start);
    return () => debouncedAnalysis.cancel();
  }, [newTrip.distance, newTrip.start, debouncedAnalysis]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTrip(newTrip);
    setNewTrip(initialTripState);
  };
  
  const getStatusProps = (status: string) => {
    switch (status) {
      case 'due_before':
        return {
          className: 'bg-red-50 border-red-100 text-red-700',
          icon: <AlertOctagon size={18} className="shrink-0 mt-0.5" />,
          isUrgent: true
        };
      case 'due_during':
        return {
          className: 'bg-orange-50 border-orange-100 text-orange-700',
          icon: <AlertOctagon size={18} className="shrink-0 mt-0.5" />,
          isUrgent: false
        };
      default:
        return {
          className: 'bg-blue-50 border-blue-100 text-blue-700',
          icon: <ShieldCheck size={18} className="shrink-0 mt-0.5" />,
          isUrgent: false
        };
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8">
      <Input required value={newTrip.destination} onChange={e => setNewTrip({...newTrip, destination: e.target.value})} placeholder="Where to? (e.g. Mustang)" className="w-full bg-card p-4 h-auto rounded-2xl border-slate-200 font-bold text-slate-800 outline-none focus:border-blue-500 transition-all shadow-sm" />
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1 block">Start Date & Time (Optional)</label>
          <Input required type="datetime-local" value={newTrip.start} onChange={e => setNewTrip({...newTrip, start: e.target.value})} className="w-full bg-card p-4 h-auto rounded-2xl border-slate-200 font-bold text-slate-800 outline-none focus:border-blue-500 shadow-sm" />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1 block">Trip Distance (KM)</label>
          <Input required type="number" value={newTrip.distance} onChange={e => setNewTrip({...newTrip, distance: e.target.value})} placeholder="Total Km" className="w-full bg-card p-4 h-auto rounded-2xl border-slate-200 font-bold text-slate-800 outline-none focus:border-blue-500 shadow-sm" />
        </div>
      </div>

      {newTrip.distance && newTrip.start && (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-2">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-1">
            <ShieldCheck size={12} /> Vehicle Health Check
          </p>
          {isPending ? (
            <div className="flex items-center gap-3 text-slate-500 p-3">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-xs font-bold">Checking vehicle readiness...</span>
            </div>
          ) : !analysis || analysis.advisory.length === 0 ? (
            <div className="flex items-center gap-3 text-green-600 bg-green-50 p-3 rounded-xl border border-green-100">
              <CheckCircle2 size={20} />
              <span className="text-xs font-bold">Good to go! No maintenance expected.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {analysis.advisory.map((item, i) => {
                const { className, icon, isUrgent } = getStatusProps(item.status);
                return (
                    <div key={i} className={`p-3 rounded-xl border flex items-start gap-3 ${className}`}>
                        {icon}
                        <div>
                        <p className="font-black text-sm">{item.taskName}</p>
                        <p className="text-xs font-medium opacity-90">{item.message}</p>
                        {isUrgent && <p className="text-[10px] font-black uppercase mt-1 bg-red-200/50 inline-block px-1 rounded">Action Required</p>}
                        </div>
                    </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <Button type="submit" className="w-full bg-slate-900 text-white py-4 h-auto rounded-2xl font-black text-lg shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all">Plan My Trip</Button>
    </form>
  );
}
