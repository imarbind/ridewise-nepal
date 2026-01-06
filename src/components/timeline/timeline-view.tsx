'use client';

import React, { useState, useMemo } from 'react';
import type { FuelLog, ServiceRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { HistoryView } from '@/components/history/history-view';
import { FuelLogView } from '@/components/logs/fuel-log-view';
import { ServiceLogView } from '@/components/service/service-log-view';
import { cn } from '@/lib/utils';

type TimelineSubTab = 'all' | 'fuel' | 'service';

interface TimelineViewProps {
  fuelLogs: FuelLog[];
  serviceLogs: ServiceRecord[];
  onEditFuel: (log: FuelLog) => void;
  onDeleteFuel: (id: string) => void;
  onEditService: (service: ServiceRecord) => void;
  onDeleteService: (id: string) => void;
}

export function TimelineView({
  fuelLogs,
  serviceLogs,
  onEditFuel,
  onDeleteFuel,
  onEditService,
  onDeleteService,
}: TimelineViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<TimelineSubTab>('all');

  const filteredFuelLogs = useMemo(() => {
    // Filter out dummy logs created for odo sync
    return fuelLogs.filter(log => log.liters > 0 || log.amount > 0);
  }, [fuelLogs]);

  const renderContent = () => {
    switch (activeSubTab) {
      case 'all':
        return (
          <HistoryView
            fuelLogs={filteredFuelLogs}
            serviceLogs={serviceLogs}
            onEditFuel={onEditFuel}
            onDeleteFuel={onDeleteFuel}
            onEditService={onEditService}
            onDeleteService={onDeleteService}
          />
        );
      case 'fuel':
        return <FuelLogView logs={filteredFuelLogs} onDelete={onDeleteFuel} onEdit={onEditFuel} />;
      case 'service':
        return <ServiceLogView logs={serviceLogs} onDelete={onDeleteService} onEdit={onEditService} />;
      default:
        return null;
    }
  };
  
  const SubNavButton = ({ tab, children }: { tab: TimelineSubTab; children: React.ReactNode }) => (
      <Button
          variant="ghost"
          onClick={() => setActiveSubTab(tab)}
          className={cn(
              "flex-1 rounded-full",
              activeSubTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          )}
      >
          {children}
      </Button>
  );

  return (
    <div className="pb-32 animate-in slide-in-from-right-8 fade-in duration-500">
      <div className="bg-card/80 p-1.5 rounded-full flex gap-1.5 backdrop-blur-sm sticky top-4 z-20 mb-6 border">
          <SubNavButton tab="all">All</SubNavButton>
          <SubNavButton tab="fuel">Fuel</SubNavButton>
          <SubNavButton tab="service">Service</SubNavButton>
      </div>
      {renderContent()}
    </div>
  );
}
