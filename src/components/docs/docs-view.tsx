"use client";

import { ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocsViewProps {
    onNavigateBack: () => void;
}

export function DocsView({ onNavigateBack }: DocsViewProps) {
    return (
        <div className="pb-32 animate-in slide-in-from-right-8 fade-in duration-500">
            <div className="flex items-center gap-4 mb-6">
                <Button onClick={onNavigateBack} variant="outline" size="icon" className="p-2 bg-card border-slate-200 rounded-xl text-slate-400 hover:text-slate-800 transition-colors shadow-sm w-12 h-12">
                    <ChevronRight className="rotate-180" size={20}/>
                </Button>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-800">Vault</h2>
            </div>
        
            <div className="grid grid-cols-1 gap-4 [perspective:1000px]">
                {['Bluebook', 'Insurance', 'License', 'Tax Receipt'].map((type, i) => (
                    <div key={type} style={{animationDelay: `${i * 100}ms`}} className="group bg-card p-5 rounded-3xl border border-slate-200 flex justify-between items-center hover:bg-slate-50 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary/10 transform hover:-translate-y-1 animate-in slide-in-from-bottom-4 fill-mode-backwards">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-red-50 to-slate-100 rounded-2xl text-primary shadow-inner">
                                <FileText size={24} />
                            </div>
                            <div>
                                <p className="text-slate-800 font-black text-lg group-hover:text-primary transition-colors">{type}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Tap to view</p>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                            <ChevronRight size={14} />
                        </div>
                    </div>
                ))}
            </div>
      </div>
    );
}
