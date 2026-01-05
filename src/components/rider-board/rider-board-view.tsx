'use client';

import { useCollection } from '@/firebase';
import { useFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { RiderBoardEntry } from '@/lib/types';
import { Trophy, Award } from 'lucide-react';
import { useMemoFirebase } from '@/firebase/provider';

export function RiderBoardView() {
  const { firestore } = useFirebase();

  const riderBoardCollection = useMemoFirebase(() => collection(firestore, 'rider_board'), [firestore]);
  const riderBoardQuery = useMemoFirebase(() => query(riderBoardCollection, orderBy('totalKilometers', 'desc'), limit(50)), [riderBoardCollection]);
  
  const { data: riderBoard, isLoading } = useCollection<RiderBoardEntry>(riderBoardQuery);

  const getRankColor = (rank: number) => {
    if (rank === 0) return 'text-yellow-400';
    if (rank === 1) return 'text-gray-400';
    if (rank === 2) return 'text-yellow-600';
    return 'text-slate-400';
  };

  return (
    <div className="pb-32 animate-in slide-in-from-right-8 fade-in duration-500">
      <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center gap-2">
        <Trophy />
        Rider Board
      </h2>

      {isLoading && <p>Loading leaderboard...</p>}

      {!isLoading && (!riderBoard || riderBoard.length === 0) && (
        <p className="text-center text-slate-500 text-xs py-10">No riders on the board yet. Complete a trip to get ranked!</p>
      )}

      <div className="space-y-3">
        {(riderBoard || []).map((entry, index) => (
          <div
            key={entry.id}
            className="bg-card border-l-4 border-yellow-400 p-4 rounded-r-2xl shadow-md flex items-center justify-between"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-4">
              <span className={`text-2xl font-black w-8 text-center ${getRankColor(index)}`}>
                {index + 1}
              </span>
              <div>
                <p className="font-bold text-slate-800">{entry.userName || 'Anonymous Rider'}</p>
                <p className="text-xs text-slate-500">{entry.totalKilometers.toLocaleString()} km traveled</p>
              </div>
            </div>
            {index < 3 && <Award size={24} className={getRankColor(index)} />}
          </div>
        ))}
      </div>
    </div>
  );
}
