"use client";

import { Droplets, Trash2 } from 'lucide-react';
import type { FuelLog } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface FuelLogViewProps {
    logs: FuelLog[];
    onDelete: (id: number) => void;
}

export function FuelLogView({ logs, onDelete }: FuelLogViewProps) {
    return (
        <div className="pb-32 animate-in slide-in-from-right-8 fade-in duration-500">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Fuel History</h2>
            <div className="space-y-3">
                {logs.length === 0 && <p className="text-center text-slate-500 text-xs py-10">No fuel logs yet.</p>}
                {logs.map((l, idx) => (
                    <div 
                        key={l.id} 
                        style={{animationDelay: `${idx * 50}ms`}} 
                        className="bg-card border border-slate-200 p-4 rounded-2xl flex justify-between items-center shadow-md animate-in slide-in-from-bottom-2 fill-mode-backwards group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-red-50 p-2 rounded-full text-primary">
                                <Droplets size={18} />
                            </div>
                            <div>
                                <p className="font-black text-slate-800 text-sm">{l.odo.toLocaleString()} KM</p>
                                <p className="text-[10px] text-slate-500 uppercase font-bold">
                                {new Date(l.date).toLocaleDateString('en-CA')} • {l.liters}L 
                                {l.price && <span className="text-blue-500 ml-1">@{l.price}</span>}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-slate-800 font-black bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">रू {l.amount.toLocaleString()}</p>
                            <Button onClick={() => onDelete(l.id)} variant="ghost" size="icon" className="w-8 h-8 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
