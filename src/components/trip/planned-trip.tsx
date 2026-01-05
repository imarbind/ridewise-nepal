"use client";

import { MapPin, Calendar, Trash2, Play } from "lucide-react";
import { format, differenceInDays } from 'date-fns';
import type { Trip } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface PlannedTripProps {
  trip: Trip;
  onStart: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PlannedTrip({ trip, onStart, onDelete }: PlannedTripProps) {
  const startDate = new Date(trip.start);
  const now = new Date();
  const daysToGo = differenceInDays(startDate, now);

  return (
    <div className="bg-card p-4 rounded-3xl border border-slate-200 shadow-lg group">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-black text-slate-800 text-lg">{trip.destination}</h4>
          <div className="text-xs text-slate-500 flex items-center gap-4 mt-1">
            <span className="flex items-center gap-1.5"><MapPin size={12}/> {trip.distance} km</span>
            <span className="flex items-center gap-1.5"><Calendar size={12}/> {format(startDate, "MMM d, yyyy, h:mm a")}</span>
          </div>
        </div>
        {daysToGo >= 0 && (
          <div className="text-right">
              <p className="text-2xl font-black text-blue-600">{daysToGo}</p>
              <p className="text-[9px] uppercase font-bold text-slate-500 -mt-1">{daysToGo === 1 ? 'Day' : 'Days'} To Go</p>
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={() => onStart(trip.id)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-10 rounded-xl text-xs flex items-center gap-2">
            <Play size={14}/> Start Trip Now
        </Button>
        <Button onClick={() => onDelete(trip.id)} variant="ghost" className="w-full bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-500 font-bold h-10 rounded-xl text-xs flex items-center gap-2">
            <Trash2 size={14}/> Delete
        </Button>
      </div>
    </div>
  );
}
