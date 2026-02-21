"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Trash2, CheckCircle2, RefreshCw } from "lucide-react";
import { createSlot, bookSlot, cancelSlot, clearDaySlots } from "@/app/actions/schedule";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  // Filtra os horários para o dia selecionado
  const dailySlots = appointments.filter(app => {
    if (!date) return false;
    const appDate = new Date(app.start_time).toLocaleDateString('pt-BR');
    const selectedDate = date.toLocaleDateString('pt-BR');
    return appDate === selectedDate;
  });

  dailySlots.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // --- AÇÕES ---
  const handleAddSlot = async () => {
    if (!date) return;
    setLoading(true);
    
    const [hours, minutes] = newTime.split(":").map(Number);
    const finalDate = new Date(date);
    finalDate.setHours(hours, minutes, 0, 0);
    
    const res = await createSlot(finalDate.toISOString());
    
    if (res.error) alert("Erro ao salvar: " + res.error);
    else router.refresh(); 
    
    setLoading(false);
  };

  const handleDeleteSlot = async (id: string) => {
    if(!confirm("Remover este horário?")) return;
    setLoading(true);
    await cancelSlot(id);
    router.refresh();
    setLoading(false);
  };

  const handleClearDay = async () => {
    if (!date) return;
    if (!confirm("Tem certeza que deseja apagar TODOS os horários LIVRES deste dia?")) return;
    
    setLoading(true);
    const res = await clearDaySlots(date.toISOString());
    
    if (res.error) alert("Erro ao limpar: " + res.error);
    else router.refresh();
    
    setLoading(false);
  };

  const handleBook = async (id: string) => {
    if(!confirm("Confirmar agendamento?")) return;
    setLoading(true);
    const res = await bookSlot(id);
    if (res.error) alert(res.error);
    else {
      alert("Agendado com sucesso! 🎉");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <>
      <div className="bg-white p-4 rounded-xl shadow-sm border sticky top-6">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          locale={ptBR}
          className="rounded-md border mx-auto"
        />
      </div>

      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <CardTitle className="text-xl text-primary">
              {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : "Selecione uma data"}
            </CardTitle>
            {loading && <RefreshCw className="h-5 w-5 animate-spin text-gray-400"/>}
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            
            {isTherapist && date && (
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Input 
                    type="time" 
                    value={newTime} 
                    onChange={(e) => setNewTime(e.target.value)} 
                    className="w-32 bg-white shadow-sm font-medium"
                  />
                  <Button onClick={handleAddSlot} disabled={loading} size="default" className="shadow-sm">
                    <Plus className="w-4 h-4 mr-2" /> Adicionar
                  </Button>
                </div>
                
                {dailySlots.some(slot => slot.status === 'available') && (
                  <Button 
                    onClick={handleClearDay} 
                    disabled={loading} 
                    variant="destructive" 
                    size="default" 
                    className="w-full sm:w-auto sm:ml-auto shadow-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Limpar Dia
                  </Button>
                )}
              </div>
            )}

            <div className="space-y-3">
              {dailySlots.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                  <p className="text-gray-500 font-medium text-lg">Nenhum horário disponível aqui.</p>
                </div>
              ) : (
                dailySlots.map((slot) => {
                  const timeLabel = new Date(slot.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  const isMyBooking = slot.athlete_id === userId;

                  return (
                    <div key={slot.id} className={`flex items-center justify-between p-4 rounded-xl border ${slot.status === 'booked' ? 'bg-blue-50 border-blue-200' : 'bg-white shadow-sm'}`}>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-2xl text-gray-800">{timeLabel}</span>
                        {slot.status === 'available' && <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold uppercase">Livre</span>}
                        {slot.status === 'booked' && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold uppercase">
                            {isTherapist ? `Reservado: ${slot.profiles?.full_name?.split(' ')[0]}` : (isMyBooking ? "SEU AGENDAMENTO" : "OCUPADO")}
                          </span>
                        )}
                      </div>

                      <div>
                        {isTherapist && (
                          <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteSlot(slot.id)}>
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        )}
                        {!isTherapist && slot.status === 'available' && (
                          <Button onClick={() => handleBook(slot.id)} disabled={loading}>Reservar</Button>
                        )}
                        {!isTherapist && isMyBooking && (
                          <div className="flex items-center text-blue-600 gap-1.5 text-sm font-bold bg-blue-100 px-3 py-1.5 rounded-full">
                            <CheckCircle2 className="w-4 h-4" /> Confirmado
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
      </div>
    </>
  );
}