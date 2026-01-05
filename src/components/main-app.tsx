'use client';

import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { calculateStats, getActiveReminders, getExpenseChartData } from '@/lib/calculations';
import type { ActiveTab, FuelLog, ServiceRecord, Trip, Doc, ModalType, TripExpense, EngineCc, BikeDetails } from '@/lib/types';

import { NepalBackground } from '@/components/layout/nepal-background';
import { MainNavigation } from '@/components/layout/main-navigation';
import { FloatingActionButtons } from '@/components/layout/floating-action-buttons';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { TripView } from '@/components/trip/trip-view';
import { ServiceLogView } from '@/components/service/service-log-view';
import { DocsView } from '@/components/docs/docs-view';
import { FuelModal } from '@/components/modals/fuel-modal';
import { ServiceModal } from '@/components/modals/service-modal';
import { HistoryView } from './history/history-view';
import { FuelLogView } from './logs/fuel-log-view';


const APP_ID = 'ridelog-nepal-v3';

export function MainApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [modalType, setModalType] = useState<ModalType>(null);
  
  const [editingFuel, setEditingFuel] = useState<FuelLog | null>(null);
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null);

  const [logs, setLogs] = useLocalStorage<FuelLog[]>(`${APP_ID}_logs`, []);
  const [services, setServices] = useLocalStorage<ServiceRecord[]>(`${APP_ID}_services`, []);
  const [docs, setDocs] = useLocalStorage<Doc[]>(`${APP_ID}_docs`, []);
  const [trips, setTrips] = useLocalStorage<Trip[]>(`${APP_ID}_trips`, []);
  const [bikeDetails, setBikeDetails] = useLocalStorage<BikeDetails>(`${APP_ID}_bikeDetails`, { 
    name: "My Bike", 
    number: "BA 01-001 PA",
    make: "",
    model: "",
    year: "",
    engineCc: "126-250",
  });

  const stats = useMemo(() => calculateStats(logs, services, bikeDetails.engineCc), [logs, services, bikeDetails.engineCc]);
  const activeReminders = useMemo(() => getActiveReminders(services, stats.lastOdo), [services, stats.lastOdo]);
  const expenseChartData = useMemo(() => getExpenseChartData(logs, services), [logs, services]);

  const addExpenseToActiveTrip = (title: string, cost: number) => {
    const activeTrip = trips.find(t => t.status === 'active');
    if (activeTrip) {
      const start = new Date(activeTrip.start);
      start.setHours(0,0,0,0);
      const today = new Date();
      today.setHours(0,0,0,0);
      if(today.getTime() < start.getTime()) return;

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

  const handleAddOrUpdateFuel = (fuelEntry: Omit<FuelLog, 'id'>, id?: number) => {
    if (id) { // Editing existing
      setLogs(prev => prev.map(log => log.id === id ? { ...log, ...fuelEntry } : log).sort((a,b) => b.odo - a.odo));
    } else { // Adding new
      const newLog = { id: Date.now(), ...fuelEntry };
      setLogs(prev => [newLog, ...prev].sort((a, b) => b.odo - a.odo));
      addExpenseToActiveTrip(`Fuel (${fuelEntry.liters}L)`, fuelEntry.amount);
    }
    setEditingFuel(null);
    setModalType(null);
  };
  
  const handleAddOrUpdateService = (serviceEntry: Omit<ServiceRecord, 'id'>, id?: number) => {
    if (id) {
       setServices(prev => prev.map(service => service.id === id ? { ...service, ...serviceEntry } : service).sort((a,b) => b.odo - a.odo));
    } else {
      const newRecord = { id: Date.now(), ...serviceEntry };
      setServices(prev => [newRecord, ...prev].sort((a, b) => b.odo - a.odo));
      addExpenseToActiveTrip(`Service: ${serviceEntry.work}`, serviceEntry.totalCost);
    }
    setEditingService(null);
    setModalType(null);
  };

  const handleDeleteFuel = (id: number) => {
    if (window.confirm('Are you sure you want to delete this fuel log?')) {
      setLogs(prev => prev.filter(log => log.id !== id));
    }
  };

  const handleDeleteService = (id: number) => {
    if (window.confirm('Are you sure you want to delete this service record?')) {
      setServices(prev => prev.filter(service => service.id !== id));
    }
  };

  const handleEditFuel = (log: FuelLog) => {
    setEditingFuel(log);
    setModalType('fuel');
  }

  const handleEditService = (service: ServiceRecord) => {
    setEditingService(service);
    setModalType('service');
  }

  const handleCloseModal = () => {
    setModalType(null);
    setEditingFuel(null);
    setEditingService(null);
  }

  const createTrip = (newTripData: Omit<Trip, 'id' | 'status' | 'expenses'>) => {
    const newTripObj: Trip = {
      id: Date.now(),
      ...newTripData,
      status: 'active',
      expenses: []
    };
    setTrips(prev => [newTripObj, ...prev]);
  };

  const endTrip = (id: number) => {
    if(window.confirm("End this trip? This will move it to history.")) {
      setTrips(trips.map(t => t.id === id ? { ...t, status: 'completed' } : t));
    }
  };

  const deleteTrip = (id: number) => {
    if (window.confirm("Are you sure you want to delete this trip? This action cannot be undone.")) {
      setTrips(prev => prev.filter(t => t.id !== id));
    }
  };

  const addTripExpense = (tripId: number, item: string, cost: string) => {
    if (!item || !cost) return;
    const updatedTrips = trips.map((t) => {
      if (t.id === tripId) { 
        return { ...t, expenses: [{ id: Date.now(), item, cost: parseFloat(cost) }, ...t.expenses] };
      }
      return t;
    });
    setTrips(updatedTrips);
  };

  const updateTripExpense = (tripId: number, updatedExpense: TripExpense) => {
    setTrips(prevTrips => prevTrips.map(trip => {
      if (trip.id === tripId) {
        return {
          ...trip,
          expenses: trip.expenses.map(expense => 
            expense.id === updatedExpense.id ? updatedExpense : expense
          )
        };
      }
      return trip;
    }));
  };
  
  const deleteTripExpense = (tripId: number, expenseId: number) => {
     if (!window.confirm("Delete this expense?")) return;
    setTrips(prevTrips => prevTrips.map(trip => {
      if (trip.id === tripId) {
        return {
          ...trip,
          expenses: trip.expenses.filter(expense => expense.id !== expenseId)
        };
      }
      return trip;
    }));
  };

  const openModal = (type: NonNullable<ModalType>) => {
    setModalType(type);
  }

  const renderActiveTab = () => {
    switch(activeTab) {
        case 'dashboard':
            return <DashboardView stats={stats} activeReminders={activeReminders} onNavigateDocs={() => setActiveTab('docs')} bikeDetails={bikeDetails} setBikeDetails={setBikeDetails} expenseChartData={expenseChartData} />;
        case 'fuel':
            return <FuelLogView logs={logs} onDelete={handleDeleteFuel} onEdit={handleEditFuel} />;
        case 'service':
            return <ServiceLogView logs={services} onDelete={handleDeleteService} onEdit={handleEditService} />;
        case 'history':
            return <HistoryView 
                        fuelLogs={logs} 
                        serviceLogs={services} 
                        onEditFuel={handleEditFuel}
                        onDeleteFuel={handleDeleteFuel}
                        onEditService={handleEditService}
                        onDeleteService={handleDeleteService}
                    />;
        case 'trip':
            return <TripView 
              trips={trips} 
              stats={stats} 
              services={services}
              onCreateTrip={createTrip}
              onEndTrip={endTrip}
              onDeleteTrip={deleteTrip}
              onAddExpense={addTripExpense}
              onUpdateExpense={updateTripExpense}
              onDeleteExpense={deleteTripExpense}
            />;
        case 'docs':
            return <DocsView onNavigateBack={() => setActiveTab('dashboard')} />;
        default:
            return <DashboardView stats={stats} activeReminders={activeReminders} onNavigateDocs={() => setActiveTab('docs')} bikeDetails={bikeDetails} setBikeDetails={setBikeDetails} expenseChartData={expenseChartData} />;
    }
  }

  return (
    <>
      <NepalBackground />
      
      <div className="relative z-10">
        {renderActiveTab()}
      </div>

      <MainNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {activeTab !== 'trip' && <FloatingActionButtons onOpenModal={openModal} />}
      
      <FuelModal
        isOpen={modalType === 'fuel'}
        onClose={handleCloseModal}
        onSubmit={handleAddOrUpdateFuel}
        lastOdo={stats.lastOdo}
        lastPrice={logs.length > 0 && logs[0].price ? logs[0].price : undefined}
        editingFuel={editingFuel}
      />
      <ServiceModal
        isOpen={modalType === 'service'}
        onClose={handleCloseModal}
        onSubmit={handleAddOrUpdateService}
        lastOdo={stats.lastOdo}
        editingService={editingService}
      />
    </>
  );
};
