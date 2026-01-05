export type ActiveTab = 'dashboard' | 'fuel' | 'service' | 'trip' | 'history' | 'docs' | 'rider-board';
export type ModalType = 'fuel' | 'service' | null;

export type EngineCc = '50-125' | '126-250' | '251-500' | '501-1000' | '>1000';

export interface BikeDetails {
  name: string;
  number: string;
  make: string;
  model: string;
  year: string;
  engineCc: EngineCc;
}

export interface FuelLog {
  id: string;
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
  id: string;
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
    id: string;
    destination: string;
    start: string; // ISO 8601 format
    end?: string; // ISO 8601 format, optional
    distance: string;
    status: 'planned' | 'active' | 'completed';
    expenses: TripExpense[];
}

export interface Doc {
    id: number;
    type: string;
    // Add other doc properties like image URL, expiry date etc.
}

export type ConditionRating = 'Mint Condition' | 'Solid Rider' | 'Fair Runner' | 'Worn Beater' | 'Basket Case' | 'Not Enough Data';

export type CpkData = {
  totalCpk: number;
  fuelCpk: number;
  serviceCpk: number;
  fuelCpkPercent: number;
  serviceCpkPercent: number;
  condition: ConditionRating;
  totalDistance: number;
} | {
  totalCpk: null;
  condition: 'Not Enough Data';
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
    cpk: CpkData;
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

export interface RiderBoardEntry {
  id: string;
  userId: string;
  userName?: string;
  totalKilometers: number;
}
