"use client";

import { BarChart3, Fuel, History, Navigation2 } from 'lucide-react';
import type { ActiveTab } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MainNavigationProps {
    activeTab: ActiveTab;
    setActiveTab: (tab: ActiveTab) => void;
}

const navItems: { id: ActiveTab; icon: React.ElementType, color: string }[] = [
    { id: 'dashboard', icon: BarChart3, color: 'primary' },
    { id: 'logs', icon: Fuel, color: 'primary' },
    { id: 'trip', icon: Navigation2, color: 'accent' },
    { id: 'service', icon: History, color: 'blue-600' },
];

export function MainNavigation({ activeTab, setActiveTab }: MainNavigationProps) {
    return (
        <nav className="fixed bottom-6 left-6 right-6 h-20 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-full flex justify-around items-center px-2 shadow-2xl z-40 max-w-md mx-auto transform translate-z-0">
           {navItems.map((item) => {
             const isActive = activeTab === item.id;
             return (
                <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id)} 
                    className={cn(
                        'relative p-3 rounded-full transition-all duration-300',
                        isActive
                            ? 'text-white shadow-lg -translate-y-2 scale-110'
                            : 'text-slate-400 hover:text-slate-600',
                        isActive && item.id === 'dashboard' && 'bg-primary shadow-primary/30',
                        isActive && item.id === 'logs' && 'bg-primary shadow-primary/30',
                        isActive && item.id === 'trip' && 'bg-accent shadow-accent/30',
                        isActive && item.id === 'service' && 'bg-blue-600 shadow-blue-600/30'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                >
                    <item.icon size={24} />
                    <span className="sr-only">{item.id}</span>
                </button>
             )
           })}
        </nav>
    );
}
