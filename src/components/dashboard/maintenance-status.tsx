"use client";

import { Clock, AlertTriangle } from 'lucide-react';
import type { Reminder } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface MaintenanceStatusProps {
    activeReminders: Reminder[];
}

export function MaintenanceStatus({ activeReminders }: MaintenanceStatusProps) {
    return (
        <div>
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4 px-1">
                <Clock size={14} className="text-primary"/> Maintenance Status
            </h2>
      
            <div className="space-y-4">
                {activeReminders.length === 0 && (
                <div className="bg-card/40 border border-dashed border-slate-300 p-8 rounded-3xl text-center backdrop-blur-sm">
                    <p className="text-slate-500 text-xs italic">All systems good. No pending maintenance.</p>
                </div>
                )}
                {activeReminders.map((rem, i) => (
                <div key={i} className="bg-card border-l-4 border-primary p-4 rounded-r-2xl shadow-lg relative overflow-hidden group hover:bg-slate-50 transition-colors border-y border-r border-slate-100">
                    <div className="flex justify-between items-center mb-2 relative z-10">
                    <span className={cn('text-sm font-black', rem.isDue ? 'text-primary' : 'text-slate-700')}>
                        {rem.name} {rem.isDue && <AlertTriangle size={14} className="inline ml-1 animate-bounce"/>}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded">{rem.label}</span>
                    </div>
                    <Progress 
                        value={rem.progress} 
                        className={cn("h-2 w-full", rem.isDue ? '[&>div]:bg-primary' : '[&>div]:bg-blue-600')}
                        // The following is a trick to make the progress bar animate
                        style={{ transform: `translateX(0)` }}
                     />
                </div>
                ))}
            </div>
        </div>
    );
}
