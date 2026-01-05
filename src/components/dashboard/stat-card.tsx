"use client";

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  color: string;
  delay: number;
}

export const StatCard = ({ label, value, sub, icon: Icon, color, delay }: StatCardProps) => (
  <div 
    className="relative group [perspective:1000px] animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`
      bg-card/90 backdrop-blur-md border-b-4 border-r-4 border-slate-200 
      p-4 rounded-2xl shadow-xl transition-all duration-300 transform 
      group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:border-blue-200/50
      relative overflow-hidden
    `}>
      <div className={cn("absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-10 blur-xl", color)} />
      
      <div className={cn("p-2 rounded-xl inline-block mb-3 shadow-lg text-white", color)}>
        <Icon size={16} />
      </div>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight z-10 relative">{label}</p>
      <h3 className="text-xl font-black text-slate-800 z-10 relative tracking-tight">{value}</h3>
      {sub && <p className="text-[10px] text-slate-400 mt-1 z-10 relative">{sub}</p>}
    </div>
  </div>
);
