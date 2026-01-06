'use client';

import { useMemo } from 'react';
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subMonths, getMonth, getYear } from 'date-fns';
import type { FuelLog, ServiceRecord } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface ReportsViewProps {
  fuelLogs: FuelLog[];
  serviceLogs: ServiceRecord[];
}

const CHART_COLORS = {
  fuel: 'hsl(var(--chart-1))',
  service: 'hsl(var(--chart-2))',
  mileage: 'hsl(var(--primary))',
  odo: 'hsl(var(--chart-3))',
  price: 'hsl(var(--chart-4))',
};

export function ReportsView({ fuelLogs, serviceLogs }: ReportsViewProps) {
  const {
    mileageData,
    monthlyCostData,
    costDistributionData,
    odoProgressionData,
    fuelPriceData,
  } = useMemo(() => {
    // --- Mileage Data Calculation ---
    const sortedFuelLogsForMileage = [...fuelLogs]
      .filter(log => log.liters > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const mileageData: { date: string; kml: number }[] = [];
    for (let i = 1; i < sortedFuelLogsForMileage.length; i++) {
      const prevLog = sortedFuelLogsForMileage[i - 1];
      const currentLog = sortedFuelLogsForMileage[i];
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

    // --- Monthly Cost Data Calculation ---
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
      fuel: Math.round(value.fuel),
      service: Math.round(value.service),
    }));

    // --- Cost Distribution Data Calculation ---
    const totalFuelCost = fuelLogs.reduce((sum, log) => sum + log.amount, 0);
    const totalServiceCost = serviceLogs.reduce((sum, log) => sum + log.totalCost, 0);
    const costDistributionData = [
      { name: 'Fuel', value: totalFuelCost, fill: CHART_COLORS.fuel },
      { name: 'Service', value: totalServiceCost, fill: CHART_COLORS.service },
    ].filter(item => item.value > 0);

    // --- Odometer Progression Data ---
    const allRecords = [
        ...fuelLogs.map(l => ({ date: l.date, odo: l.odo })),
        ...serviceLogs.map(s => ({ date: s.date, odo: s.odo })),
    ].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const odoProgressionData = allRecords.map(rec => ({
        date: format(new Date(rec.date), 'MMM d'),
        odometer: rec.odo,
    }));
    
    // --- Fuel Price Data ---
    const fuelPriceData = [...fuelLogs]
        .filter(log => log.price > 0)
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(log => ({
            date: format(new Date(log.date), 'MMM d'),
            price: log.price,
        }));


    return {
      mileageData: mileageData.slice(-10),
      monthlyCostData,
      costDistributionData,
      odoProgressionData,
      fuelPriceData,
    };
  }, [fuelLogs, serviceLogs]);

  return (
    <div className="pb-32 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-3xl shadow-lg border-slate-200 md:col-span-2">
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
                  <Legend />
                  <Bar dataKey="fuel" name="Fuel" fill={CHART_COLORS.fuel} stackId="a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="service" name="Service" fill={CHART_COLORS.service} stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">No cost data available for the last 6 months.</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle>Total Cost Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {costDistributionData.length > 0 ? (
              <ChartContainer config={{}} className="h-[250px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  <Pie
                    data={costDistributionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
                            {`${(percent * 100).toFixed(0)}%`}
                        </text>
                        );
                    }}
                  >
                    {costDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">No cost data to display.</p>
            )}
          </CardContent>
        </Card>

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
                            <Line type="monotone" dataKey="kml" stroke={CHART_COLORS.mileage} strokeWidth={3} dot={{ r: 4, fill: CHART_COLORS.mileage }} />
                        </LineChart>
                    </ChartContainer>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-10">Not enough data to display mileage trend. At least two fuel logs are needed.</p>
                )}
            </CardContent>
        </Card>

         <Card className="rounded-3xl shadow-lg border-slate-200">
            <CardHeader>
                <CardTitle>Odometer Progression (KM)</CardTitle>
            </CardHeader>
            <CardContent>
                {odoProgressionData.length > 1 ? (
                    <ChartContainer config={{}} className="h-[250px] w-full">
                        <LineChart data={odoProgressionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                            <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={{ stroke: 'hsl(var(--border))' }} />
                            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={{ stroke: 'hsl(var(--border))' }} domain={['dataMin - 1000', 'dataMax + 1000']} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="odometer" stroke={CHART_COLORS.odo} strokeWidth={3} dot={false} />
                        </LineChart>
                    </ChartContainer>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-10">Not enough data to display odometer progression.</p>
                )}
            </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-lg border-slate-200">
            <CardHeader>
                <CardTitle>Fuel Price Trend (per Liter)</CardTitle>
            </CardHeader>
            <CardContent>
                {fuelPriceData.length > 1 ? (
                    <ChartContainer config={{}} className="h-[250px] w-full">
                        <LineChart data={fuelPriceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                            <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={{ stroke: 'hsl(var(--border))' }} />
                            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickLine={{ stroke: 'hsl(var(--border))' }} domain={['dataMin - 5', 'dataMax + 5']}/>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="price" stroke={CHART_COLORS.price} strokeWidth={3} dot={{ r: 4, fill: CHART_COLORS.price }} />
                        </LineChart>
                    </ChartContainer>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-10">Not enough fuel price data to display a trend.</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
