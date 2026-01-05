import type { FuelLog, ServiceRecord, Stats, Reminder, EngineCc, CpkData } from './types';
import { ExpenseChartData } from '@/components/dashboard/expense-chart';

const cpkRanges: Record<EngineCc, { mint: number; solid: number; fair: number; worn: number; basket: number }> = {
    '50-125':   { mint: 3.60, solid: 5.77, fair: 8.65,  worn: 14.41, basket: 14.41 },
    '126-250':  { mint: 4.32, solid: 6.49, fair: 10.09, worn: 17.30, basket: 17.30 },
    '251-500':  { mint: 5.77, solid: 7.93, fair: 12.25, worn: 20.18, basket: 20.18 },
    '501-1000': { mint: 7.21, solid: 10.09, fair: 14.41, worn: 23.06, basket: 23.06 },
    '>1000':    { mint: 8.65, solid: 12.25, fair: 17.30, worn: 28.83, basket: 28.83 },
};

function calculateCpk(logs: FuelLog[], services: ServiceRecord[], engineCc: EngineCc): CpkData {
  const allRecords = [
    ...logs.map(l => ({ odo: l.odo })),
    ...services.map(s => ({ odo: s.odo }))
  ].filter(r => r.odo > 0).sort((a, b) => a.odo - b.odo);

  if (allRecords.length < 2) {
    return { condition: 'Not Enough Data', totalCpk: null };
  }

  const minOdo = allRecords[0].odo;
  const maxOdo = allRecords[allRecords.length - 1].odo;
  const totalDistance = maxOdo - minOdo;

  if (totalDistance < 500) {
    return { condition: 'Not Enough Data', totalCpk: null };
  }

  const fuelSum = logs.reduce((sum, log) => sum + log.amount, 0);
  const serviceSum = services.reduce((sum, service) => sum + service.totalCost, 0);
  const totalExpenses = fuelSum + serviceSum;

  if (totalDistance <= 0 || totalExpenses <= 0) {
      return { condition: 'Not Enough Data', totalCpk: null };
  }

  const totalCpk = totalExpenses / totalDistance;
  const ranges = cpkRanges[engineCc];

  let condition: CpkData['condition'];
  if (totalCpk < ranges.mint) condition = 'Mint Condition';
  else if (totalCpk <= ranges.solid) condition = 'Solid Rider';
  else if (totalCpk <= ranges.fair) condition = 'Fair Runner';
  else if (totalCpk <= ranges.worn) condition = 'Worn Beater';
  else condition = 'Basket Case';

  return {
    totalCpk: parseFloat(totalCpk.toFixed(2)),
    fuelCpk: parseFloat((fuelSum / totalDistance).toFixed(2)),
    serviceCpk: parseFloat((serviceSum / totalDistance).toFixed(2)),
    fuelCpkPercent: Math.round((fuelSum / totalExpenses) * 100),
    serviceCpkPercent: Math.round((serviceSum / totalExpenses) * 100),
    condition,
    totalDistance,
  };
}


export function calculateStats(logs: FuelLog[], services: ServiceRecord[], engineCc: EngineCc): Stats {
  const sortedLogs = [...logs].sort((a, b) => b.odo - a.odo);
  const lastFuelOdo = sortedLogs.length > 0 ? sortedLogs[0].odo : 0;
  const lastServiceOdo = services.length > 0 ? Math.max(...services.map(s => s.odo)) : 0;
  const lastOdo = Math.max(lastFuelOdo, lastServiceOdo);

  const totalFuelCost = logs.reduce((sum, item) => sum + (parseFloat(String(item.amount)) || 0), 0);
  const totalServiceCost = services.reduce((sum, item) => sum + (parseFloat(String(item.totalCost)) || 0), 0);
  const totalOwnership = totalFuelCost + totalServiceCost;

  let avgMileage = 0;
  let costPerKm = 0;

  const allRecordsByOdo = [...logs.map(l => ({ odo: l.odo })), ...services.map(s => ({ odo: s.odo }))]
    .filter(r => r.odo)
    .sort((a, b) => a.odo - b.odo);
    
  const firstOdo = allRecordsByOdo.length > 0 ? allRecordsByOdo[0].odo : 0;
  const totalDistance = lastOdo - firstOdo;

  if (logs.length > 1) {
    const sortedByOdo = [...logs].sort((a, b) => a.odo - b.odo);
    const totalDistForFuel = sortedByOdo[sortedByOdo.length - 1].odo - sortedByOdo[0].odo;
    const fuelConsumed = logs.slice(0, -1).reduce((sum, item) => sum + (parseFloat(String(item.liters)) || 0), 0);
    avgMileage = fuelConsumed > 0 ? (totalDistForFuel / fuelConsumed) : 0;
  }

  if (totalDistance > 0) {
    costPerKm = totalOwnership / totalDistance;
  }

  let dailyAvg = 0;
  const allRecords = [...logs, ...services]
    .map(r => ({ date: new Date(r.date).getTime(), odo: parseInt(String(r.odo)) }))
    .filter(r => r.date && r.odo) // Filter out invalid records
    .sort((a, b) => a.date - b.date);

  if (allRecords.length >= 2) {
    const first = allRecords[0];
    const last = allRecords[allRecords.length - 1];
    const daysDiff = (last.date - first.date) / (1000 * 60 * 60 * 24);
    const distDiff = last.odo - first.odo;
    if (daysDiff > 0 && distDiff > 0) {
      dailyAvg = distDiff / daysDiff;
    }
  }

  const efficiencyStatus = avgMileage > 40 ? "Excellent" : (avgMileage > 25 ? "Average" : "Poor");

  let totalPartsChanged = 0;
  let totalOilChanges = 0;
  services.forEach(service => {
    service.parts.forEach(part => {
      if (part.name.toLowerCase().includes('oil')) {
        totalOilChanges += 1;
      } else {
        totalPartsChanged += 1;
      }
    });
  });

  const cpk = calculateCpk(logs, services, engineCc);

  return {
    lastOdo,
    totalFuelCost,
    totalServiceCost,
    totalOwnership: totalFuelCost + totalServiceCost,
    avgMileage: avgMileage.toFixed(1),
    costPerKm: costPerKm.toFixed(2),
    efficiencyStatus,
    dailyAvg: dailyAvg.toFixed(1),
    totalPartsChanged,
    totalOilChanges,
    cpk,
  };
}

export function getActiveReminders(services: ServiceRecord[], lastOdo: number): Reminder[] {
    const reminders: Reminder[] = [];
    const partMap: { [key: string]: Reminder['rawData'] } = {};

    [...services].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(s => {
      s.parts.forEach(p => {
        if (p.reminderType && p.reminderType !== 'none' && p.reminderValue) {
          partMap[p.name] = {
            lastOdo: s.odo,
            lastDate: s.date,
            reminderType: p.reminderType,
            reminderValue: parseFloat(p.reminderValue) || 0,
            currentUsed: 0 // will be calculated later
          };
        }
      });
    });

    Object.keys(partMap).forEach(name => {
      const data = partMap[name];
      let progress = 0;
      let label = "";
      let isDue = false;
      let currentUsed = 0;

      if (data.reminderType === 'km' && data.reminderValue > 0) {
        const used = lastOdo - data.lastOdo;
        currentUsed = used;
        progress = (used / data.reminderValue) * 100;
        label = `${used.toLocaleString()} / ${data.reminderValue.toLocaleString()} KM`;
        isDue = used >= data.reminderValue;
      } else if (data.reminderType === 'days' && data.reminderValue > 0) {
        const days = Math.floor((new Date().getTime() - new Date(data.lastDate).getTime()) / (1000 * 60 * 60 * 24));
        currentUsed = days;
        progress = (days / data.reminderValue) * 100;
        label = `${days} / ${data.reminderValue} Days`;
        isDue = days >= data.reminderValue;
      } else {
        return; // Skip if reminderValue is not set
      }

      reminders.push({ 
        name, 
        progress: Math.min(100, Math.max(0, progress)), 
        label, 
        isDue,
        rawData: { ...data, currentUsed }
      });
    });
    return reminders;
}


export function getExpenseChartData(logs: FuelLog[], services: ServiceRecord[]): ExpenseChartData[] {
  const expenses: { [key: string]: { fuel: number; service: number } } = {};
  const today = new Date();
  const last12Months: string[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const month = d.toLocaleString('default', { month: 'short' });
    const year = d.getFullYear();
    const key = `${month} '${String(year).slice(-2)}`;
    last12Months.push(key);
    expenses[key] = { fuel: 0, service: 0 };
  }

  logs.forEach(log => {
    const date = new Date(log.date);
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const key = `${month} '${String(year).slice(-2)}`;
    if (expenses[key]) {
      expenses[key].fuel += parseFloat(String(log.amount)) || 0;
    }
  });

  services.forEach(service => {
    const date = new Date(service.date);
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const key = `${month} '${String(year).slice(-2)}`;
    if (expenses[key]) {
      expenses[key].service += parseFloat(String(service.totalCost)) || 0;
    }
  });

  return last12Months.map(month => ({
    month,
    fuel: expenses[month].fuel,
    service: expenses[month].service,
  }));
}
