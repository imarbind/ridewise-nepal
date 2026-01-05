
"use client";

import { Wrench, Trash2, Edit, Calendar } from 'lucide-react';
import type { ServiceRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ServiceLogViewProps {
    logs: ServiceRecord[];
    onDelete: (id: string) => void;
    onEdit: (log: ServiceRecord) => void;
}

export function ServiceLogView({ logs, onDelete, onEdit }: ServiceLogViewProps) {
    const sortedLogs = [...logs].sort((a,b) => b.odo - a.odo);
    
    return (
        <div className="pb-32 animate-in slide-in-from-right-8 fade-in duration-500">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-700">Service Timeline</h2>
            
             <div className="relative">
                {sortedLogs.length > 1 && 
                    <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200"></div>
                }

                {sortedLogs.length === 0 && (
                    <div className="text-center text-slate-500 text-xs py-10 bg-slate-50/50 rounded-2xl border border-slate-200 border-dashed">No service records yet.</div>
                )}
                
                <div className="space-y-6">
                {sortedLogs.map((service, idx) => (
                    <div key={service.id} style={{animationDelay: `${idx * 50}ms`}} className="group relative flex items-start gap-4 animate-in slide-in-from-bottom-4 fill-mode-backwards">
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-background bg-primary">
                                <Wrench size={20} />
                            </div>
                            <p className="text-[9px] font-black text-slate-500 text-center mt-1.5 bg-slate-100 px-1.5 py-0.5 rounded">{service.odo.toLocaleString()} KM</p>
                        </div>

                        <div className="flex-1 pt-0.5">
                             <div className="bg-card border p-4 rounded-2xl shadow-md relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 border-slate-200">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-black text-slate-800 text-base">{service.work}</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5">
                                            <Calendar size={12}/> {new Date(service.date).toLocaleDateString('en-CA')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button onClick={() => onEdit(service)} variant="ghost" size="icon" className="w-8 h-8 rounded-full text-slate-400 hover:bg-blue-50 hover:text-blue-500">
                                            <Edit size={14} />
                                        </Button>
                                        <Button onClick={() => onDelete(service.id)} variant="ghost" size="icon" className="w-8 h-8 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500">
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                                
                                <div className="space-y-2 bg-slate-50/80 p-3 rounded-xl border border-slate-100 backdrop-blur-sm">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Itemized Cost</p>
                                        <div className="text-sm">
                                            <span className="font-black text-primary">रू {service.totalCost.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    {service.parts.map((p, pIdx) => (
                                        <div key={pIdx} className="flex justify-between text-xs py-1 border-b border-slate-200 last:border-0">
                                            <span className="text-slate-600 font-medium">{p.name}</span>
                                            <span className="text-slate-800 font-bold">रू {parseFloat(String(p.cost)).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    {service.labor > 0 && (
                                        <div className="flex justify-between text-xs pt-1 text-slate-500 italic">
                                            <span>Labor Charge</span>
                                            <span>रू {service.labor.toLocaleString()}</span>
                                        </div>
                                    )}
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
