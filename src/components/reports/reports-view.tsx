'use client';

import { useMemo } from 'react';
import { Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subMonths, getMonth, getYear } from 'date-fns';
import type { FuelLog, ServiceRecord } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface ReportsViewProps {
  fuelLogs: FuelLog[];
  serviceLogs: ServiceRecord[];
}

export function ReportsView({ fuelLogs, serviceLogs }: ReportsViewProps) {
  const { mileageData, monthlyCostData } = useMemo(() => {
    const sortedFuelLogs = [...fuelLogs]
      .filter(log => log.liters > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const mileageData: { date: string; kml: number }[] = [];
    for (let i = 1; i < sortedFuelLogs.length; i++) {
      const prevLog = sortedFuelLogs[i - 1];
      const currentLog = sortedFuelLogs[i];
      const distance = currentLog.odo - prevLog.odo;
      if (distance > 0 && currentLog.liters > 0) {
        const kml = distance / currentLog.liters;
        if (kml < 100) { // Basic outlier removal
          mileageData.push({
            date: format(new Date(currentLog.date), 'MMM d'),
            kml: parseFloat(kml.toFixed(2)),
          });
        }
      }
    }

    const now = new Date();
    const monthlyCostMap = new Map<string, { fuel: number; service: number }>();

    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthKey = format(monthDate, 'yyyy-MM');
      monthlyCostMap.set(monthKey, { fuel: 0, service: 0 });
    }

    fuelLogs.forEach(log => {
      const monthKey = format(new Date(log.date), 'yyyy-MM');
      if (monthlyCostMap.has(monthKey)) {
        monthlyCostMap.get(monthKey)!.fuel += log.amount;
      }
    });

    serviceLogs.forEach(log => {
      const monthKey = format(new Date(log.date), 'yyyy-MM');
      if (monthlyCostMap.has(monthKey)) {
        monthlyCostMap.get(monthKey)!.service += log.totalCost;
      }
    });

    const monthlyCostData = Array.from(monthlyCostMap.entries()).map(([key, value]) => ({
      month: format(new Date(key + '-02'), 'MMM'),
      fuel: value.fuel,
      service: value.service,
    }));

    return { mileageData: mileageData.slice(-10), monthlyCostData };
  }, [fuelLogs, serviceLogs]);

  return (
    <div className="pb-32 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Reports</h1>
      
        <Card className="rounded-3xl shadow-lg border-slate-200">
            <CardHeader>
                <CardTitle>Mileage Trend (KM/L)</CardTitle>
            </CardHeader>
            <CardContent>
                {mileageData.length > 1 ? (
                    <ChartContainer config={{}} className="h-[250px] w-full">
                        <LineChart data={mileageData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                            <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={{ stroke: 'hsl(var(--border))' }} />
                            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={{ stroke: 'hsl(var(--border))' }} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="kml" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--primary))' }} />
                        </LineChart>
                    </ChartContainer>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-10">Not enough data to display mileage trend. At least two fuel logs are needed.</p>
                )}
            </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-lg border-slate-200">
            <CardHeader>
                <CardTitle>Monthly Costs (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
                 {monthlyCostData.some(d => d.fuel > 0 || d.service > 0) ? (
                    <ChartContainer config={{}} className="h-[250px] w-full">
                        <BarChart data={monthlyCostData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                            <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={{ stroke: 'hsl(var(--border))' }} />
                            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={{ stroke: 'hsl(var(--border))' }} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="fuel" fill="hsl(var(--chart-1))" stackId="a" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="service" fill="hsl(var(--chart-2))" stackId="a" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                 ) : (
                    <p className="text-sm text-muted-foreground text-center py-10">No cost data available for the last 6 months.</p>
                 )}
            </CardContent>
        </Card>
    </div>
  );
}
