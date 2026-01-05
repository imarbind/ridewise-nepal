"use client";

import React, { useState } from 'react';
import { MapPin, Trash2, Wallet } from 'lucide-react';
import type { Trip } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ActiveTripProps {
  trip: Trip;
  onEndTrip: (id: number) => void;
  onAddExpense: (tripId: number, item: string, cost: string) => void;
}

export function ActiveTrip({ trip, onEndTrip, onAddExpense }: ActiveTripProps) {
  const [expenseItem, setExpenseItem] = useState('');
  const [expenseCost, setExpenseCost] = useState('');
  
  const today = new Date();
  today.setHours(0,0,0,0);
  const start = new Date(trip.start);
  start.setHours(0,0,0,0);
  const daysDiff = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const tripTotal = trip.expenses.reduce((s, e) => s + parseFloat(String(e.cost)), 0);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseItem || !expenseCost) return;
    onAddExpense(trip.id, expenseItem, expenseCost);
    setExpenseItem('');
    setExpenseCost('');
  }

  return (
    <div>
      <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-[2.5rem] p-8 text-white mb-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-blue-300 font-bold uppercase text-[10px] tracking-widest mb-1">Current Destination</p>
            <h2 className="text-3xl font-black">{trip.destination}</h2>
            <p className="text-sm opacity-70 mt-1 flex items-center gap-2"><MapPin size={14}/> {trip.distance} km trip</p>
          </div>
          <div className="text-right bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            <p className="text-2xl font-black">{daysDiff >= 0 ? daysDiff : Math.abs(daysDiff)}</p>
            <p className="text-[9px] uppercase font-bold opacity-70">{daysDiff >= 0 ? 'Days To Go' : 'Days In'}</p>
          </div>
        </div>
        <Button onClick={() => onEndTrip(trip.id)} className="mt-6 bg-primary/20 hover:bg-primary border border-primary/50 text-red-200 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all w-full h-auto">
          End Trip
        </Button>
      </div>

      <div className="mb-6">
        <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-tight">
          <Wallet size={18} className="text-green-600"/> Trip Wallet
        </h3>
        
        <form onSubmit={handleAddExpense} className="bg-card p-4 rounded-2xl border border-slate-200 shadow-sm mb-4">
          <div className="flex gap-2 mb-2">
            <Input 
              value={expenseItem} 
              onChange={e => setExpenseItem(e.target.value)}
              placeholder="Expense (e.g. Lunch)" 
              className="flex-1 bg-slate-50 p-3 h-auto rounded-xl border-slate-200 font-bold text-sm outline-none focus:border-blue-500"
            />
            <Input 
              type="number"
              value={expenseCost} 
              onChange={e => setExpenseCost(e.target.value)}
              placeholder="Cost" 
              className="w-24 bg-slate-50 p-3 h-auto rounded-xl border-slate-200 font-bold text-sm outline-none focus:border-blue-500"
            />
          </div>
          <Button type="submit" className="w-full bg-slate-800 text-white p-3 h-auto rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors">
            + Add Expense
          </Button>
          <p className="text-[10px] text-slate-400 mt-2 italic text-center">Note: Fuel & Service logs added now will auto-sync here.</p>
        </form>

        <div className="space-y-3">
          <div className="flex justify-between items-center px-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Expenses</span>
              <span className="text-xs font-black text-slate-800">Total: रू {tripTotal.toLocaleString()}</span>
          </div>
          {trip.expenses.map(e => (
            <div key={e.id} className="bg-card p-3 rounded-xl border border-slate-100 flex justify-between items-center animate-in slide-in-from-bottom-2">
              <span className="font-bold text-slate-700 text-sm">{e.item}</span>
              <span className="font-black text-slate-900">रू {e.cost.toLocaleString()}</span>
            </div>
          ))}
          {trip.expenses.length === 0 && <p className="text-center text-xs text-slate-400 py-4 italic">No expenses logged yet.</p>}
        </div>
      </div>
    </div>
  );
}
