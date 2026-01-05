"use client";

import React, { useState } from 'react';
import { MapPin, Trash2, Wallet, Edit, X } from 'lucide-react';
import type { Trip, TripExpense } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ActiveTripProps {
  trip: Trip;
  onEndTrip: (id: number) => void;
  onDeleteTrip: (id: number) => void;
  onAddExpense: (tripId: number, item: string, cost: string) => void;
  onUpdateExpense: (tripId: number, expense: TripExpense) => void;
  onDeleteExpense: (tripId: number, expenseId: number) => void;
}

export function ActiveTrip({ trip, onEndTrip, onDeleteTrip, onAddExpense, onUpdateExpense, onDeleteExpense }: ActiveTripProps) {
  const [expenseItem, setExpenseItem] = useState('');
  const [expenseCost, setExpenseCost] = useState('');
  const [editingExpense, setEditingExpense] = useState<TripExpense | null>(null);
  
  const today = new Date();
  today.setHours(0,0,0,0);
  const start = new Date(trip.start);
  start.setHours(0,0,0,0);
  const daysDiff = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const tripTotal = trip.expenses.reduce((s, e) => s + parseFloat(String(e.cost)), 0);

  const canAddExpense = daysDiff >= 0;

  const handleAddOrUpdateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExpense) {
      if (!expenseItem || !expenseCost) return;
      onUpdateExpense(trip.id, { ...editingExpense, item: expenseItem, cost: parseFloat(expenseCost) });
      setEditingExpense(null);
    } else {
      if (!expenseItem || !expenseCost) return;
      onAddExpense(trip.id, expenseItem, expenseCost);
    }
    setExpenseItem('');
    setExpenseCost('');
  }

  const handleEditClick = (expense: TripExpense) => {
    setEditingExpense(expense);
    setExpenseItem(expense.item);
    setExpenseCost(String(expense.cost));
  }

  const handleCancelEdit = () => {
    setEditingExpense(null);
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
            <p className="text-2xl font-black">{daysDiff < 0 ? Math.abs(daysDiff) : daysDiff}</p>
            <p className="text-[9px] uppercase font-bold opacity-70">{daysDiff < 0 ? 'Days To Go' : 'Days In'}</p>
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <Button onClick={() => onEndTrip(trip.id)} className="bg-primary/20 hover:bg-primary border border-primary/50 text-red-200 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all w-full h-auto">
            End Trip
          </Button>
          <Button onClick={() => onDeleteTrip(trip.id)} variant="destructive" size="icon" className="w-12 h-auto rounded-xl bg-red-900/50 border border-red-500/50 text-red-300 hover:bg-red-800">
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-tight">
          <Wallet size={18} className="text-green-600"/> Trip Wallet
        </h3>
        
        {canAddExpense ? (
          <form onSubmit={handleAddOrUpdateExpense} className="bg-card p-4 rounded-2xl border border-slate-200 shadow-sm mb-4">
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
            <div className="flex gap-2">
              {editingExpense && (
                <Button type="button" onClick={handleCancelEdit} variant="ghost" className="w-full bg-slate-200 text-slate-700 p-3 h-auto rounded-xl font-bold text-sm hover:bg-slate-300 transition-colors">
                  Cancel
                </Button>
              )}
              <Button type="submit" className="w-full bg-slate-800 text-white p-3 h-auto rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors">
                {editingExpense ? 'Update Expense' : '+ Add Expense'}
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 italic text-center">Note: Fuel & Service logs added now will auto-sync here.</p>
          </form>
        ) : (
            <div className="bg-blue-50 text-blue-800 p-4 rounded-2xl border border-blue-200 text-center text-xs font-bold mb-4">
                Your trip hasn't started yet. You can add expenses once the trip begins.
            </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-between items-center px-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Expenses</span>
              <span className="text-xs font-black text-slate-800">Total: रू {tripTotal.toLocaleString()}</span>
          </div>
          {trip.expenses.map(e => (
            <div key={e.id} className="bg-card p-3 rounded-xl border border-slate-100 flex justify-between items-center animate-in slide-in-from-bottom-2 group">
              <div>
                <span className="font-bold text-slate-700 text-sm">{e.item}</span>
                <p className="font-black text-slate-900 text-sm">रू {e.cost.toLocaleString()}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button onClick={() => handleEditClick(e)} variant="ghost" size="icon" className="w-8 h-8 rounded-full text-blue-500 hover:bg-blue-50 hover:text-blue-600">
                  <Edit size={14} />
                </Button>
                <Button onClick={() => onDeleteExpense(trip.id, e.id)} variant="ghost" size="icon" className="w-8 h-8 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
          {trip.expenses.length === 0 && <p className="text-center text-xs text-slate-400 py-4 italic">No expenses logged yet.</p>}
        </div>
      </div>
    </div>
  );
}
