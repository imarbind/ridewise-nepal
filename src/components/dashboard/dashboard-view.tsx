"use client";

import { FileText, Mountain, TrendingUp } from "lucide-react";
import type { Stats, Reminder } from "@/lib/types";
import { StatCard } from "./stat-card";
import { MaintenanceStatus } from "./maintenance-status";
import { Button } from "../ui/button";
import { Fuel, Wrench, History, CircleDollarSign } from 'lucide-react';

interface DashboardViewProps {
  stats: Stats;
  activeReminders: Reminder[];
  onNavigateDocs: () => void;
}

export function DashboardView({ stats, activeReminders, onNavigateDocs }: DashboardViewProps) {
  return (
    <div className="pb-32 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-8 flex justify-between items-start z-10 relative">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter italic drop-shadow-sm flex items-center gap-2">
            <span className="text-primary">RIDE</span>
            <span className="text-foreground">LOG</span>
            <span className="text-blue-600 text-sm border border-blue-600 px-2 py-0.5 rounded-md ml-1">NEPAL</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 pl-1">Vehicle Expense Tracker</p>
        </div>
        <Button onClick={onNavigateDocs} variant="outline" size="icon" className="bg-card border-slate-200 w-12 h-12 rounded-2xl text-slate-500 hover:text-primary hover:border-primary/50 hover:shadow-primary/10 transition-all shadow-lg active:scale-95">
          <FileText size={20} />
        </Button>
      </div>

      <div className="group relative mb-8 [perspective:1000px]">
        <div className="absolute inset-0 bg-primary rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
        <div className="relative bg-gradient-to-br from-red-700 via-red-800 to-blue-900 rounded-[2.5rem] p-8 shadow-2xl border-t border-white/20 transition-transform duration-500 transform group-hover:[transform:rotateX(2deg)] overflow-hidden">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-blue-500/30 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div className="bg-black/20 backdrop-blur-md p-2 rounded-xl border border-white/10 inline-block mb-2">
                <Mountain size={20} className="text-white/90" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Efficiency</p>
                <p className="text-xl font-black text-white">{stats.avgMileage} <span className="text-xs font-normal opacity-70">km/l</span></p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">Total Distance</p>
              <h2 className="text-5xl font-black text-white tracking-tight drop-shadow-xl">
                {stats.lastOdo.toLocaleString()}
                <span className="text-lg font-bold ml-2 opacity-50">KM</span>
              </h2>
            </div>
            <div className="mt-6 flex gap-3">
              <div className="flex-1 bg-black/20 backdrop-blur-sm rounded-xl p-2 border border-white/10 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${stats.efficiencyStatus === 'Excellent' ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}></div>
                <span className="text-xs font-bold text-white/90">{stats.efficiencyStatus} Condition</span>
              </div>
               <div className="flex-1 bg-black/20 backdrop-blur-sm rounded-xl p-2 border border-white/10 flex items-center gap-2">
                <span className="text-xs font-bold text-white/90">{stats.dailyAvg} km/day</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard delay={100} label="Fuel Spent" value={`रू ${stats.totalFuelCost.toLocaleString()}`} icon={Fuel} color="bg-primary" />
        <StatCard delay={200} label="Service" value={`रू ${stats.totalServiceCost.toLocaleString()}`} icon={Wrench} color="bg-blue-600" />
        <StatCard delay={300} label="History" value={stats.logsCount.toLocaleString()} icon={History} color="bg-slate-700" />
        <StatCard delay={400} label="Total Cost" value={`रू ${stats.totalOwnership.toLocaleString()}`} icon={CircleDollarSign} color="bg-red-800" />
      </div>

      <MaintenanceStatus activeReminders={activeReminders} />
    </div>
  );
}
