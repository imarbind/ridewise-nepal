
"use client";

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  iconColorClass?: string;
  delay?: number;
  colSpan?: string;
  isCompact?: boolean;
}

export const StatCard = ({ label, value, sub, icon: Icon, iconColorClass = 'bg-primary', delay = 0, colSpan = 'col-span-1', isCompact = false }: StatCardProps) => (
  <div 
    className={cn(
        "relative group [perspective:1000px] animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards",
        colSpan
    )}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={cn(`
      bg-card/90 backdrop-blur-md border-b-4 border-r-4 border-slate-200 
      rounded-2xl shadow-xl transition-all duration-300 transform 
      group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:border-blue-200/50
      relative overflow-hidden h-full flex flex-col justify-between`,
      isCompact ? 'p-3' : 'p-4'
    )}>
      
      {isCompact ? (
         <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight z-10 relative">{label}</p>
              <h3 className="text-xl font-black text-slate-800 z-10 relative tracking-tight">
                  {value}
                  {sub && <span className="text-xs font-bold text-slate-400 ml-1">{sub}</span>}
              </h3>
            </div>
            <div className={cn("p-2 rounded-xl inline-block shadow-lg text-white", iconColorClass)}>
              <Icon size={16} />
            </div>
        </div>
      ) : (
        <>
          <div>
            <div className={cn("p-2 rounded-xl inline-block mb-2 shadow-lg text-white", iconColorClass)}>
              <Icon size={16} />
            </div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight z-10 relative">{label}</p>
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-800 z-10 relative tracking-tight">
                {value}
                {sub && <span className="text-xs font-bold text-slate-400 ml-1">{sub}</span>}
            </h3>
          </div>
        </>
      )}
    </div>
  </div>
);
