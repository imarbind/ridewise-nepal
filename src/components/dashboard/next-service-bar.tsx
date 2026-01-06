"use client";

import { Wrench, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { Reminder } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface NextServiceBarProps {
    reminder: Reminder | null;
}

const getProgressProps = (progress: number) => {
    if (progress >= 100) return { className: '[&>div]:bg-red-600', text: 'Service is overdue!', icon: <AlertTriangle size={14} /> };
    if (progress > 85) return { className: '[&>div]:bg-orange-500', text: 'Service recommended soon.', icon: <AlertTriangle size={14} /> };
    if (progress > 60) return { className: '[&>div]:bg-yellow-500', text: 'Approaching service interval.', icon: <Wrench size={14} /> };
    return { className: '[&>div]:bg-green-500', text: 'Recently serviced. All good.', icon: <CheckCircle2 size={14} /> };
};

export function NextServiceBar({ reminder }: NextServiceBarProps) {
    if (!reminder) {
        return (
            <div className="bg-card/80 backdrop-blur-lg border border-slate-200 p-4 rounded-2xl text-center shadow-lg flex items-center justify-center gap-3">
                <CheckCircle2 className="text-green-500" size={24}/>
                <div>
                    <h3 className="font-black text-slate-800 text-sm">No Maintenance Due</h3>
                    <p className="text-[10px] text-slate-500">Set service reminders to see them here.</p>
                </div>
            </div>
        );
    }
    
    const progressProps = getProgressProps(reminder.progress);
    const isKm = reminder.rawData.reminderType === 'km';
    const remaining = reminder.rawData.reminderValue - reminder.rawData.currentUsed;

    return (
        <div className="bg-card/90 backdrop-blur-lg border border-slate-200 shadow-xl rounded-2xl p-4 animate-in fade-in">
             <div className="flex items-center justify-between gap-4 mb-2">
                <div>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Wrench size={12} className="text-primary"/>Next Service: <span className="text-primary">{reminder.name}</span></p>
                </div>
                <p className="text-xs font-bold text-slate-500">{reminder.label}</p>
            </div>
            <Progress 
                value={reminder.progress} 
                className={cn("h-3 w-full", progressProps.className)}
            />
            <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    {progressProps.icon}
                    <span className="text-[11px] italic">{progressProps.text}</span>
                </div>
                <p className="text-xs font-bold text-slate-500">
                    {reminder.progress < 100 ? `Due in ${Math.round(remaining).toLocaleString()} ${isKm ? 'km' : 'days'}` : ''}
                </p>
            </div>
        </div>
    );
}
