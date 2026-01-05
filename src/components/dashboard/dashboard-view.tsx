"use client";

import { FileText, Mountain, TrendingUp, Edit, Fuel, Wrench, CircleDollarSign, ListChecks, Droplets, Info, CalendarDays } from "lucide-react";
import type { Stats, Reminder, EngineCc, BikeDetails } from "@/lib/types";
import { StatCard } from "./stat-card";
import { MaintenanceStatus } from "./maintenance-status";
import { Button } from "../ui/button";
import { useState } from "react";
import { Input } from "../ui/input";
import { ExpenseChart, ExpenseChartData } from "./expense-chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ConditionRatingCard } from "./condition-rating-card";

interface DashboardViewProps {
  stats: Stats;
  activeReminders: Reminder[];
  onNavigateDocs: () => void;
  bikeDetails: BikeDetails;
  setBikeDetails: (details: BikeDetails) => void;
  expenseChartData: ExpenseChartData[];
}

export function DashboardView({ stats, activeReminders, onNavigateDocs, bikeDetails, setBikeDetails, expenseChartData }: DashboardViewProps) {
  const [isEditingBike, setIsEditingBike] = useState(false);
  const [editableBikeDetails, setEditableBikeDetails] = useState(bikeDetails);

  const handleBikeDetailsSave = () => {
    setBikeDetails(editableBikeDetails);
    setIsEditingBike(false);
  };
  
  const ccOptions: EngineCc[] = ['50-125', '126-250', '251-500', '501-1000', '>1000'];

  return (
    <div className="pb-32 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-4 flex justify-between items-start z-10 relative">
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

       <div className="mb-8 p-4 bg-card/50 rounded-2xl border border-slate-100 backdrop-blur-sm">
        {isEditingBike ? (
          <div className="space-y-3">
             <div className="grid grid-cols-2 gap-3">
              <Input 
                placeholder="Make (e.g. Bajaj)"
                value={editableBikeDetails.make} 
                onChange={(e) => setEditableBikeDetails(prev => ({...prev, make: e.target.value}))} 
                className="bg-slate-50 font-medium"
              />
              <Input 
                placeholder="Model (e.g. Pulsar 220F)"
                value={editableBikeDetails.model} 
                onChange={(e) => setEditableBikeDetails(prev => ({...prev, model: e.target.value}))} 
                className="bg-slate-50 font-medium"
              />
             </div>
             <Input 
              placeholder="Bike Nickname"
              value={editableBikeDetails.name} 
              onChange={(e) => setEditableBikeDetails(prev => ({...prev, name: e.target.value}))} 
              className="bg-slate-50 font-bold"
            />
            <Input 
              placeholder="Bike Number (e.g. BA 01-001 PA)"
              value={editableBikeDetails.number} 
              onChange={(e) => setEditableBikeDetails(prev => ({...prev, number: e.target.value}))} 
              className="bg-slate-50 font-medium"
            />
            <div className="grid grid-cols-2 gap-3">
               <Input 
                placeholder="Year"
                type="number"
                value={editableBikeDetails.year} 
                onChange={(e) => setEditableBikeDetails(prev => ({...prev, year: e.target.value}))} 
                className="bg-slate-50 font-medium"
              />
              <Select value={editableBikeDetails.engineCc} onValueChange={(value: EngineCc) => setEditableBikeDetails(prev => ({...prev, engineCc: value}))}>
                <SelectTrigger className="w-full bg-slate-50 h-auto text-sm font-bold border-slate-200 rounded-lg">
                  <SelectValue placeholder="Engine CC" />
                </SelectTrigger>
                <SelectContent>
                  {ccOptions.map(cc => <SelectItem key={cc} value={cc} className="text-sm">{cc} cc</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleBikeDetailsSave} size="sm" className="w-full">Save Details</Button>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-700">{bikeDetails.name}</h2>
              <p className="text-xs font-mono text-slate-400 bg-slate-100 inline-block px-2 py-0.5 rounded mt-1">{bikeDetails.number}</p>
            </div>
            <Button onClick={() => { setIsEditingBike(true); setEditableBikeDetails(bikeDetails); }} variant="ghost" size="icon" className="w-8 h-8 text-slate-400">
              <Edit size={16} />
            </Button>
          </div>
        )}
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
              <div className="space-y-2 text-right">
                <div>
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Efficiency</p>
                  <p className="text-xl font-black text-white">{stats.avgMileage} <span className="text-xs font-normal opacity-70">km/l</span></p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Daily Average</p>
                  <p className="text-xl font-black text-white">{stats.dailyAvg} <span className="text-xs font-normal opacity-70">km/day</span></p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">Total Distance</p>
              <h2 className="text-5xl font-black text-white tracking-tight drop-shadow-xl">
                {stats.lastOdo.toLocaleString()}
                <span className="text-lg font-bold ml-2 opacity-50">KM</span>
              </h2>
            </div>
          </div>
        </div>
      </div>
      
      <ConditionRatingCard cpkData={stats.cpk} />

      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard delay={100} label="Fuel Spent" value={`रू ${stats.totalFuelCost.toLocaleString()}`} icon={Fuel} color="bg-green-600" />
        <StatCard delay={200} label="Service Cost" value={`रू ${stats.totalServiceCost.toLocaleString()}`} icon={Wrench} color="bg-primary" />
        <StatCard delay={300} label="Oil Changes" value={`${stats.totalOilChanges}`} icon={Droplets} color="bg-orange-500" />
        <StatCard delay={400} label="Parts Changed" value={`${stats.totalPartsChanged}`} icon={ListChecks} color="bg-green-600" />
        <StatCard delay={500} label="Total Cost" value={`रू ${stats.totalOwnership.toLocaleString()}`} icon={CircleDollarSign} color="bg-red-800" colSpan="col-span-2" />
      </div>

      <ExpenseChart data={expenseChartData} />

      <MaintenanceStatus activeReminders={activeReminders} />
    </div>
  );
}
