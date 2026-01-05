"use client";

import React, { useMemo } from 'react';
import { Fuel, Wrench, Edit, Trash2, Calendar, CornerDownRight } from 'lucide-react';
import type { FuelLog, ServiceRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type HistoryItem = (
  | { type: 'fuel'; data: FuelLog }
  | { type: 'service'; data: ServiceRecord }
) & { date: Date; odo: number };

interface HistoryViewProps {
  fuelLogs: FuelLog[];
  serviceLogs: ServiceRecord[];
  onEditFuel: (log: FuelLog) => void;
  onDeleteFuel: (id: string) => void;
  onEditService: (service: ServiceRecord) => void;
  onDeleteService: (id: string) => void;
}

export function HistoryView({
  fuelLogs,
  serviceLogs,
  onEditFuel,
  onDeleteFuel,
  onEditService,
  onDeleteService,
}: HistoryViewProps) {
  const combinedHistory = useMemo(() => {
    const fuel: HistoryItem[] = fuelLogs.map(log => ({ type: 'fuel', data: log, date: new Date(log.date), odo: log.odo }));
    const service: HistoryItem[] = serviceLogs.map(log => ({ type: 'service', data: log, date: new Date(log.date), odo: log.odo }));

    return [...fuel, ...service].sort((a, b) => b.odo - a.odo);
  }, [fuelLogs, serviceLogs]);

  return (
    <div className="pb-32 animate-in slide-in-from-right-8 fade-in duration-500">
      <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-primary">
        Vehicle Timeline
      </h2>
      <div className="relative">
         {combinedHistory.length > 1 && 
            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200"></div>
         }

        {combinedHistory.length === 0 && (
          <div className="text-center text-slate-500 text-xs py-10 bg-slate-50/50 rounded-2xl border border-slate-200 border-dashed">No history records yet.</div>
        )}
        
        <div className="space-y-6">
          {combinedHistory.map((item, idx) => (
            <div key={`${item.type}-${item.data.id}`} style={{ animationDelay: `${idx * 50}ms` }} className="group relative flex items-start gap-4 animate-in slide-in-from-bottom-4 fill-mode-backwards">
              <div className="relative z-10 flex flex-col items-center">
                <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-background",
                    item.type === 'fuel' ? 'bg-green-600' : 'bg-primary'
                )}>
                  {item.type === 'fuel' ? <Fuel size={20} /> : <Wrench size={20} />}
                </div>
                <p className="text-[9px] font-black text-slate-500 text-center mt-1.5 bg-slate-100 px-1.5 py-0.5 rounded">{item.odo.toLocaleString()} KM</p>
              </div>

              <div className="flex-1 pt-0.5">
                  {item.type === 'fuel' ? (
                    <FuelHistoryItem log={item.data} onEdit={onEditFuel} onDelete={onDeleteFuel} />
                  ) : (
                    <ServiceHistoryItem service={item.data} onEdit={onEditService} onDelete={onDeleteService} />
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const FuelHistoryItem = ({ log, onEdit, onDelete }: { log: FuelLog; onEdit: (log: FuelLog) => void; onDelete: (id: string) => void; }) => (
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
                <p className="text-[10px] text-slate-500 font-bold uppercase">Cost</p>
                <p className="font-black text-slate-800 text-sm">रू {log.amount.toLocaleString()}</p>
            </div>
            <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Liters</p>
                <p className="font-black text-slate-800 text-sm">{log.liters.toFixed(2)}L</p>
            </div>
            <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Rate</p>
                <p className="font-black text-slate-800 text-sm">@{log.price.toFixed(2)}</p>
            </div>
        </div>
    </div>
);

const ServiceHistoryItem = ({ service, onEdit, onDelete }: { service: ServiceRecord; onEdit: (service: ServiceRecord) => void; onDelete: (id: string) => void; }) => (
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
            {service.parts.map((p, idx) => (
                <div key={idx} className="flex justify-between text-xs py-1 border-b border-slate-200 last:border-0">
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
);
