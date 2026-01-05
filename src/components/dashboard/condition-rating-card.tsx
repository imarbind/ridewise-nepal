"use client";

import { AlertTriangle, TrendingDown, Gauge } from "lucide-react";
import type { CpkData } from "@/lib/types";

interface ConditionRatingCardProps {
  cpkData: CpkData;
}

const getConditionStyles = (condition: CpkData['condition']) => {
    switch (condition) {
        case 'Mint Condition': return { bg: 'bg-green-500', text: 'text-green-50' };
        case 'Solid Rider': return { bg: 'bg-blue-500', text: 'text-blue-50' };
        case 'Fair Runner': return { bg: 'bg-yellow-500', text: 'text-yellow-50' };
        case 'Worn Beater': return { bg: 'bg-orange-500', text: 'text-orange-50' };
        case 'Basket Case': return { bg: 'bg-red-600', text: 'text-red-50' };
        default: return { bg: 'bg-slate-500', text: 'text-slate-50' };
    }
}


export function ConditionRatingCard({ cpkData }: ConditionRatingCardProps) {

    if (cpkData.condition === 'Not Enough Data' || cpkData.totalCpk === null) {
        return (
            <div className="bg-card/80 backdrop-blur-lg border border-blue-200 p-4 rounded-2xl text-center shadow-lg flex items-center justify-center gap-3">
                <AlertTriangle className="text-blue-500" size={24}/>
                <div>
                    <h3 className="font-black text-blue-900 text-sm">More Data Needed</h3>
                    <p className="text-[10px] text-blue-700">Add logs to generate a rating.</p>
                </div>
            </div>
        )
    }
    
    const conditionStyles = getConditionStyles(cpkData.condition);

    return (
        <div className="bg-card/90 backdrop-blur-lg border-slate-200 shadow-xl rounded-2xl p-4 animate-in fade-in">
             <div className="flex items-center justify-between gap-4 text-center">
                <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Condition</p>
                    <p className={`inline-block px-3 py-1 mt-1 rounded-full text-xs font-black shadow-md ${conditionStyles.bg} ${conditionStyles.text}`}>
                        {cpkData.condition}
                    </p>
                </div>
                <div className="w-px h-10 bg-slate-200"></div>
                <div className="flex-1">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cost/KM</p>
                    <p className="font-black text-2xl text-slate-800 tracking-tighter mt-1">
                        रू {cpkData.totalCpk}
                    </p>
                </div>
            </div>
        </div>
    )
}
