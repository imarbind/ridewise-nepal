'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { calculateStats, getActiveReminders } from '@/lib/calculations';
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
import { RiderBoardView } from './rider-board/rider-board-view';
import { useFirebase } from '@/firebase';
import { collection, doc, onSnapshot, setDoc, addDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useCollection, useDoc } from '@/firebase';
import { useMemoFirebase } from '@/firebase/provider';
import { OnboardingView } from './onboarding/onboarding-view';


const APP_ID = 'ridelog-nepal-v3';

const defaultBikeDetails: BikeDetails = { 
  name: "My Bike", 
  number: "BA 01-001 PA",
  make: "",
  model: "",
  year: "",
  engineCc: "126-250",
};

export function MainApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [modalType, setModalType] = useState<ModalType>(null);
  
  const [editingFuel, setEditingFuel] = useState<FuelLog | null>(null);
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null);

  const { firestore, user } = useFirebase();

  const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<{bikeDetails?: BikeDetails}>(userRef);

  const bikeDetails = userProfile?.bikeDetails || null;

  const setBikeDetails = (details: BikeDetails) => {
    if (userRef) {
      updateDocumentNonBlocking(userRef, { bikeDetails: details });
    }
  };
  
  const logsCollectionRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'fuel_logs') : null, [firestore, user]);
  const { data: logs, isLoading: logsLoading } = useCollection<FuelLog>(logsCollectionRef);

  const servicesCollectionRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'service_logs') : null, [firestore, user]);
  const { data: services, isLoading: servicesLoading } = useCollection<ServiceRecord>(servicesCollectionRef);

  const tripsCollectionRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'trips') : null, [firestore, user]);
  const { data: trips, isLoading: tripsLoading } = useCollection<Trip>(tripsCollectionRef);

  const stats = useMemo(() => calculateStats(logs || [], services || [], bikeDetails?.engineCc || '126-250'), [logs, services, bikeDetails]);
  const activeReminders = useMemo(() => getActiveReminders(services || [], stats.lastOdo), [services, stats.lastOdo]);
  
  const upcomingTrip = useMemo(() => {
    const plannedTrips = (trips || []).filter(t => t.status === 'planned');
    if (plannedTrips.length === 0) return null;

    const sortedUpcoming = plannedTrips.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    
    for (const trip of sortedUpcoming) {
        const startDate = new Date(trip.start);
        if (startDate > new Date()) {
            return trip;
        }
    }

    return null;
  }, [trips]);


  const addExpenseToActiveTrip = (title: string, cost: number) => {
    const activeTrip = (trips || []).find(t => t.status === 'active');
    if (activeTrip && activeTrip.id) {
      const tripRef = doc(firestore, 'users', user!.uid, 'trips', String(activeTrip.id));
      const updatedExpenses = [{ id: Date.now(), item: title, cost: parseFloat(String(cost)) }, ...(activeTrip.expenses || [])];
      updateDocumentNonBlocking(tripRef, { expenses: updatedExpenses });
    }
  };

  const handleAddOrUpdateFuel = (fuelEntry: Omit<FuelLog, 'id'>, id?: string) => {
    if (id && logsCollectionRef) { // Editing existing
      const logRef = doc(logsCollectionRef, id);
      updateDocumentNonBlocking(logRef, fuelEntry);
    } else if (logsCollectionRef) { // Adding new
      addDocumentNonBlocking(logsCollectionRef, fuelEntry);
      addExpenseToActiveTrip(`Fuel (${fuelEntry.liters}L)`, fuelEntry.amount);
    }
    setEditingFuel(null);
    setModalType(null);
  };
  
  const handleAddOrUpdateService = (serviceEntry: Omit<ServiceRecord, 'id'>, id?: string) => {
    if (id && servicesCollectionRef) {
       const serviceRef = doc(servicesCollectionRef, id);
       updateDocumentNonBlocking(serviceRef, serviceEntry);
    } else if (servicesCollectionRef) {
      addDocumentNonBlocking(servicesCollectionRef, serviceEntry);
      addExpenseToActiveTrip(`Service: ${serviceEntry.work}`, serviceEntry.totalCost);
    }
    setEditingService(null);
    setModalType(null);
  };

  const handleDeleteFuel = (id: string) => {
    if (window.confirm('Are you sure you want to delete this fuel log?') && logsCollectionRef) {
      deleteDocumentNonBlocking(doc(logsCollectionRef, id));
    }
  };

  const handleDeleteService = (id: string) => {
    if (window.confirm('Are you sure you want to delete this service record?') && servicesCollectionRef) {
      deleteDocumentNonBlocking(doc(servicesCollectionRef, id));
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

  const createTrip = (newTripData: Omit<Trip, 'id' | 'status' | 'expenses' | 'end'>) => {
    if (!tripsCollectionRef) return;
    const newTripObj: Omit<Trip, 'id'> = {
      ...newTripData,
      status: 'planned',
      expenses: []
    };
    addDocumentNonBlocking(tripsCollectionRef, newTripObj);
  };
  
  const startTrip = (id: string) => {
     if (!user || !tripsCollectionRef) return;
     // Deactivate any currently active trip
     (trips || []).forEach(t => {
        if (t.status === 'active' && t.id) {
          const tripRef = doc(tripsCollectionRef, String(t.id));
          updateDocumentNonBlocking(tripRef, { status: 'completed', end: new Date().toISOString() });
        }
     });

    // Activate the selected trip
    const tripRef = doc(tripsCollectionRef, id);
    updateDocumentNonBlocking(tripRef, { status: 'active', start: new Date().toISOString() });
  }

  const endTrip = (id: string) => {
    if(window.confirm("End this trip? This will move it to history.") && tripsCollectionRef) {
      const tripRef = doc(tripsCollectionRef, id);
      const trip = (trips || []).find(t => t.id === id);
      if (trip && user) {
        updateDocumentNonBlocking(tripRef, { status: 'completed', end: new Date().toISOString() });
        
        // Update rider board
        const riderBoardRef = doc(firestore, 'rider_board', user.uid);
        getDoc(riderBoardRef).then(docSnap => {
          const currentData = docSnap.data() || { totalKilometers: 0 };
          const newTotal = currentData.totalKilometers + parseFloat(trip.distance);
          setDocumentNonBlocking(riderBoardRef, { userId: user.uid, totalKilometers: newTotal, userName: user.displayName }, { merge: true });
        });
      }
    }
  };

  const deleteTrip = (id: string) => {
    if (window.confirm("Are you sure you want to delete this trip? This action cannot be undone.") && tripsCollectionRef) {
      deleteDocumentNonBlocking(doc(tripsCollectionRef, id));
    }
  };

  const addTripExpense = (tripId: string, item: string, cost: string) => {
    if (!item || !cost || !tripsCollectionRef) return;
    const trip = (trips || []).find(t => t.id === tripId);
    if(trip) {
      const tripRef = doc(tripsCollectionRef, tripId);
      const newExpense = { id: Date.now(), item, cost: parseFloat(cost) };
      const updatedExpenses = [newExpense, ...(trip.expenses || [])];
      updateDocumentNonBlocking(tripRef, { expenses: updatedExpenses });
    }
  };

  const updateTripExpense = (tripId: string, updatedExpense: TripExpense) => {
    if (!tripsCollectionRef) return;
     const trip = (trips || []).find(t => t.id === tripId);
     if (trip) {
        const tripRef = doc(tripsCollectionRef, tripId);
        const updatedExpenses = (trip.expenses || []).map(expense => 
            expense.id === updatedExpense.id ? updatedExpense : expense
        );
        updateDocumentNonBlocking(tripRef, { expenses: updatedExpenses });
     }
  };
  
  const deleteTripExpense = (tripId: string, expenseId: number) => {
    if (!window.confirm("Delete this expense?") || !tripsCollectionRef) return;
     const trip = (trips || []).find(t => t.id === tripId);
      if (trip) {
        const tripRef = doc(tripsCollectionRef, tripId);
        const updatedExpenses = (trip.expenses || []).filter(expense => expense.id !== expenseId);
        updateDocumentNonBlocking(tripRef, { expenses: updatedExpenses });
      }
  };

  const openModal = (type: NonNullable<ModalType>) => {
    setModalType(type);
  }

  const handleOnboardingSubmit = (details: BikeDetails, initialOdo: number) => {
    if (userRef) {
      updateDocumentNonBlocking(userRef, { bikeDetails: details });
    }
    if (logsCollectionRef && initialOdo > 0) {
      const initialLog: Omit<FuelLog, 'id'> = {
        date: new Date().toISOString(),
        odo: initialOdo,
        liters: 0,
        amount: 0,
        price: 0,
      };
      addDocumentNonBlocking(logsCollectionRef, initialLog);
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading your garage...</p>
      </div>
    );
  }

  if (!bikeDetails) {
    return <OnboardingView onSubmit={handleOnboardingSubmit} />;
  }

  const renderActiveTab = () => {
    switch(activeTab) {
        case 'dashboard':
            return <DashboardView stats={stats} activeReminders={activeReminders} onNavigateDocs={() => setActiveTab('docs')} bikeDetails={bikeDetails} setBikeDetails={setBikeDetails} upcomingTrip={upcomingTrip} />;
        case 'fuel':
            return <FuelLogView logs={logs || []} onDelete={handleDeleteFuel} onEdit={handleEditFuel} />;
        case 'service':
            return <ServiceLogView logs={services || []} onDelete={handleDeleteService} onEdit={handleEditService} />;
        case 'history':
            return <HistoryView 
                        fuelLogs={logs || []} 
                        serviceLogs={services || []} 
                        onEditFuel={handleEditFuel}
                        onDeleteFuel={handleDeleteFuel}
                        onEditService={handleEditService}
                        onDeleteService={handleDeleteService}
                    />;
        case 'trip':
            return <TripView 
              trips={trips || []} 
              stats={stats} 
              services={services || []}
              onCreateTrip={createTrip}
              onStartTrip={startTrip}
              onEndTrip={endTrip}
              onDeleteTrip={deleteTrip}
              onAddExpense={addTripExpense}
              onUpdateExpense={updateTripExpense}
              onDeleteExpense={deleteTripExpense}
            />;
        case 'rider-board':
            return <RiderBoardView />;
        case 'docs':
            return <DocsView onNavigateBack={() => setActiveTab('dashboard')} />;
        default:
            return <DashboardView stats={stats} activeReminders={activeReminders} onNavigateDocs={() => setActiveTab('docs')} bikeDetails={bikeDetails} setBikeDetails={setBikeDetails} upcomingTrip={upcomingTrip} />;
    }
  }

  return (
    <>
      <NepalBackground />
      
      <div className="relative z-10">
        {renderActiveTab()}
      </div>

      <MainNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {activeTab !== 'trip' && activeTab !== 'rider-board' && <FloatingActionButtons onOpenModal={openModal} />}
      
      <FuelModal
        isOpen={modalType === 'fuel'}
        onClose={handleCloseModal}
        onSubmit={handleAddOrUpdateFuel}
        lastOdo={stats.lastOdo}
        lastPrice={(logs && logs.length > 0 && logs[0].price) ? logs[0].price : undefined}
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
