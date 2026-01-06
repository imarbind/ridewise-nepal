"use client";

import { Wrench, CheckCircle2, Calendar, AlertTriangle } from 'lucide-react';
import type { NextServiceInfo } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface NextServiceBarProps {
    serviceInfo: NextServiceInfo;
}

const getProgressProps = (progress: number) => {
    if (progress >= 100) return { className: '[&>div]:bg-red-600', text: 'Service is overdue!', icon: <AlertTriangle size={14} className="text-red-500" /> };
    if (progress > 85) return { className: '[&>div]:bg-orange-500', text: 'Service recommended soon.', icon: <AlertTriangle size={14} className="text-orange-500" /> };
    if (progress > 60) return { className: '[&>div]:bg-yellow-500', text: 'Approaching service interval.', icon: <Wrench size={14} className="text-yellow-600" /> };
    return { className: '[&>div]:bg-green-500', text: 'Recently serviced. All good.', icon: <CheckCircle2 size={14} className="text-green-500"/> };
};

export function NextServiceBar({ serviceInfo }: NextServiceBarProps) {
    if (!serviceInfo || !serviceInfo.nextServiceDate) {
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
    
    const progressProps = getProgressProps(serviceInfo.progress);

    return (
        <div className="bg-card/90 backdrop-blur-lg border border-slate-200 shadow-xl rounded-2xl p-4 animate-in fade-in">
             <div className="flex items-center justify-between gap-4 mb-2">
                <p className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Wrench size={12} className="text-primary"/>Next Service</p>
                <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                    <Calendar size={12}/>
                    {serviceInfo.lastServiceDate ? format(new Date(serviceInfo.lastServiceDate), 'MMM d, yyyy') : 'N/A'}
                    <span className="font-sans">→</span>
                    {serviceInfo.nextServiceDate ? format(new Date(serviceInfo.nextServiceDate), 'MMM d, yyyy') : 'N/A'}
                </div>
            </div>
            <Progress 
                value={serviceInfo.progress} 
                className={cn("h-2 w-full", progressProps.className)}
            />
            <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    {progressProps.icon}
                    <span className="text-[11px] italic">{progressProps.text}</span>
                </div>
                <p className="text-xs font-bold text-slate-500">
                    {serviceInfo.daysToNextService !== null && serviceInfo.daysToNextService > 0 ? 
                        `Due in ${serviceInfo.daysToNextService} days` :
                        (serviceInfo.daysToNextService === 0 ? 'Due today' : `Overdue`)
                    }
                </p>
            </div>
            {serviceInfo.tasks.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200/60">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Tasks for next service:</p>
                    <div className="flex flex-wrap gap-1.5">
                        {serviceInfo.tasks.map(task => (
                            <span key={task} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                                {task}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
