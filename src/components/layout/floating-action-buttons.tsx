"use client";

import { Fuel, Wrench } from 'lucide-react';
import type { ModalType } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface FloatingActionButtonsProps {
    onOpenModal: (type: NonNullable<ModalType>) => void;
}

export function FloatingActionButtons({ onOpenModal }: FloatingActionButtonsProps) {
    return (
        <div className="fixed bottom-24 right-6 flex flex-col gap-4 z-50">
            <Button 
                aria-label="Add Service Record"
                onClick={() => onOpenModal('service')} 
                className="group relative bg-primary hover:bg-red-700 text-white w-14 h-14 rounded-full shadow-lg shadow-primary/30 active:scale-90 transition-all hover:-translate-y-1"
            >
                <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-20 transition-opacity animate-ping-slow-once"></div>
                <Wrench size={24}/>
            </Button>
            <Button 
                aria-label="Add Fuel Log"
                onClick={() => onOpenModal('fuel')} 
                className="group relative bg-green-600 hover:bg-green-700 text-white w-14 h-14 rounded-full shadow-lg shadow-green-600/30 active:scale-90 transition-all hover:-translate-y-1"
            >
                <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-20 transition-opacity animate-ping-slow-once"></div>
                <Fuel size={24}/>
            </Button>
      </div>
    );
}

// Add animation to tailwind.config if needed
// keyframes: { 'ping-slow-once': { '75%, 100%': { transform: 'scale(1.5)', opacity: '0' } } }
// animation: { 'ping-slow-once': 'ping-slow-once 1s cubic-bezier(0, 0, 0.2, 1)' }
