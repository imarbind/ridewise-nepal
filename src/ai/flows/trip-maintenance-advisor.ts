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
  prompt: `You are an expert vehicle maintenance advisor. You will analyze the trip details and maintenance tasks to provide a maintenance advisory.

Trip Details:
- Destination: {{destination}}
- Start Date: {{startDate}}
- Distance: {{distance}} km
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

Analyze the trip details and maintenance tasks. Determine the status of each maintenance task relative to the trip (due before, due during, due after, or not due).  For any tasks that are overdue, include how many kilometers or days the task is overdue.

Provide a concise and informative maintenance advisory for each task. The advisory should include the task name, status, and a message providing more details.

Ensure that the output is valid JSON.
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
