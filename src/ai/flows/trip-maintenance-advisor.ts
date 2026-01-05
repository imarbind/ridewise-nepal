'use server';

/**
 * @fileOverview A trip maintenance advisory AI agent.
 *
 * - getTripMaintenanceAdvisory - A function that handles the trip maintenance advisory process.
 * - TripMaintenanceAdvisoryInput - The input type for the getTripMaintenanceAdvisory function.
 * - TripMaintenanceAdvisoryOutput - The return type for the getTripMaintenanceAdvisory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TripMaintenanceAdvisoryInputSchema = z.object({
  destination: z.string().describe('The destination of the trip.'),
  startDate: z.string().describe('The start date of the trip (YYYY-MM-DD).'),
  distance: z.number().describe('The total distance of the trip in kilometers.'),
  durationDays: z.number().describe('The total duration of the trip in days.'),
  dailyAvgKm: z.number().describe('The average kilometers the vehicle is driven per day.'),
  currentOdometer: z.number().describe('The current odometer reading of the vehicle in kilometers.'),
  maintenanceTasks: z.array(
    z.object({
      name: z.string().describe('The name of the maintenance task (e.g., oil change, tire replacement).'),
      intervalType: z.enum(['km', 'days']).describe('The type of interval for the maintenance task.'),
      intervalValue: z.number().describe('The interval value for the maintenance task.'),
      lastPerformedOdometer: z.number().optional().describe('The odometer reading when the task was last performed (if intervalType is km).'),
      lastPerformedDate: z.string().optional().describe('The date when the task was last performed (YYYY-MM-DD) (if intervalType is days).'),
    })
  ).describe('An array of maintenance tasks and their details.'),
});

export type TripMaintenanceAdvisoryInput = z.infer<typeof TripMaintenanceAdvisoryInputSchema>;

const TripMaintenanceAdvisoryOutputSchema = z.object({
  advisory: z.array(
    z.object({
      taskName: z.string().describe('The name of the maintenance task.'),
      status: z.enum(['due_before', 'due_during', 'due_after', 'not_due']).describe('The status of the maintenance task relative to the trip.'),
      kilometersOverdue: z.number().optional().describe('How many kilometers the task is overdue if applicable'),
      daysOverdue: z.number().optional().describe('How many days the task is overdue if applicable'),
      message: z.string().describe('A message providing more details about the maintenance task status.'),
    })
  ).describe('An array of maintenance advisories for each task.'),
});

export type TripMaintenanceAdvisoryOutput = z.infer<typeof TripMaintenanceAdvisoryOutputSchema>;

export async function getTripMaintenanceAdvisory(input: TripMaintenanceAdvisoryInput): Promise<TripMaintenanceAdvisoryOutput> {
  return tripMaintenanceAdvisoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tripMaintenanceAdvisoryPrompt',
  input: { schema: TripMaintenanceAdvisoryInputSchema },
  output: { schema: TripMaintenanceAdvisoryOutputSchema },
  prompt: `You are an expert vehicle maintenance advisor. Your task is to analyze trip details and the vehicle's maintenance history to provide a clear and actionable maintenance advisory. The total expected distance for the trip is the trip distance plus the average daily usage over the trip duration.

Trip Details:
- Destination: {{destination}}
- Start Date: {{startDate}}
- Trip Distance: {{distance}} km
- Trip Duration: {{durationDays}} days
- Vehicle Daily Average Usage: {{dailyAvgKm}} km/day
- Current Odometer: {{currentOdometer}} km

Maintenance Tasks:
{{#each maintenanceTasks}}
- Task Name: {{name}}
  - Interval Type: {{intervalType}}
  - Interval Value: {{intervalValue}}
  {{#if lastPerformedOdometer}}
  - Last Performed Odometer: {{lastPerformedOdometer}} km
  {{/if}}
  {{#if lastPerformedDate}}
  - Last Performed Date: {{lastPerformedDate}}
  {{/if}}
{{/each}}

Follow these rules for your analysis:
1.  For each maintenance task, calculate its status based on the trip. The possible statuses are: 'due_before', 'due_during', 'due_after', 'not_due'.
2.  A task is 'due_before' if it is already past its maintenance interval at the 'Current Odometer' or before the 'Start Date'. If it is, specify by how many kilometers or days it is overdue.
3.  A task is 'due_during' if the maintenance interval will be exceeded within the total expected kilometers (trip distance + daily average usage during the trip) or during the trip's duration in days. For example, if an oil change is due every 3000 km, the last one was at 5000 km, and the current odometer is 7500 km, a 1000 km trip would make it due during the trip.
4.  For any task that is 'due_during', the message should strongly recommend getting the service done BEFORE the trip.
5.  **CRITICAL**: If a task is not 'due_during' but its usage will exceed 80% of its interval by the end of the trip (considering both distance and time), you MUST still flag it. Set its status to 'due_during' and provide a message like "This service will be over 80% of its service life during the trip. It's highly recommended to perform this maintenance beforehand to avoid issues."
6.  A task is 'due_after' if it is not due before or during the trip but will be due sometime after.
7.  A task is 'not_due' if it is well within its service life and will not be a concern for this trip. Provide a reassuring message.
8.  Provide a concise and informative 'message' for each task that explains the status and gives a clear recommendation.

Ensure your output is a valid JSON object matching the specified schema.
`,
});

const tripMaintenanceAdvisoryFlow = ai.defineFlow(
  {
    name: 'tripMaintenanceAdvisoryFlow',
    inputSchema: TripMaintenanceAdvisoryInputSchema,
    outputSchema: TripMaintenanceAdvisoryOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
