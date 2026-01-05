"use client";

import { Calendar, Trash2, Edit } from 'lucide-react';
import type { ServiceRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface ServiceLogViewProps {
    services: ServiceRecord[];
    onDelete: (id: number) => void;
    onEdit: (service: ServiceRecord) => void;
}

export function ServiceLogView({ services, onDelete, onEdit }: ServiceLogViewProps) {
    return (
        <div className="pb-32 animate-in slide-in-from-right-8 fade-in duration-500">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-primary">Service History</h2>
            <div className="space-y-4">
            {services.length === 0 && <p className="text-center text-slate-500 text-xs py-10">No service records yet.</p>}
            {services.map((s, idx) => (
                <div key={s.id} style={{animationDelay: `${idx * 50}ms`}} className="group bg-card p-5 rounded-3xl border border-slate-200 hover:border-blue-300 transition-colors shadow-lg animate-in slide-in-from-bottom-2 fill-mode-backwards relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-bl-full pointer-events-none -z-0"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-black text-slate-800 text-lg leading-tight group-hover:text-blue-600 transition-colors">{s.work}</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 flex items-center gap-1">
                                    <Calendar size={10} /> {new Date(s.date).toLocaleDateString('en-CA')} • {s.odo.toLocaleString()} KM
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button onClick={() => onEdit(s)} variant="ghost" size="icon" className="w-8 h-8 rounded-full text-slate-400 hover:bg-blue-50 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Edit size={16} />
                                </Button>
                                <Button onClick={() => onDelete(s.id)} variant="ghost" size="icon" className="w-8 h-8 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </div>
                        
                        <div className="space-y-2 bg-slate-50/80 p-3 rounded-xl border border-slate-100 backdrop-blur-sm">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Itemized Cost</p>
                            {s.parts.map((p, idx) => (
                                <div key={idx} className="flex justify-between text-xs py-1 border-b border-slate-200 last:border-0">
                                    <span className="text-slate-600 font-medium">{p.name}</span>
                                    <span className="text-slate-800 font-bold">रू {parseFloat(String(p.cost)).toLocaleString()}</span>
                                </div>
                            ))}
                            {s.labor > 0 && (
                                <div className="flex justify-between text-xs pt-1 text-slate-500 italic">
                                    <span>Labor Charge</span>
                                    <span>रू {s.labor.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm pt-2 mt-2 border-t border-slate-200">
                                <span className="font-black text-blue-800">Total Cost</span>
                                <span className="font-black text-blue-800">रू {s.totalCost.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            </div>
        </div>
    );
}