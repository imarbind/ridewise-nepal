"use client";

import { BarChart3, History, Navigation2, Trophy, PieChart } from 'lucide-react';
import type { ActiveTab } from '@/lib/types';
import { cn } from '@/lib/utils';

const navItems: { id: ActiveTab; icon: React.ElementType, color: string, label: string }[] = [
    { id: 'dashboard', icon: BarChart3, color: 'primary', label: 'Dashboard' },
    { id: 'history', icon: History, color: 'blue-600', label: 'History' },
    { id: 'trip', icon: Navigation2, color: 'purple-600', label: 'Trip' },
    { id: 'reports', icon: PieChart, color: 'green-600', label: 'Reports' },
    { id: 'rider-board', icon: Trophy, color: 'yellow-500', label: 'Rider Board' },
];

interface MainNavigationProps {
    activeTab: ActiveTab;
    setActiveTab: (tab: ActiveTab) => void;
}

export function MainNavigation({ activeTab, setActiveTab }: MainNavigationProps) {
    const getBgColor = (color: string) => {
        switch(color) {
            case 'primary': return 'bg-primary';
            case 'green-600': return 'bg-green-600';
            case 'blue-600': return 'bg-blue-600';
            case 'purple-600': return 'bg-purple-600';
            case 'yellow-500': return 'bg-yellow-500';
            default: return 'bg-primary';
        }
    }
    
    return (
        <nav className="fixed bottom-6 left-6 right-6 h-20 bg-card/80 backdrop-blur-xl border border-border rounded-full flex justify-around items-center px-2 shadow-2xl z-40 max-w-lg mx-auto transform translate-z-0">
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
                            : 'text-muted-foreground hover:text-foreground',
                        isActive && getBgColor(item.color)
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
