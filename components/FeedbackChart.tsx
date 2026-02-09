"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeedbackData {
  date: string;
  pain_level: number;
  fatigue_level: number;
}

export function FeedbackChart({ data }: { data: FeedbackData[] }) {
  // Formata a data para ficar bonitinha (ex: 10/02)
  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem + "T00:00:00"); // Força timezone local
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução Recente</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          Nenhum feedback registrado ainda.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução: Dor vs. Cansaço (Últimos dias)</CardTitle>
      </CardHeader>
      <CardContent className="pl-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxis} 
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 10]} 
                tick={{ fontSize: 12, fill: "#6b7280" }} 
                axisLine={false}
                tickLine={false}
                ticks={[0, 2, 4, 6, 8, 10]}
              />
              <Tooltip 
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                labelFormatter={(label) => new Date(label + "T00:00:00").toLocaleDateString("pt-BR")}
              />
              <Legend verticalAlign="top" height={36}/>
              
              {/* Linha de DOR (Vermelha) */}
              <Line
                name="Nível de Dor"
                type="monotone"
                dataKey="pain_level"
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ r: 4, fill: "#ef4444" }}
                activeDot={{ r: 6 }}
              />

              {/* Linha de CANSAÇO (Azul) */}
              <Line
                name="Cansaço"
                type="monotone"
                dataKey="fatigue_level"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: "#3b82f6" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}