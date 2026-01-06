
import type { FuelLog, ServiceRecord, Trip } from './types';

export const demoFuelLogs: Omit<FuelLog, 'id'>[] = [
    {
      date: "2024-05-10",
      odo: 15000,
      liters: 10,
      amount: 1750,
      price: 175,
      tankStatus: 'full',
      fuelStation: "Nepal Oil Corporation",
      fuelType: 'normal',
    },
    {
      date: "2024-05-25",
      odo: 15350,
      liters: 8.5,
      amount: 1487.5,
      price: 175,
      tankStatus: 'partial',
    },
    {
      date: "2024-06-10",
      odo: 15700,
      liters: 9.8,
      amount: 1715,
      price: 175,
      tankStatus: 'full',
      notes: "Filled up before trip to Pokhara."
    },
    {
      date: "2024-07-01",
      odo: 16100,
      liters: 10.2,
      amount: 1836,
      price: 180,
      tankStatus: 'full',
      fuelType: 'premium',
    },
];

export const demoServiceRecords: Omit<ServiceRecord, 'id'>[] = [
    {
        date: "2024-01-15",
        odo: 12500,
        work: "General Servicing",
        labor: 800,
        totalCost: 3450,
        parts: [
            { id: 'p1', name: "Engine Oil", cost: 1500, quantity: 1, reminderType: 'km', reminderValue: '3000' },
            { id: 'p2', name: "Oil Filter", cost: 450, quantity: 1, reminderType: 'km', reminderValue: '6000' },
            { id: 'p3', name: "Air Filter Cleaning", cost: 0, quantity: 1, reminderType: 'none', reminderValue: '' },
            { id: 'p4', name: "Chain Lubrication", cost: 300, quantity: 1, reminderType: 'km', reminderValue: '500' },
        ],
        serviceType: 'regular',
        notes: "Regular 12.5k KM service."
    },
    {
        date: "2024-06-20",
        odo: 15900,
        work: "Brake Pad Replacement",
        labor: 500,
        totalCost: 2300,
        parts: [
            { id: 'p5', name: "Front Brake Pad", cost: 1800, quantity: 1, reminderType: 'km', reminderValue: '15000' },
        ],
        serviceType: 'repair',
        notes: "Front brake felt spongy. Replaced pads."
    }
];

export const demoTrips: Omit<Trip, 'id' | 'status' | 'expenses'>[] = [
    {
        destination: "Pokhara",
        start: "2024-08-15T06:00:00.000Z",
        distance: "200",
    },
    {
        destination: "Chitwan",
        start: "2024-09-05T08:00:00.000Z",
        distance: "150",
    }
];
