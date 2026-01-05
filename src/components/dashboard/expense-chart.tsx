"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

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
    color: "hsl(var(--primary))",
  },
  service: {
    label: "Service",
    color: "hsl(var(--chart-2))",
  },
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  return (
    <Card className="border-slate-200 shadow-xl rounded-[2rem] bg-card/80 backdrop-blur-md mb-8 animate-in fade-in slide-in-from-bottom-4">
      <CardHeader>
        <CardTitle className="text-sm font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
            <TrendingUp size={14} className="text-primary"/> Monthly Expenses
        </CardTitle>
        <CardDescription className="text-xs">Last 12 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
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
                     <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Legend content={({ payload }) => (
                         <div className="flex gap-4 justify-center mt-4">
                            {payload?.map((entry, index) => (
                            <div key={`item-${index}`} className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-xs font-medium text-slate-600">{entry.value}</span>
                            </div>
                            ))}
                        </div>
                    )} />
                    <Bar dataKey="fuel" fill="var(--color-fuel)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="service" fill="var(--color-service)" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
