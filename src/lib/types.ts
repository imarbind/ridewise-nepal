export type ActiveTab = 'dashboard' | 'logs' | 'trip' | 'history' | 'docs';
export type ModalType = 'fuel' | 'service' | null;

export interface FuelLog {
  id: number;
  date: string;
  odo: number;
  liters: number;
  amount: number;
  price: number;
}

export interface ServicePart {
  id: string;
  name: string;
  cost: number;
  reminderType: 'none' | 'km' | 'days';
  reminderValue: string;
}

export interface ServiceRecord {
  id: number;
  date: string;
  odo: number;
  work: string;
  labor: number;
  totalCost: number;
  parts: ServicePart[];
}

export interface TripExpense {
    id: number;
    item: string;
    cost: number;
}

export interface Trip {
    id: number;
    destination: string;
    start: string;
    distance: string;
    dailyUsage: string;
    status: 'active' | 'completed';
    expenses: TripExpense[];
}

export interface Doc {
    id: number;
    type: string;
    // Add other doc properties like image URL, expiry date etc.
}

export type Stats = {
    lastOdo: number;
    totalFuelCost: number;
    totalServiceCost: number;
    totalOwnership: number;
    avgMileage: string;
    costPerKm: string;
    efficiencyStatus: 'Excellent' | 'Average' | 'Poor';
    dailyAvg: string;
    totalPartsChanged: number;
    totalOilChanges: number;
}

export type Reminder = {
    name: string;
    progress: number;
    label: string;
    isDue: boolean;
    rawData: {
        lastOdo: number;
        lastDate: string;
        reminderType: 'km' | 'days';
        reminderValue: number;
        currentUsed: number;
    }
}
