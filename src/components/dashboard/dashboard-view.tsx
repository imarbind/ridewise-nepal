

"use client";

import { FileText, Edit, Fuel, Wrench, CircleDollarSign, ListChecks, TrendingUp, History, Award, Thermometer, TrendingDown } from "lucide-react";
import type { Stats, Reminder, EngineCc, BikeDetails, Trip, NextServiceInfo } from "@/lib/types";
import { StatCard } from "./stat-card";
import { MaintenanceStatus } from "./maintenance-status";
import { Button } from "../ui/button";
import { useState } from "react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ConditionRatingCard } from "./condition-rating-card";
import { UpcomingTripCard } from "./upcoming-trip-card";
import { NextServiceBar } from "./next-service-bar";
import { Card, CardContent } from "../ui/card";

interface DashboardViewProps {
  stats: Stats;
  activeReminders: Reminder[];
  onNavigateDocs: () => void;
  bikeDetails: BikeDetails;
  setBikeDetails: (details: BikeDetails) => void;
  upcomingTrip: Trip | null;
  nextServiceInfo: NextServiceInfo;
}

export function DashboardView({ stats, activeReminders, onNavigateDocs, bikeDetails, setBikeDetails, upcomingTrip, nextServiceInfo }: DashboardViewProps) {
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
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter italic drop-shadow-sm flex items-center gap-2">
          <span className="text-primary">RYD</span>
          <span className="text-foreground">IO</span>
        </h1>
        <Button onClick={onNavigateDocs} variant="outline" size="icon" className="bg-card border-slate-200 w-12 h-12 rounded-2xl text-slate-500 hover:text-primary hover:border-primary/50 hover:shadow-primary/10 transition-all shadow-lg active:scale-95">
          <FileText size={20} />
        </Button>
      </div>

      <div className="space-y-4 mb-8">
        {upcomingTrip && <UpcomingTripCard trip={upcomingTrip} />}
        <div className="group [perspective:1000px]">
          <div className="relative bg-gradient-to-br from-primary via-red-800 to-accent rounded-[2.5rem] p-8 shadow-2xl border-t border-white/20 transition-transform duration-500 transform group-hover:[transform:rotateX(2deg)] overflow-hidden">
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-blue-500/30 rounded-full blur-2xl"></div>

            <div className="relative z-10">
              {isEditingBike ? (
                <div className="space-y-3 mb-6">
                  <div className="grid grid-cols-2 gap-3">
                    <Input 
                      placeholder="Make (e.g. Bajaj)"
                      value={editableBikeDetails.make} 
                      onChange={(e) => setEditableBikeDetails(prev => ({...prev, make: e.target.value}))} 
                      className="bg-white/10 text-white placeholder:text-white/50 border-white/20 font-medium"
                    />
                    <Input 
                      placeholder="Model (e.g. Pulsar 220F)"
                      value={editableBikeDetails.model} 
                      onChange={(e) => setEditableBikeDetails(prev => ({...prev, model: e.target.value}))} 
                      className="bg-white/10 text-white placeholder:text-white/50 border-white/20 font-medium"
                    />
                  </div>
                  <Input 
                    placeholder="Bike Nickname"
                    value={editableBikeDetails.name} 
                    onChange={(e) => setEditableBikeDetails(prev => ({...prev, name: e.target.value}))} 
                    className="bg-white/10 text-white placeholder:text-white/50 border-white/20 font-bold"
                  />
                  <Input 
                    placeholder="Bike Number (e.g. BA 01-001 PA)"
                    value={editableBikeDetails.number} 
                    onChange={(e) => setEditableBikeDetails(prev => ({...prev, number: e.target.value}))} 
                    className="bg-white/10 text-white placeholder:text-white/50 border-white/20 font-medium"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input 
                      placeholder="Year"
                      type="number"
                      value={editableBikeDetails.year} 
                      onChange={(e) => setEditableBikeDetails(prev => ({...prev, year: e.target.value}))} 
                      className="bg-white/10 text-white placeholder:text-white/50 border-white/20 font-medium"
                    />
                    <Select value={editableBikeDetails.engineCc} onValueChange={(value: EngineCc) => setEditableBikeDetails(prev => ({...prev, engineCc: value}))}>
                      <SelectTrigger className="w-full bg-white/10 text-white h-auto text-sm font-bold border-white/20 rounded-lg">
                        <SelectValue placeholder="Engine CC" />
                      </SelectTrigger>
                      <SelectContent>
                        {ccOptions.map(cc => <SelectItem key={cc} value={cc} className="text-sm">{cc} cc</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="grid grid-cols-2 gap-3">
                     <Input 
                      placeholder="Purchase Price"
                      type="number"
                      value={editableBikeDetails.purchasePrice} 
                      onChange={(e) => setEditableBikeDetails(prev => ({...prev, purchasePrice: Number(e.target.value)}))} 
                      className="bg-white/10 text-white placeholder:text-white/50 border-white/20 font-medium"
                    />
                    <Input 
                      placeholder="Purchase Date"
                      type="date"
                      value={editableBikeDetails.purchaseDate} 
                      onChange={(e) => setEditableBikeDetails(prev => ({...prev, purchaseDate: e.target.value}))} 
                      className="bg-white/10 text-white placeholder:text-white/50 border-white/20 font-medium"
                    />
                  </div>
                   <Input 
                      placeholder="Fuel Tank Capacity (Liters)"
                      type="number"
                      value={editableBikeDetails.fuelTankCapacity} 
                      onChange={(e) => setEditableBikeDetails(prev => ({...prev, fuelTankCapacity: Number(e.target.value)}))} 
                      className="bg-white/10 text-white placeholder:text-white/50 border-white/20 font-medium"
                    />
                  <Button onClick={handleBikeDetailsSave} size="sm" className="w-full bg-white/90 text-slate-800 hover:bg-white">Save Details</Button>
                </div>
              ) : (
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{bikeDetails.name}</h2>
                    <p className="text-xs font-mono text-white/70 bg-black/20 inline-block px-2 py-0.5 rounded mt-1">{bikeDetails.number}</p>
                  </div>
                  <Button onClick={() => { setIsEditingBike(true); setEditableBikeDetails(bikeDetails); }} variant="ghost" size="icon" className="w-8 h-8 text-white/70 hover:bg-white/10">
                    <Edit size={16} />
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-2 items-end">
                  <div>
                      <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">Odometer</p>
                      <h2 className="text-5xl font-black text-white tracking-tight drop-shadow-xl">
                          {stats.lastOdo.toLocaleString()}
                          <span className="text-lg font-bold ml-2 opacity-50">KM</span>
                      </h2>
                  </div>
                  <div className="space-y-2 text-right">
                      <div>
                          <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Avg Efficiency</p>
                          <p className="text-xl font-black text-white">{stats.avgMileage} <span className="text-xs font-normal opacity-70">km/l</span></p>
                      </div>
                      <div>
                          <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Daily Average</p>
                          <p className="text-xl font-black text-white">{stats.dailyAvg} <span className="text-xs font-normal opacity-70">km/day</span></p>
                      </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 space-y-4">
          <ConditionRatingCard cpkData={stats.cpk} />
          <NextServiceBar serviceInfo={nextServiceInfo} />
        </div>
      </div>
      
      <div className="space-y-4 mb-8">
        {/* TOP SECTION */}
        <div className="flex gap-4">
          {/* Left Column */}
          <div className="w-[45%] flex flex-col gap-4">
            <StatCard isCompact label="Last km/l" value={stats.lastMileage} sub="km/l" icon={TrendingUp} iconColorClass="bg-blue-500" />
            <StatCard isCompact label="Best km/l" value={stats.bestMileage} sub="km/l" icon={Award} iconColorClass="bg-yellow-500"/>
            <StatCard isCompact label="Avg km/l" value={stats.avgMileage} sub="km/l" icon={TrendingDown} iconColorClass="bg-orange-500"/>
          </div>
          {/* Right Column */}
          <div className="w-[55%]">
            <Card className="h-full rounded-2xl shadow-xl border-slate-200 bg-card/90">
              <CardContent className="p-4 flex flex-col justify-center items-center text-center h-full">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Total Cost</p>
                <p className="text-4xl font-black text-primary tracking-tighter">रू {stats.totalOwnership.toLocaleString()}</p>
                <p className="text-xs text-slate-400">Fuel + Service combined</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* MIDDLE SECTION */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Fuel Spent" value={`रू ${stats.totalFuelCost.toLocaleString()}`} icon={Fuel} iconColorClass="bg-green-600"/>
          <StatCard label="Service Cost" value={`रू ${stats.totalServiceCost.toLocaleString()}`} icon={Wrench} iconColorClass="bg-red-500"/>
          <StatCard label="Total Fuel" value={`${stats.totalFuelLiters.toFixed(1)}`} sub="Liters" icon={Thermometer} iconColorClass="bg-purple-500"/>
        </div>
        
        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-3 gap-4">
            <StatCard isCompact label="Fuel Logs" value={`${stats.totalFuelLogs}`} icon={History} iconColorClass="bg-sky-500" />
            <StatCard isCompact label="Services" value={`${stats.totalServices}`} icon={Wrench} iconColorClass="bg-pink-500"/>
            <StatCard isCompact label="Parts/Oil" value={`${stats.totalPartsChanged}/${stats.totalOilChanges}`} icon={ListChecks} iconColorClass="bg-indigo-500"/>
        </div>
      </div>

      <MaintenanceStatus activeReminders={activeReminders} />
    </div>
  );
}
