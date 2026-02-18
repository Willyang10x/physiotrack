"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { createSlot, bookSlot, cancelSlot } from "@/app/actions/schedule";
import { toast } from "sonner"; // Ou use alert se não tiver toast

interface Appointment {
  id: string;
  start_time: string;
  status: string;
  athlete_id: string | null;
  profiles?: { full_name: string };
}

export function ScheduleManager({ appointments, isTherapist, userId }: { appointments: Appointment[], isTherapist: boolean, userId: string }) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [newTime, setNewTime] = useState("09:00");
  const [loading, setLoading] = useState(false);

  // Filtra agendamentos do dia selecionado
  const dailySlots = appointments.filter(app => 
    date && isSameDay(parseISO(app.start_time), date)
  );

  // --- AÇÕES DO FISIO ---
  const handleAddSlot = async () => {
    if (!date) return;
    setLoading(true);
    const res = await createSlot(date, newTime);
    setLoading(false);
    if (res.error) alert(res.error);
    else alert("Horário liberado!");
  };

  const handleDeleteSlot = async (id: string) => {
    if(!confirm("Remover este horário?")) return;
    await cancelSlot(id);
  };

  // --- AÇÕES DO ATLETA ---
  const handleBook = async (id: string) => {
    if(!confirm("Confirmar agendamento?")) return;
    setLoading(true);
    const res = await bookSlot(id);
    setLoading(false);
    if (res.error) alert(res.error);
    else alert("Agendado com sucesso! 🎉");
  };

  return (
    <>
      <div className="bg-white p-4 rounded-xl shadow-sm border h-fit">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          locale={ptBR}
          className="rounded-md border"
        />
      </div>

      <Card className="h-fit min-h-[400px]">
        <CardHeader>
          <CardTitle>
            Horários para {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : "Selecione uma data"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* SE FOR FISIO: MOSTRA FORMULÁRIO DE CRIAR */}
          {isTherapist && date && (
            <div className="flex gap-2 mb-6 p-4 bg-gray-50 rounded-lg border">
              <Input 
                type="time" 
                value={newTime} 
                onChange={(e) => setNewTime(e.target.value)} 
                className="w-32 bg-white"
              />
              <Button onClick={handleAddSlot} disabled={loading} size="sm">
                <Plus className="w-4 h-4 mr-2" /> Liberar Horário
              </Button>
            </div>
          )}

          {/* LISTA DE HORÁRIOS */}
          <div className="space-y-2">
            {dailySlots.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Nenhum horário disponível neste dia.</p>
            ) : (
              dailySlots.map((slot) => {
                const timeLabel = format(parseISO(slot.start_time), "HH:mm");
                const isMyBooking = slot.athlete_id === userId;

                return (
                  <div key={slot.id} className={`flex items-center justify-between p-3 rounded-lg border ${slot.status === 'booked' ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
                    <div className="flex items-center gap-3">
                       <span className="font-bold text-lg text-gray-700">{timeLabel}</span>
                       
                       {/* ETIQUETAS DE STATUS */}
                       {slot.status === 'available' && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">LIVRE</span>}
                       {slot.status === 'booked' && (
                         <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
                           {isTherapist ? `Reservado: ${slot.profiles?.full_name}` : (isMyBooking ? "SEU AGENDAMENTO" : "OCUPADO")}
                         </span>
                       )}
                    </div>

                    {/* BOTÕES DE AÇÃO */}
                    <div>
                      {isTherapist && (
                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteSlot(slot.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}

                      {!isTherapist && slot.status === 'available' && (
                        <Button size="sm" onClick={() => handleBook(slot.id)} disabled={loading}>
                          Reservar
                        </Button>
                      )}

                      {!isTherapist && isMyBooking && (
                         <div className="flex items-center text-blue-600 gap-1 text-sm font-bold">
                            <CheckCircle2 className="w-5 h-5" /> Confirmado
                         </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}