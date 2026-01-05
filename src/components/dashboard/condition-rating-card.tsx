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
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-3xl text-center mb-8 shadow-lg">
                <AlertTriangle className="mx-auto text-blue-500 mb-2" size={32}/>
                <h3 className="font-black text-blue-900">More Data Needed</h3>
                <p className="text-xs text-blue-700">Add more fuel & service logs covering at least 500km to generate a condition rating.</p>
            </div>
        )
    }
    
    const conditionStyles = getConditionStyles(cpkData.condition);

    return (
        <div className="bg-card border-slate-200 shadow-xl rounded-[2rem] p-6 mb-8 animate-in fade-in">
             <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 mb-4">
                <Gauge size={14} className="text-primary"/> Condition Rating
            </h3>

            <div className="text-center mb-6">
                <p className={`inline-block px-4 py-2 rounded-full text-lg font-black shadow-md ${conditionStyles.bg} ${conditionStyles.text}`}>
                    {cpkData.condition}
                </p>
                <p className="font-black text-5xl text-slate-800 tracking-tighter mt-2">
                    रू {cpkData.totalCpk}
                    <span className="text-lg font-bold text-slate-400">/km</span>
                </p>
                <p className="text-xs text-slate-500 font-bold mt-1">
                    Calculated over last {cpkData.totalDistance.toLocaleString()} km
                </p>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">Cost Breakdown</p>
                <div className="flex w-full h-3 rounded-full overflow-hidden bg-green-200">
                    <div className="bg-green-500" style={{width: `${cpkData.fuelCpkPercent}%`}} />
                    <div className="bg-primary" style={{width: `${cpkData.serviceCpkPercent}%`}}/>
                </div>
                 <div className="flex justify-between mt-2 text-xs">
                    <div className="font-bold text-green-700 text-center">
                        <p>{cpkData.fuelCpkPercent}% Fuel</p>
                        <p className="text-[10px] opacity-80">({cpkData.fuelCpk} /km)</p>
                    </div>
                     <div className="font-bold text-primary text-center">
                        <p>{cpkData.serviceCpkPercent}% Service</p>
                        <p className="text-[10px] opacity-80">({cpkData.serviceCpk} /km)</p>
                    </div>
                </div>
            </div>

            <div className="mt-4 space-y-2">
                 <div className="flex items-start gap-2 text-xs text-slate-600">
                    <TrendingDown size={18} className="text-slate-400 mt-0.5 shrink-0"/>
                    <div>
                        <span className="font-bold">Insight:</span> Fuel costs make up {cpkData.fuelCpkPercent}% of your running expenses. High fuel CPK can indicate inefficiency.
                    </div>
                </div>
                 <div className="flex items-start gap-2 text-xs text-slate-600">
                    <AlertTriangle size={16} className="text-slate-400 mt-0.5 shrink-0"/>
                    <div>
                        <span className="font-bold">Tip:</span> If your rating is 'Fair' or lower, check your service history for overdue maintenance to improve efficiency.
                    </div>
                </div>
            </div>
        </div>
    )
}
