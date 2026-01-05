"use client";

import React, { useMemo } from 'react';
import { Fuel, Wrench, Edit, Trash2, Calendar } from 'lucide-react';
import type { FuelLog, ServiceRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type HistoryItem = (
  | { type: 'fuel'; data: FuelLog }
  | { type: 'service'; data: ServiceRecord }
) & { date: Date };

interface HistoryViewProps {
  fuelLogs: FuelLog[];
  serviceLogs: ServiceRecord[];
  onEditFuel: (log: FuelLog) => void;
  onDeleteFuel: (id: number) => void;
  onEditService: (service: ServiceRecord) => void;
  onDeleteService: (id: number) => void;
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
    const fuel: HistoryItem[] = fuelLogs.map(log => ({ type: 'fuel', data: log, date: new Date(log.date) }));
    const service: HistoryItem[] = serviceLogs.map(log => ({ type: 'service', data: log, date: new Date(log.date) }));

    return [...fuel, ...service].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [fuelLogs, serviceLogs]);

  return (
    <div className="pb-32 animate-in slide-in-from-right-8 fade-in duration-500">
      <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-primary">
        Vehicle History
      </h2>
      <div className="space-y-4">
        {combinedHistory.length === 0 && (
          <p className="text-center text-slate-500 text-xs py-10">No history records yet.</p>
        )}
        {combinedHistory.map((item, idx) => (
          <div key={`${item.type}-${item.data.id}`} style={{ animationDelay: `${idx * 50}ms` }} className="group animate-in slide-in-from-bottom-2 fill-mode-backwards">
            {item.type === 'fuel' ? (
              <FuelHistoryItem log={item.data} onEdit={onEditFuel} onDelete={onDeleteFuel} />
            ) : (
              <ServiceHistoryItem service={item.data} onEdit={onEditService} onDelete={onDeleteService} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// -- Fuel History Item Component --
const FuelHistoryItem = ({ log, onEdit, onDelete }: { log: FuelLog; onEdit: (log: FuelLog) => void; onDelete: (id: number) => void; }) => (
    <div className="bg-card border-l-4 border-primary p-4 rounded-r-2xl shadow-md relative overflow-hidden transition-all hover:shadow-lg hover:border-red-600">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-3 rounded-full">
                    <Fuel size={18} />
                </div>
                <div>
                    <p className="font-black text-slate-800 text-base">Fuel Refill</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5">
                        <Calendar size={12}/> {new Date(log.date).toLocaleDateString('en-CA')} at {log.odo.toLocaleString()} KM
                    </p>
                </div>
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

// -- Service History Item Component --
const ServiceHistoryItem = ({ service, onEdit, onDelete }: { service: ServiceRecord; onEdit: (service: ServiceRecord) => void; onDelete: (id: number) => void; }) => (
    <div className="bg-card border-l-4 border-blue-600 p-4 rounded-r-2xl shadow-md relative overflow-hidden transition-all hover:shadow-lg hover:border-blue-700">
        <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
                <div className="bg-blue-600/10 text-blue-600 p-3 rounded-full">
                    <Wrench size={18} />
                </div>
                <div>
                    <p className="font-black text-slate-800 text-base">{service.work}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5">
                        <Calendar size={12}/> {new Date(service.date).toLocaleDateString('en-CA')} at {service.odo.toLocaleString()} KM
                    </p>
                </div>
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
                    <span className="font-black text-blue-800">रू {service.totalCost.toLocaleString()}</span>
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
    