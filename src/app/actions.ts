"use server";

import { getTripMaintenanceAdvisory, TripMaintenanceAdvisoryInput, TripMaintenanceAdvisoryOutput } from "@/ai/flows/trip-maintenance-advisor";
import { Reminder, ServiceRecord } from "@/lib/types";

function getMaintenanceTasks(services: ServiceRecord[], lastOdo: number) {
    const taskMap = new Map<string, { lastPerformedOdometer?: number; lastPerformedDate?: string; intervalType: 'km' | 'days'; intervalValue: number }>();

    services.forEach(service => {
        service.parts.forEach(part => {
            if (part.reminderType !== 'none' && Number(part.reminderValue) > 0) {
                const existing = taskMap.get(part.name);
                const serviceDate = new Date(service.date);
                
                let update = false;
                if (!existing) {
                    update = true;
                } else if (part.reminderType === 'km' && service.odo > (existing.lastPerformedOdometer || 0)) {
                    update = true;
                } else if (part.reminderType === 'days' && serviceDate.getTime() > new Date(existing.lastPerformedDate || 0).getTime()) {
                    update = true;
                }

                if (update) {
                    taskMap.set(part.name, {
                        intervalType: part.reminderType,
                        intervalValue: Number(part.reminderValue),
                        lastPerformedOdometer: service.odo,
                        lastPerformedDate: service.date
                    });
                }
            }
        });
    });
    
    return Array.from(taskMap.entries()).map(([name, details]) => ({ name, ...details }));
}


export async function getTripMaintenanceAdviceAction(
    destination: string,
    startDate: string,
    distance: number,
    currentOdometer: number,
    services: ServiceRecord[]
): Promise<TripMaintenanceAdvisoryOutput | { error: string }> {

    if (!destination || !startDate || !distance || !currentOdometer) {
        return { error: "Missing trip details." };
    }

    try {
        const maintenanceTasks = getMaintenanceTasks(services, currentOdometer);
        
        const input: TripMaintenanceAdvisoryInput = {
            destination,
            startDate,
            distance,
            currentOdometer,
            maintenanceTasks
        };
        
        const result = await getTripMaintenanceAdvisory(input);
        return result;

    } catch (e) {
        console.error("Error getting trip maintenance advice:", e);
        return { error: "Failed to get maintenance advice from AI." };
    }
}
