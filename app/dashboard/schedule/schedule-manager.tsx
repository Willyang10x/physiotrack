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

  const availableDates = appointments
    .filter(app => app.status === 'available')
    .map(app => new Date(app.start_time));

  const dailySlots = appointments.filter(app => {
    if (!date) return false;
    const appDate = new Date(app.start_time).toLocaleDateString('pt-BR');
    const selectedDate = date.toLocaleDateString('pt-BR');
    return appDate === selectedDate;
  });

  dailySlots.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

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
      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border lg:sticky lg:top-6 flex justify-center w-full">
        {/* Adicionado w-full e flex justify-center para o calendário não vazar da tela */}
        <div className="overflow-x-auto w-full flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={ptBR}
            className="rounded-md border p-2"
            modifiers={{ hasSlot: availableDates }}
            modifiersClassNames={{
              hasSlot: "relative font-bold text-blue-600 after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-blue-600 after:rounded-full"
            }}
          />
        </div>
      </div>

      <div className="space-y-6 w-full">
        <Card className="shadow-sm w-full">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl text-primary truncate">
              {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : "Selecione uma data"}
            </CardTitle>
            {loading && <RefreshCw className="h-5 w-5 animate-spin text-gray-400 shrink-0 ml-2"/>}
          </CardHeader>
          <CardContent className="pt-6 space-y-4 p-4 sm:p-6">
            
            {isTherapist && date && (
              // No mobile, os botões de adicionar horário ficam em coluna
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100 w-full">
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto flex-1">
                  <Input 
                    type="time" 
                    value={newTime} 
                    onChange={(e) => setNewTime(e.target.value)} 
                    className="w-full sm:w-32 bg-white shadow-sm font-medium h-10"
                  />
                  <Button onClick={handleAddSlot} disabled={loading} size="default" className="shadow-sm h-10 w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" /> Adicionar
                  </Button>
                </div>
                
                {dailySlots.some(slot => slot.status === 'available') && (
                  <Button 
                    onClick={handleClearDay} 
                    disabled={loading} 
                    variant="destructive" 
                    size="default" 
                    className="w-full md:w-auto shadow-sm h-10 mt-2 md:mt-0"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Limpar Dia
                  </Button>
                )}
              </div>
            )}

            <div className="space-y-3 w-full">
              {dailySlots.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 w-full">
                  <p className="text-gray-500 font-medium text-base sm:text-lg">Nenhum horário disponível aqui.</p>
                </div>
              ) : (
                dailySlots.map((slot) => {
                  const timeLabel = new Date(slot.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  const isMyBooking = slot.athlete_id === userId;

                  return (
                    <div key={slot.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 rounded-xl border ${slot.status === 'booked' ? 'bg-blue-50 border-blue-200' : 'bg-white shadow-sm transition-hover hover:border-gray-300'}`}>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full">
                        <span className="font-bold text-2xl text-gray-800">{timeLabel}</span>
                        
                        {/* Status (Livre/Reservado) */}
                        <div className="flex items-center">
                          {slot.status === 'available' && <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-block">Livre</span>}
                          {slot.status === 'booked' && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-block w-full sm:w-auto truncate max-w-[200px] sm:max-w-[250px]">
                              {isTherapist ? `Reserva: ${slot.profiles?.full_name?.split(' ')[0]}` : (isMyBooking ? "SEU AGENDAMENTO" : "OCUPADO")}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex w-full sm:w-auto justify-end mt-2 sm:mt-0">
                        {isTherapist && (
                          <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 w-full sm:w-10 h-10 bg-red-50 sm:bg-transparent" onClick={() => handleDeleteSlot(slot.id)}>
                            <Trash2 className="w-5 h-5 mr-2 sm:mr-0" />
                            <span className="sm:hidden font-medium">Apagar</span>
                          </Button>
                        )}
                        {!isTherapist && slot.status === 'available' && (
                          <Button onClick={() => handleBook(slot.id)} disabled={loading} className="font-bold shadow-sm w-full sm:w-auto">Reservar</Button>
                        )}
                        {!isTherapist && isMyBooking && (
                          <div className="flex items-center justify-center w-full sm:w-auto text-blue-600 gap-1.5 text-sm font-bold bg-blue-100 px-3 py-2 sm:py-1.5 rounded-lg sm:rounded-full">
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