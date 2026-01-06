
import type { FuelLog, ServiceRecord, Stats, Reminder, EngineCc, CpkData, NextServiceInfo, ManualReminder } from './types';
import { differenceInDays, addDays } from 'date-fns';

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

function calculateMileageStats(logs: FuelLog[]): { avg: number; last: number; best: number } {
  if (logs.length < 2) return { avg: 0, last: 0, best: 0 };

  const sortedLogs = [...logs].sort((a, b) => a.odo - b.odo);
  const allCalculatedMileages: number[] = [];

  // Full-tank to full-tank calculations
  const fullTankIndices: number[] = [];
  sortedLogs.forEach((log, index) => {
    if (log.tankStatus === 'full') {
      fullTankIndices.push(index);
    }
  });

  for (let i = 0; i < fullTankIndices.length - 1; i++) {
    const firstFullIndex = fullTankIndices[i];
    const secondFullIndex = fullTankIndices[i + 1];
    
    const distance = sortedLogs[secondFullIndex].odo - sortedLogs[firstFullIndex].odo;
    let fuelConsumed = 0;
    for (let j = firstFullIndex + 1; j <= secondFullIndex; j++) {
      fuelConsumed += sortedLogs[j].liters;
    }

    if (distance > 0 && fuelConsumed > 0) {
      allCalculatedMileages.push(distance / fuelConsumed);
    }
  }

  // Fallback to estimated mileages if no full-tank calculations are possible
  if (allCalculatedMileages.length === 0) {
    sortedLogs.forEach(log => {
      if (log.estimatedMileage && log.estimatedMileage > 0) {
        allCalculatedMileages.push(log.estimatedMileage);
      }
    });
  }

  if (allCalculatedMileages.length === 0) return { avg: 0, last: 0, best: 0 };

  const totalMileage = allCalculatedMileages.reduce((sum, m) => sum + m, 0);
  const avg = totalMileage / allCalculatedMileages.length;
  const last = allCalculatedMileages[allCalculatedMileages.length - 1];
  const best = Math.max(...allCalculatedMileages);

  return { avg, last, best };
}


export function calculateStats(logs: FuelLog[], services: ServiceRecord[], engineCc: EngineCc): Stats {
  const actualFuelLogs = logs.filter(log => log.liters > 0 || log.amount > 0);
  
  const sortedLogs = [...logs].sort((a, b) => b.odo - a.odo);
  const lastFuelOdo = sortedLogs.length > 0 ? sortedLogs[0].odo : 0;
  
  const sortedServices = [...services].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastServiceOdo = sortedServices.length > 0 ? sortedServices[0].odo : 0;
  const lastServiceDate = sortedServices.length > 0 ? sortedServices[0].date : null;

  const lastOdo = Math.max(lastFuelOdo, lastServiceOdo);

  const totalFuelCost = actualFuelLogs.reduce((sum, item) => sum + (parseFloat(String(item.amount)) || 0), 0);
  const totalServiceCost = services.reduce((sum, item) => sum + (parseFloat(String(item.totalCost)) || 0), 0);
  const totalOwnership = totalFuelCost + totalServiceCost;
  
  const totalFuelLiters = actualFuelLogs.reduce((sum, item) => sum + (parseFloat(String(item.liters)) || 0), 0);

  const { avg: avgMileage, last: lastMileage, best: bestMileage } = calculateMileageStats(actualFuelLogs);

  const allRecordsByOdo = [...logs.map(l => ({ odo: l.odo })), ...services.map(s => ({ odo: s.odo }))]
    .filter(r => r.odo)
    .sort((a, b) => a.odo - b.odo);
    
  const firstOdo = allRecordsByOdo.length > 0 ? allRecordsByOdo[0].odo : 0;
  const totalDistance = lastOdo - firstOdo;
  
  const costPerKm = totalDistance > 0 ? totalOwnership / totalDistance : 0;

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

  const cpk = calculateCpk(actualFuelLogs, services, engineCc);

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
    totalServices: services.length,
    totalFuelLiters,
    lastMileage: lastMileage.toFixed(1),
    bestMileage: bestMileage.toFixed(1),
    totalFuelLogs: actualFuelLogs.length,
    lastServiceDate,
  };
}

export function getActiveReminders(services: ServiceRecord[], manualReminders: ManualReminder[], lastOdo: number, dailyAvgKm: number): Reminder[] {
    const reminders: Reminder[] = [];
    const partMap: { [key: string]: Reminder['rawData'] } = {};
    const now = new Date();

    // Process reminders from service parts
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
      let remainingDays: number;
      let estimatedDueDate: Date;

      if (data.reminderType === 'km' && data.reminderValue > 0) {
        const usedKm = lastOdo - data.lastOdo;
        currentUsed = usedKm;
        progress = (usedKm / data.reminderValue) * 100;
        label = `${usedKm.toLocaleString()} / ${data.reminderValue.toLocaleString()} KM`;
        isDue = usedKm >= data.reminderValue;

        const remainingKm = data.reminderValue - usedKm;
        const daysForRemainingKm = (dailyAvgKm > 0) ? Math.ceil(remainingKm / dailyAvgKm) : Infinity;
        remainingDays = isDue ? 0 : daysForRemainingKm;
        estimatedDueDate = addDays(now, remainingDays);

      } else if (data.reminderType === 'days' && data.reminderValue > 0) {
        const usedDays = differenceInDays(now, new Date(data.lastDate));
        currentUsed = usedDays;
        progress = (usedDays / data.reminderValue) * 100;
        label = `${usedDays} / ${data.reminderValue} Days`;
        isDue = usedDays >= data.reminderValue;
        
        remainingDays = isDue ? 0 : data.reminderValue - usedDays;
        estimatedDueDate = addDays(new Date(data.lastDate), data.reminderValue);

      } else {
        return; // Skip if reminderValue is not set
      }

      reminders.push({ 
        name, 
        progress: Math.min(100, Math.max(0, progress)), 
        label, 
        isDue,
        remainingDays,
        estimatedDueDate,
        rawData: { ...data, currentUsed }
      });
    });

    // Process manual reminders
    manualReminders.forEach(reminder => {
      if (reminder.isCompleted) return;

      let byDate: Reminder | null = null;
      if (reminder.date) {
        const dueDate = new Date(reminder.date);
        const lastServiceDate = services.length > 0 ? new Date(services[services.length - 1].date) : new Date(0);
        const totalDuration = differenceInDays(dueDate, lastServiceDate);
        const usedDays = differenceInDays(now, lastServiceDate);
        const progress = totalDuration > 0 ? (usedDays / totalDuration) * 100 : 0;
        const remainingDays = differenceInDays(dueDate, now);
        byDate = {
          name: reminder.notes || 'General Service',
          progress: Math.min(100, progress),
          label: `${usedDays} / ${totalDuration} Days`,
          isDue: now >= dueDate,
          remainingDays: Math.max(0, remainingDays),
          estimatedDueDate: dueDate,
          rawData: { lastOdo: lastOdo, lastDate: now.toISOString(), reminderType: 'days', reminderValue: totalDuration, currentUsed: usedDays }
        };
      }

      let byOdo: Reminder | null = null;
      if (reminder.odo > 0) {
        const dueOdo = reminder.odo;
        const lastServiceOdo = services.length > 0 ? services[services.length-1].odo : 0;
        const totalKm = dueOdo - lastServiceOdo;
        const usedKm = lastOdo - lastServiceOdo;
        const progress = totalKm > 0 ? (usedKm / totalKm) * 100 : 0;
        const remainingKm = dueOdo - lastOdo;
        const remainingDays = (dailyAvgKm > 0) ? Math.ceil(remainingKm / dailyAvgKm) : Infinity;
        byOdo = {
          name: reminder.notes || 'General Service',
          progress: Math.min(100, progress),
          label: `${usedKm.toLocaleString()} / ${totalKm.toLocaleString()} KM`,
          isDue: lastOdo >= dueOdo,
          remainingDays: Math.max(0, remainingDays),
          estimatedDueDate: addDays(now, Math.max(0, remainingDays)),
          rawData: { lastOdo: lastServiceOdo, lastDate: now.toISOString(), reminderType: 'km', reminderValue: totalKm, currentUsed: usedKm }
        };
      }
      
      // Add the one that is due sooner
      if (byDate && byOdo) {
        if (byDate.remainingDays <= byOdo.remainingDays) {
          reminders.push(byDate);
        } else {
          reminders.push(byOdo);
        }
      } else if (byDate) {
        reminders.push(byDate);
      } else if (byOdo) {
        reminders.push(byOdo);
      }
    });


    return reminders;
}


export function getNextService(reminders: Reminder[], lastServiceDate: string | null): NextServiceInfo {
    if (reminders.length === 0) {
        return {
            lastServiceDate: lastServiceDate,
            nextServiceDate: null,
            daysToNextService: null,
            tasks: [],
            progress: 0
        };
    }

    // Sort reminders by remaining days (whichever comes first)
    const sortedReminders = [...reminders].sort((a, b) => a.remainingDays - b.remainingDays);

    const nextDueReminder = sortedReminders[0];

    // Find all tasks that are due on or before the next service date
    const nextServiceDate = nextDueReminder.estimatedDueDate;
    const tasksForNextService = sortedReminders
        .filter(r => r.remainingDays <= nextDueReminder.remainingDays)
        .map(r => r.name);
    
    // Use the progress of the most urgent task
    const progress = nextDueReminder.progress;

    return {
        lastServiceDate: lastServiceDate,
        nextServiceDate: nextServiceDate,
        daysToNextService: nextDueReminder.remainingDays,
        tasks: tasksForNextService,
        progress: Math.min(100, Math.max(0, progress)),
    };
}
