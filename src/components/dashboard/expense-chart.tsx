
"use client"

import React, { useMemo } from 'react';
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type ExpenseChartData = {
  month: string;
  fuel: number;
  service: number;
}

interface ExpenseChartProps {
    data: ExpenseChartData[];
}

const chartConfig = {
  fuel: {
    label: "Fuel",
    color: "hsl(142.1 76.2% 36.3%)",
  },
  service: {
    label: "Service",
    color: "hsl(346 100% 41%)",
  },
}

const CustomTooltip = React.memo(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border border-slate-200 rounded-2xl shadow-lg">
          <p className="font-bold text-sm text-slate-800">{label}</p>
          <p className="text-xs text-green-600">Fuel: रू {payload.find(p => p.dataKey === 'fuel')?.value?.toLocaleString() || 0}</p>
          <p className="text-xs text-primary">Service: रू {payload.find(p => p.dataKey === 'service')?.value?.toLocaleString() || 0}</p>
        </div>
      );
    }
    return null;
});
CustomTooltip.displayName = 'CustomTooltip';


const CustomLegend = React.memo(({ payload }: any) => {
    return (
        <div className="flex gap-4 justify-center mt-4">
        {payload?.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs font-medium text-slate-600">{entry.value}</span>
        </div>
        ))}
    </div>
    );
});
CustomLegend.displayName = 'CustomLegend';


export function ExpenseChart({ data }: ExpenseChartProps) {
  const chartContent = useMemo(() => {
    return (
      <>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
        <XAxis 
            dataKey="month" 
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            fontSize={10}
            className="text-muted-foreground"
        />
        <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            fontSize={10}
            tickFormatter={(value) => `रू${Number(value) / 1000}k`}
            className="text-muted-foreground"
        />
        <Tooltip
            cursor={{fill: 'hsl(var(--muted))'}}
            content={<CustomTooltip />}
        />
        <Legend content={<CustomLegend />} />
        <Bar dataKey="fuel" fill={chartConfig.fuel.color} radius={[4, 4, 0, 0]} />
        <Bar dataKey="service" fill={chartConfig.service.color} radius={[4, 4, 0, 0]} />
      </>
    );
  }, [data]);

  return (
    <Card className="border-slate-200 shadow-xl rounded-[2rem] bg-card/80 backdrop-blur-md mb-8 animate-in fade-in slide-in-from-bottom-4">
      <CardHeader>
        <CardTitle className="text-sm font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
            <TrendingUp size={14} className="text-primary"/> Monthly Expenses
        </CardTitle>
        <CardDescription className="text-xs">Last 12 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  {chartContent}
                </BarChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
