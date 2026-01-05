"use client";

import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { calculateStats, getActiveReminders } from '@/lib/calculations';
import type { ActiveTab, FuelLog, ServiceRecord, Trip, Doc, ModalType } from '@/lib/types';

import { NepalBackground } from '@/components/layout/nepal-background';
import { MainNavigation } from '@/components/layout/main-navigation';
import { FloatingActionButtons } from '@/components/layout/floating-action-buttons';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { TripView } from '@/components/trip/trip-view';
import { FuelLogView } from '@/components/logs/fuel-log-view';
import { ServiceLogView } from '@/components/service/service-log-view';
import { DocsView } from '@/components/docs/docs-view';
import { FuelModal } from '@/components/modals/fuel-modal';
import { ServiceModal } from '@/components/modals/service-modal';


const APP_ID = 'ridelog-nepal-v3';

export function MainApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);

  const [logs, setLogs] = useLocalStorage<FuelLog[]>(`${APP_ID}_logs`, []);
  const [services, setServices] = useLocalStorage<ServiceRecord[]>(`${APP_ID}_services`, []);
  const [docs, setDocs] = useLocalStorage<Doc[]>(`${APP_ID}_docs`, []);
  const [trips, setTrips] = useLocalStorage<Trip[]>(`${APP_ID}_trips`, []);

  const stats = useMemo(() => calculateStats(logs, services), [logs, services]);
  const activeReminders = useMemo(() => getActiveReminders(services, stats.lastOdo), [services, stats.lastOdo]);

  const addExpenseToActiveTrip = (title: string, cost: number) => {
    const activeTrip = trips.find(t => t.status === 'active');
    if (activeTrip) {
      setTrips(prev => prev.map(t => {
        if (t.id === activeTrip.id) {
          return {
            ...t,
            expenses: [{ id: Date.now(), item: title, cost: parseFloat(String(cost)) }, ...t.expenses]
          };
        }
        return t;
      }));
    }
  };

  const handleAddFuel = (fuelEntry: Omit<FuelLog, 'id'>) => {
    const newLog = { id: Date.now(), ...fuelEntry };
    setLogs(prev => [newLog, ...prev].sort((a, b) => b.odo - a.odo));
    addExpenseToActiveTrip(`Fuel (${fuelEntry.liters}L)`, fuelEntry.amount);
    setShowModal(false);
  };
  
  const handleAddService = (serviceEntry: Omit<ServiceRecord, 'id'>) => {
    const newRecord = { id: Date.now(), ...serviceEntry };
    setServices(prev => [newRecord, ...prev].sort((a, b) => b.odo - a.odo));
    addExpenseToActiveTrip(`Service: ${serviceEntry.work}`, serviceEntry.totalCost);
    setShowModal(false);
  };

  const handleDeleteFuel = (id: number) => {
    if (confirm('Are you sure you want to delete this fuel log?')) {
      setLogs(prev => prev.filter(log => log.id !== id));
    }
  };

  const handleDeleteService = (id: number) => {
    if (confirm('Are you sure you want to delete this service record?')) {
      setServices(prev => prev.filter(service => service.id !== id));
    }
  };

  const openModal = (type: NonNullable<ModalType>) => {
    setModalType(type);
    setShowModal(true);
  }

  const renderActiveTab = () => {
    switch(activeTab) {
        case 'dashboard':
            return <DashboardView stats={stats} activeReminders={activeReminders} onNavigateDocs={() => setActiveTab('docs')} />;
        case 'trip':
            return <TripView trips={trips} setTrips={setTrips} stats={stats} services={services} />;
        case 'logs':
            return <FuelLogView logs={logs} onDelete={handleDeleteFuel} />;
        case 'service':
            return <ServiceLogView services={services} onDelete={handleDeleteService} />;
        case 'docs':
            return <DocsView onNavigateBack={() => setActiveTab('dashboard')} />;
        default:
            return <DashboardView stats={stats} activeReminders={activeReminders} onNavigateDocs={() => setActiveTab('docs')} />;
    }
  }

  return (
    <>
      <NepalBackground />
      
      <div className="relative z-10">
        {renderActiveTab()}
      </div>

      <MainNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab !== 'docs' && (
        <FloatingActionButtons onOpenModal={openModal} />
      )}
      
      <FuelModal
        isOpen={showModal && modalType === 'fuel'}
        onClose={() => setShowModal(false)}
        onSubmit={handleAddFuel}
        lastPrice={logs.length > 0 && logs[0].price ? logs[0].price : undefined}
      />
      <ServiceModal
        isOpen={showModal && modalType === 'service'}
        onClose={() => setShowModal(false)}
        onSubmit={handleAddService}
      />
    </>
  );
};
