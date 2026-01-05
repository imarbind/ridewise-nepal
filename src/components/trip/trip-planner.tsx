"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { ShieldCheck, TrendingUp, CheckCircle2, AlertOctagon, Loader2 } from 'lucide-react';
import type { Trip, Stats, ServiceRecord } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { differenceInDays, addDays } from 'date-fns';

interface TripPlannerProps {
  onCreateTrip: (tripData: Omit<Trip, 'id'|'status'|'expenses'|'end'>) => void;
  stats: Stats;
  services: ServiceRecord[];
}

interface MaintenanceTask {
  name: string;
  intervalType: 'km' | 'days';
  intervalValue: number;
  lastPerformedOdometer?: number;
  lastPerformedDate?: string;
}

interface Advisory {
  taskName: string;
  status: 'due_before' | 'due_during' | 'due_after' | 'not_due';
  kilometersOverdue?: number;
  daysOverdue?: number;

  message: string;
}

const initialTripState = { destination: '', start: '', distance: '' };

function getMaintenanceTasks(services: ServiceRecord[]): MaintenanceTask[] {
    const taskMap = new Map<string, MaintenanceTask>();

    // Sort services by date descending to get the latest one first
    [...services].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).forEach(service => {
        service.parts.forEach(part => {
            if (part.reminderType !== 'none' && Number(part.reminderValue) > 0) {
                // Only add/update if it's the most recent service for this part
                if (!taskMap.has(part.name)) {
                    taskMap.set(part.name, {
                        name: part.name,
                        intervalType: part.reminderType,
                        intervalValue: Number(part.reminderValue),
                        lastPerformedOdometer: service.odo,
                        lastPerformedDate: service.date
                    });
                }
            }
        });
    });
    
    return Array.from(taskMap.values());
}


export function TripPlanner({ onCreateTrip, stats, services }: TripPlannerProps) {
  const [newTrip, setNewTrip] = useState(initialTripState);
  const [analysis, setAnalysis] = useState<Advisory[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!newTrip.distance || !newTrip.start || !stats.lastOdo) {
      setAnalysis(null);
      return;
    }
    
    setIsLoading(true);

    const performAnalysis = () => {
      const distance = parseFloat(newTrip.distance);
      const startDate = new Date(newTrip.start);
      const currentOdometer = stats.lastOdo;
      const dailyAvgKm = parseFloat(stats.dailyAvg) || 0;

      // Estimate trip duration. If distance / dailyAvg is less than 1, use 1 day.
      const estimatedDurationDays = Math.max(1, Math.ceil(distance / (dailyAvgKm > 0 ? dailyAvgKm : 50)));
      const totalKmForTrip = distance + (dailyAvgKm * estimatedDurationDays);
      const odoAtTripEnd = currentOdometer + totalKmForTrip;

      const maintenanceTasks = getMaintenanceTasks(services);
      const advisories: Advisory[] = [];

      for (const task of maintenanceTasks) {
        let advisory: Advisory | null = null;
        if (task.intervalType === 'km') {
          const lastOdo = task.lastPerformedOdometer || 0;
          const dueOdo = lastOdo + task.intervalValue;
          
          if (currentOdometer >= dueOdo) {
            advisory = {
              taskName: task.name,
              status: 'due_before',
              kilometersOverdue: currentOdometer - dueOdo,
              message: `This service is overdue by ${(currentOdometer - dueOdo).toLocaleString()} km. It is critical to perform this maintenance before your trip.`
            };
          } else if (odoAtTripEnd >= dueOdo) {
            advisory = {
              taskName: task.name,
              status: 'due_during',
              message: `This service will become due during your trip. It is highly recommended to perform this maintenance beforehand.`
            };
          } else if (odoAtTripEnd > lastOdo + (task.intervalValue * 0.8)) {
             advisory = {
              taskName: task.name,
              status: 'due_during', // Flag as 'due_during' to show orange warning
              message: `This service will be over 80% of its service life during the trip. It's recommended to perform this maintenance beforehand to avoid issues.`
            };
          } else {
             advisory = {
              taskName: task.name,
              status: 'not_due',
              message: `This service is not due for this trip. Next service is in ${(dueOdo - currentOdometer).toLocaleString()} km.`
            };
          }
        } else if (task.intervalType === 'days') {
          const lastDate = new Date(task.lastPerformedDate || 0);
          const dueDate = addDays(lastDate, task.intervalValue);
          const tripEndDate = addDays(startDate, estimatedDurationDays);
          const today = new Date();
          
          if (today >= dueDate) {
            advisory = {
              taskName: task.name,
              status: 'due_before',
              daysOverdue: differenceInDays(today, dueDate),
              message: `This service is overdue by ${differenceInDays(today, dueDate)} days. It is critical to perform this maintenance before your trip.`
            };
          } else if (tripEndDate >= dueDate) {
            advisory = {
              taskName: task.name,
              status: 'due_during',
              message: `This service will become due during your trip. It is highly recommended to perform this maintenance beforehand.`
            };
          } else if (tripEndDate > addDays(lastDate, task.intervalValue * 0.8)) {
            advisory = {
              taskName: task.name,
              status: 'due_during', // Flag as 'due_during' to show orange warning
              message: `This service will be over 80% of its service life during the trip. It's recommended to perform this maintenance beforehand to avoid issues.`
            };
          } else {
            advisory = {
                taskName: task.name,
                status: 'not_due',
                message: `This service is not due for this trip. Next service is in ${differenceInDays(dueDate, today)} days.`
            };
          }
        }
        if(advisory) advisories.push(advisory);
      }
      setAnalysis(advisories);
      setIsLoading(false);
    };
    
    // Debounce the analysis
    const handler = setTimeout(performAnalysis, 500);
    return () => clearTimeout(handler);

  }, [newTrip.distance, newTrip.start, stats, services]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTrip(newTrip);
    setNewTrip(initialTripState);
    setAnalysis(null);
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
      default: // not_due or due_after
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
          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1 block">Start Date & Time</label>
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
          {isLoading ? (
            <div className="flex items-center gap-3 text-slate-500 p-3">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-xs font-bold">Checking vehicle readiness...</span>
            </div>
          ) : !analysis || analysis.filter(a => a.status !== 'not_due').length === 0 ? (
            <div className="flex items-center gap-3 text-green-600 bg-green-50 p-3 rounded-xl border border-green-100">
              <CheckCircle2 size={20} />
              <span className="text-xs font-bold">Good to go! No immediate maintenance required.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {analysis.map((item, i) => {
                if (item.status === 'not_due') return null;
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
