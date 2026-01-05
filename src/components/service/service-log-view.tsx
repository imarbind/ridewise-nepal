"use client";

import { Wrench, Trash2, Edit } from 'lucide-react';
import type { ServiceRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ServiceLogViewProps {
    logs: ServiceRecord[];
    onDelete: (id: string) => void;
    onEdit: (log: ServiceRecord) => void;
}

export function ServiceLogView({ logs, onDelete, onEdit }: ServiceLogViewProps) {
    const sortedLogs = [...logs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return (
        <div className="pb-32 animate-in slide-in-from-right-8 fade-in duration-500">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-700">Service History</h2>
            <div className="space-y-3">
                {sortedLogs.length === 0 && <p className="text-center text-slate-500 text-xs py-10">No service logs yet.</p>}
                {sortedLogs.map((l, idx) => (
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

                        <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                             <div className="flex justify-between items-center text-xs">
                                <p className="font-bold text-primary">{l.work}</p>
                                <p className="font-black text-primary">Total: रू {l.totalCost.toLocaleString()}</p>
                             </div>
                            {l.parts.map((p, pIdx) => (
                                <div key={pIdx} className="flex justify-between text-xs py-1 border-b border-slate-200 last:border-b-0">
                                    <span className="text-slate-600 font-medium">{p.name}</span>
                                    <span className="text-slate-800 font-bold">रू {parseFloat(String(p.cost)).toLocaleString()}</span>
                                </div>
                            ))}
                             {l.labor > 0 && (
                                <div className="flex justify-between text-xs pt-1 text-slate-500 italic">
                                    <span>Labor Charge</span>
                                    <span>रू {l.labor.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
    
