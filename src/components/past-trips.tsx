"use client";

import { MapPin, Trash2 } from "lucide-react";
import type { Trip } from "@/lib/types";
import { Button } from "../ui/button";

interface PastTripsProps {
    trips: Trip[];
    onDeleteTrip: (id: number) => void;
}

export function PastTrips({ trips, onDeleteTrip }: PastTripsProps) {

    if (trips.length === 0) return null;

    return (
        <div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 mt-8">Past Trips History</h3>
            <div className="space-y-3">
                {trips.map(t => (
                    <div key={t.id} className="bg-card p-4 rounded-2xl border border-slate-200 hover:border-blue-300 transition-colors shadow-sm group">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className="font-black text-lg text-slate-800">{t.destination}</span>
                                <div className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase inline-block ml-2">Ended</div>
                            </div>
                            <Button onClick={() => onDeleteTrip(t.id)} variant="ghost" size="icon" className="w-8 h-8 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={16} />
                            </Button>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 flex items-center gap-1"><MapPin size={12}/> {t.distance} km</span>
                            <span className="font-black text-slate-800 bg-slate-50 px-2 py-1 rounded">
                                Total: रू {t.expenses.reduce((s, e) => s + parseFloat(String(e.cost)), 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
