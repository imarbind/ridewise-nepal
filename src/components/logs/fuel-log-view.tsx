"use client";

import { Droplets, Trash2, Edit } from 'lucide-react';
import type { FuelLog } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FuelLogViewProps {
    logs: FuelLog[];
    onDelete: (id: number) => void;
    onEdit: (log: FuelLog) => void;
}

export function FuelLogView({ logs, onDelete, onEdit }: FuelLogViewProps) {
    return (
        <div className="pb-32 animate-in slide-in-from-right-8 fade-in duration-500">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Fuel History</h2>
            <div className="space-y-3">
                {logs.length === 0 && <p className="text-center text-slate-500 text-xs py-10">No fuel logs yet.</p>}
                {logs.map((l, idx) => (
                    <div 
                        key={l.id} 
                        style={{animationDelay: `${idx * 50}ms`}} 
                        className={cn(
                            "bg-card border border-slate-200 p-4 rounded-2xl shadow-md animate-in slide-in-from-bottom-2 fill-mode-backwards group",
                            "flex flex-col"
                        )}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-black text-slate-800 text-sm">{l.odo.toLocaleString()} KM</p>
                                <p className="text-[10px] text-slate-500 uppercase font-bold">
                                    {new Date(l.date).toLocaleDateString('en-CA')}
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button onClick={() => onEdit(l)} variant="ghost" size="icon" className="w-8 h-8 rounded-full text-slate-400 hover:bg-blue-50 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Edit size={16} />
                                </Button>
                                <Button onClick={() => onDelete(l.id)} variant="ghost" size="icon" className="w-8 h-8 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="text-center">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Cost</p>
                                <p className="font-black text-slate-800">रू {l.amount.toLocaleString()}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Liters</p>
                                <p className="font-black text-slate-800">{l.liters.toFixed(2)}L</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Rate</p>
                                <p className="font-black text-slate-800">@{l.price.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}