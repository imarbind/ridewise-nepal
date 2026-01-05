"use client";

import { MapPin } from "lucide-react";
import type { Trip, Stats, ServiceRecord, TripExpense } from "@/lib/types";
import { ActiveTrip } from "./active-trip";
import { TripPlanner } from "./trip-planner";
import { PastTrips } from "./past-trips";

interface TripViewProps {
  trips: Trip[];
  stats: Stats;
  services: ServiceRecord[];
  onCreateTrip: (newTripData: Omit<Trip, 'id' | 'status' | 'expenses'>) => void;
  onEndTrip: (id: number) => void;
  onDeleteTrip: (id: number) => void;
  onAddExpense: (tripId: number, item: string, cost: string) => void;
  onUpdateExpense: (tripId: number, updatedExpense: TripExpense) => void;
  onDeleteExpense: (tripId: number, expenseId: number) => void;
}

export function TripView({ 
  trips, 
  stats, 
  services,
  onCreateTrip,
  onEndTrip,
  onDeleteTrip,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense
}: TripViewProps) {
  const activeTrip = trips.find(t => t.status === 'active');
  const pastTrips = trips.filter(t => t.status === 'completed');

  return (
    <div className="pb-32 animate-in slide-in-from-right-8 fade-in duration-500">
      {activeTrip ? (
        <ActiveTrip 
          trip={activeTrip} 
          onEndTrip={onEndTrip}
          onDeleteTrip={onDeleteTrip}
          onAddExpense={onAddExpense}
          onUpdateExpense={onUpdateExpense}
          onDeleteExpense={onDeleteExpense}
        />
      ) : (
        <>
          <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter text-slate-800 flex items-center gap-2">
            <MapPin className="text-blue-600" /> Plan Trip
          </h2>
          <TripPlanner 
            onCreateTrip={onCreateTrip} 
            stats={stats}
            services={services}
          />
        </>
      )}
      <PastTrips trips={pastTrips} onDeleteTrip={onDeleteTrip} />
    </div>
  );
}
