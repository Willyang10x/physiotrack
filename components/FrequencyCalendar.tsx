"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useState } from "react";

interface FrequencyCalendarProps {
  dates: string[]; // Dias treinados
  startDate: string; // Quando começou o protocolo (para calcular faltas)
}

export function FrequencyCalendar({
  dates,
  startDate,
}: FrequencyCalendarProps) {
  const [year, setYear] = useState(new Date().getFullYear());

  const activeDates = new Set(dates);
  const start = new Date(startDate);
  const today = new Date(); // Data de hoje para não marcar falta no futuro

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const getDaysInMonth = (month: number, year: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) =>
    new Date(year, month, 1).getDay();

  return (
    <Card className="border-t-4 border-t-primary shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-primary flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" /> Frequência
        </CardTitle>
        <div className="flex items-center gap-2 bg-muted rounded-md p-1">
          <button
            onClick={() => setYear(year - 1)}
            className="p-1 hover:bg-white rounded-sm transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-primary" />
          </button>
          <span className="text-sm font-bold text-primary min-w-[3rem] text-center">
            {year}
          </span>
          <button
            onClick={() => setYear(year + 1)}
            className="p-1 hover:bg-white rounded-sm transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-primary" />
          </button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {months.map((monthName, monthIndex) => {
            const daysInMonth = getDaysInMonth(monthIndex, year);
            const startDay = getFirstDayOfMonth(monthIndex, year);
            const emptySlots = Array.from({ length: startDay });
            const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

            return (
              <div
                key={monthName}
                className="border rounded-lg p-3 bg-white/50"
              >
                <div className="flex justify-between items-baseline mb-2">
                  <h4 className="font-semibold text-sm text-primary">
                    {monthName}
                  </h4>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                  {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                    <span
                      key={i}
                      className="text-[10px] text-muted-foreground font-medium"
                    >
                      {d}
                    </span>
                  ))}

                  {emptySlots.map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}

                  {days.map((day) => {
                    // Monta a data do dia atual do loop
                    const dateStr = `${year}-${String(monthIndex + 1).padStart(
                      2,
                      "0"
                    )}-${String(day).padStart(2, "0")}`;
                    const currentObj = new Date(year, monthIndex, day);

                    // Lógicas de Estado
                    const isDone = activeDates.has(dateStr);
                    // É falta se: Não fez E a data é depois do início E a data é antes de hoje
                    const isMissed =
                      !isDone &&
                      currentObj >= start &&
                      currentObj < new Date(today.setHours(0, 0, 0, 0));

                    let bgClass = "text-gray-400 hover:bg-gray-100"; // Padrão (Futuro ou antes do início)

                    if (isDone) {
                      bgClass = "bg-secondary text-white font-bold shadow-sm"; // Feito (Laranja)
                    } else if (isMissed) {
                      bgClass = "bg-destructive/10 text-destructive font-bold"; // Falta (Vermelho Claro)
                    }

                    return (
                      <div
                        key={day}
                        title={
                          isDone ? "Treino Feito" : isMissed ? "Falta" : ""
                        }
                        className={`h-6 w-6 flex items-center justify-center text-[10px] rounded-sm transition-all ${bgClass}`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-secondary rounded-sm"></div>
            <span>Treino Feito</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-destructive/10 rounded-sm"></div>
            <span>Não Realizado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
