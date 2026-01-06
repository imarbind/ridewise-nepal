
"use client";

import { Fuel, Trash2, Edit, Calendar } from 'lucide-react';
import type { FuelLog } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FuelLogViewProps {
    logs: FuelLog[];
    onDelete: (id: string) => void;
    onEdit: (log: FuelLog) => void;
}

export function FuelLogView({ logs, onDelete, onEdit }: FuelLogViewProps) {
    const sortedLogs = [...logs].sort((a,b) => b.odo - a.odo);

    return (
        <div className="pb-32">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800">Fuel Timeline</h2>
            
            <div className="relative">
                {sortedLogs.length > 1 && 
                    <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200"></div>
                }

                {sortedLogs.length === 0 && (
                <div className="text-center text-slate-500 text-xs py-10 bg-slate-50/50 rounded-2xl border border-slate-200 border-dashed">No fuel logs yet.</div>
                )}
                
                <div className="space-y-6">
                {sortedLogs.map((log, idx) => (
                    <div key={log.id} style={{animationDelay: `${idx * 50}ms`}} className="group relative flex items-start gap-4 animate-in slide-in-from-bottom-4 fill-mode-backwards">
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-background bg-green-600">
                                <Fuel size={20} />
                            </div>
                            <p className="text-[9px] font-black text-slate-500 text-center mt-1.5 bg-slate-100 px-1.5 py-0.5 rounded">{log.odo.toLocaleString()} KM</p>
                        </div>

                        <div className="flex-1 pt-0.5">
                            <div className="bg-card border p-4 rounded-2xl shadow-md relative overflow-hidden transition-all hover:shadow-lg hover:border-green-500/50 border-slate-200">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-black text-slate-800 text-base">Fuel Refill</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5">
                                            <Calendar size={12}/> {new Date(log.date).toLocaleDateString('en-CA')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button onClick={() => onEdit(log)} variant="ghost" size="icon" className="w-8 h-8 rounded-full text-slate-400 hover:bg-blue-50 hover:text-blue-500">
                                            <Edit size={14} />
                                        </Button>
                                        <Button onClick={() => onDelete(log.id)} variant="ghost" size="icon" className="w-8 h-8 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500">
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-3 grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">Liters</p>
                                        <p className="font-black text-slate-800 text-sm">{log.liters.toFixed(2)}L</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">Rate</p>
                                        <p className="font-black text-slate-800 text-sm">@{log.price.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">Cost</p>
                                        <p className="font-black text-slate-800 text-sm">रू {log.amount.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
}
