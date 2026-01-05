"use client";

import { MapPin } from "lucide-react";
import type { Trip, Stats, ServiceRecord, TripExpense } from "@/lib/types";
import { ActiveTrip } from "./active-trip";
import { TripPlanner } from "./trip-planner";
import { PastTrips } from "./past-trips";
import { PlannedTrip } from "./planned-trip";

interface TripViewProps {
  trips: Trip[];
  stats: Stats;
  services: ServiceRecord[];
  onCreateTrip: (newTripData: Omit<Trip, 'id' | 'status' | 'expenses' | 'end'>) => void;
  onStartTrip: (id: string, startOdo: number) => void;
  onEndTrip: (id: string, endOdo: number) => void;
  onDeleteTrip: (id: string) => void;
  onAddExpense: (tripId: string, item: string, cost: string) => void;
  onUpdateExpense: (tripId: string, updatedExpense: TripExpense) => void;
  onDeleteExpense: (tripId: string, expenseId: number) => void;
}

export function TripView({ 
  trips, 
  stats, 
  services,
  onCreateTrip,
  onStartTrip,
  onEndTrip,
  onDeleteTrip,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense
}: TripViewProps) {
  const activeTrip = trips.find(t => t.status === 'active');
  const plannedTrips = trips.filter(t => t.status === 'planned');
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
          lastOdo={stats.lastOdo}
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

      {plannedTrips.length > 0 && !activeTrip && (
        <div className="mt-8">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Planned Trips</h3>
            <div className="space-y-4">
                {plannedTrips.map(trip => (
                    <PlannedTrip 
                        key={trip.id} 
                        trip={trip} 
                        onStart={onStartTrip} 
                        onDelete={onDeleteTrip}
                        lastOdo={stats.lastOdo}
                    />
                ))}
            </div>
        </div>
      )}
      
      <PastTrips trips={pastTrips} onDeleteTrip={onDeleteTrip} />
    </div>
  );
}
