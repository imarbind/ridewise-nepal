"use client";

import { BarChart3, History, Navigation2, Wrench } from 'lucide-react';
import type { ActiveTab } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MainNavigationProps {
    activeTab: ActiveTab;
    setActiveTab: (tab: ActiveTab) => void;
}

const navItems: { id: ActiveTab; icon: React.ElementType, color: string, label: string }[] = [
    { id: 'dashboard', icon: BarChart3, color: 'primary', label: 'Dashboard' },
    { id: 'service', icon: Wrench, color: 'primary', label: 'Service' },
    { id: 'trip', icon: Navigation2, color: 'accent', label: 'Trip' },
    { id: 'history', icon: History, color: 'blue-600', label: 'History' },
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
                        isActive && item.id === 'service' && 'bg-primary shadow-primary/30',
                        isActive && item.id === 'trip' && 'bg-accent shadow-accent/30',
                        isActive && item.id === 'history' && 'bg-blue-600 shadow-blue-600/30'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                >
                    <item.icon size={24} />
                    <span className="sr-only">{item.label}</span>
                </button>
             )
           })}
        </nav>
    );
}

    