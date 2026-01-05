"use client";

import { MapPin } from "lucide-react";
import type { Trip, Stats, ServiceRecord } from "@/lib/types";
import { ActiveTrip } from "./active-trip";
import { TripPlanner } from "./trip-planner";
import { PastTrips } from "./past-trips";

interface TripViewProps {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  stats: Stats;
  services: ServiceRecord[];
}

export function TripView({ trips, setTrips, stats, services }: TripViewProps) {
  const activeTrip = trips.find(t => t.status === 'active');
  const pastTrips = trips.filter(t => t.status === 'completed');

  const createTrip = (newTripData: Omit<Trip, 'id' | 'status' | 'expenses'>) => {
    const newTripObj: Trip = {
      id: Date.now(),
      ...newTripData,
      status: 'active',
      expenses: []
    };
    setTrips(prev => [newTripObj, ...prev]);
  };

  const endTrip = (id: number) => {
    if(confirm("End this trip? This will move it to history.")) {
      setTrips(trips.map(t => t.id === id ? { ...t, status: 'completed' } : t));
    }
  };

  const deleteTrip = (id: number) => {
    if (confirm("Are you sure you want to delete this trip? This action cannot be undone.")) {
      setTrips(prev => prev.filter(t => t.id !== id));
    }
  };

  const addTripExpense = (tripId: number, item: string, cost: string) => {
    if (!item || !cost) return;
    const updatedTrips = trips.map((t) => {
      if (t.id === tripId) { 
        return { ...t, expenses: [{ id: Date.now(), item, cost: parseFloat(cost) }, ...t.expenses] };
      }
      return t;
    });
    setTrips(updatedTrips);
  };
  
  return (
    <div className="pb-32 animate-in slide-in-from-right-8 fade-in duration-500">
      {activeTrip ? (
        <ActiveTrip 
          trip={activeTrip} 
          onEndTrip={endTrip} 
          onAddExpense={addTripExpense}
        />
      ) : (
        <>
          <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter text-slate-800 flex items-center gap-2">
            <MapPin className="text-blue-600" /> Plan Trip
          </h2>
          <TripPlanner 
            onCreateTrip={createTrip} 
            stats={stats}
            services={services}
          />
        </>
      )}
      <PastTrips trips={pastTrips} onDeleteTrip={deleteTrip} />
    </div>
  );
}
