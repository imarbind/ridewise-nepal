"use client";

import { MapPin, Navigation } from 'lucide-react';
import type { Trip } from '@/lib/types';
import { differenceInDays } from 'date-fns';

interface UpcomingTripCardProps {
    trip: Trip;
}

export function UpcomingTripCard({ trip }: UpcomingTripCardProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(trip.start);
  startDate.setHours(0, 0, 0, 0);

  const daysToGo = differenceInDays(startDate, today);

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-3xl shadow-lg relative animate-in fade-in slide-in-from-bottom-4">
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-4 translate-x-4"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider opacity-80 mb-2">
            <Navigation size={16} />
            <span>Upcoming Trip</span>
        </div>
        <div className="flex justify-between items-end">
            <div>
                <h3 className="text-2xl font-black">{trip.destination}</h3>
                <p className="text-sm opacity-80 flex items-center gap-1.5 mt-1"><MapPin size={14}/> {trip.distance} km trip</p>
            </div>
            <div className="text-right">
                <p className="text-4xl font-black">{daysToGo}</p>
                <p className="text-xs font-bold opacity-80 -mt-1">{daysToGo === 1 ? 'Day' : 'Days'} To Go</p>
            </div>
        </div>
      </div>
    </div>
  );
}
