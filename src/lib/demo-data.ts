import type { FuelLog, ServiceRecord, Trip } from './types';

// This file is intentionally left empty to remove demo data from the application.
// The logic to add this data has been removed from main-app.tsx.

export const demoFuelLogs: Omit<FuelLog, 'id'>[] = [];
export const demoServiceRecords: Omit<ServiceRecord, 'id' | 'work'>[] = [];
export const demoTrips: Omit<Trip, 'id' | 'status' | 'expenses'>[] = [];
