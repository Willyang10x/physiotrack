"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PlusCircle,
  Trash2,
  Save,
  ArrowLeft,
  Youtube,
  UploadCloud,
  Loader2,
  Library,
  Search
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createProtocolAction } from "@/app/actions/create-protocol";
import { AiGenerator } from "@/components/AiGenerator";

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  videoUrl: string;
}

interface Athlete {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
}

export default function CreateProtocolPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [exercises, setExercises] = useState<Exercise[]>([
    { name: "", sets: "", reps: "", rest: "", videoUrl: "" },
  ]);

  const [libraryExercises, setLibraryExercises] = useState<any[]>([]);
  const [searchLibrary, setSearchLibrary] = useState("");
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: athletesData } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .eq("role", "athlete")
        .eq("assigned_therapist_id", user.id);
      if (athletesData) setAthletes(athletesData);

      const { data: exData } = await supabase
        .from("exercises")
        .select("*")
        .eq("therapist_id", user.id)
        .order("name", { ascending: true });
      if (exData) setLibraryExercises(exData);
    }
    fetchData();
  }, [supabase]);

  const handleAiData = (data: any) => {
    if (data.title) setTitle(data.title);
    if (data.description) setDescription(data.description);

    if (data.exercises && Array.isArray(data.exercises)) {
      const aiExercises = data.exercises.map((ex: any) => ({
        name: ex.name || "",
        sets: String(ex.sets || ""),
        reps: String(ex.reps || ""),
        rest: String(ex.rest || ""),
        videoUrl: ex.videoUrl || "", 
      }));
      setExercises(aiExercises);
    }
  };

  const addExercise = () => {
    setExercises([
      ...exercises,
      { name: "", sets: "", reps: "", rest: "", videoUrl: "" },
    ]);
  };

  const addFromLibrary = (libEx: any) => {
    const newEx: Exercise = {
      name: libEx.name,
      sets: "3", 
      reps: "10", 
      rest: "60s", 
      videoUrl: libEx.video_url || "",
    };

    if (exercises.length === 1 && exercises[0].name === "") {
      setExercises([newEx]);
    } else {
      setExercises([...exercises, newEx]);
    }
    
    setIsLibraryOpen(false);
    setSearchLibrary("");
  };

  const removeExercise = (index: number) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    setExercises(newExercises);
  };

  const updateExercise = (index: number, field: keyof Exercise, value: string) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    setExercises(newExercises);
  };

  const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingIndex(index);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;
      const { error: uploadError } = await supabase.storage.from("videos").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("videos").getPublicUrl(filePath);
      updateExercise(index, "videoUrl", publicUrl);
    } catch (error: any) {
      alert("Erro ao enviar vídeo: " + error.message);
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAthlete || !title) {
      alert("Preencha atleta e título.");
      return;
    }
    setIsLoading(true);

    const result = await createProtocolAction({
      athlete_id: selectedAthlete,
      title,
      description,
      exercises,
    });

    if (!result.success) {
      alert("Erro: " + result.error);
      setIsLoading(false);
    } else {
      const athlete = athletes.find((a) => a.id === selectedAthlete);
      if (athlete && athlete.phone) {
        const cleanPhone = athlete.phone.replace(/\D/g, "");
        const appUrl = window.location.origin;
        const msg = `Olá ${athlete.full_name}, o seu novo protocolo de treino "${title}" já está disponível no PhysioTrack! 💪 Acesse aqui para iniciar: ${appUrl}`;
        const whatsUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
        window.open(whatsUrl, "_blank");
      }
      router.push("/dashboard");
    }
  };

  return (
    // Adicionado overflow-x-hidden para impedir scroll lateral acidental no telemóvel
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex justify-center overflow-x-hidden">
      <div className="w-full max-w-3xl space-y-6 pb-24">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="text-primary hover:bg-primary/10 shrink-0">
              <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-primary truncate">Novo Protocolo</h1>
          </div>
          <div className="w-full sm:w-auto">
             <AiGenerator onGenerate={handleAiData} />
          </div>
        </div>

        <Card className="shadow-sm border-t-4 border-t-primary">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-primary text-lg">Dados Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
            <div className="grid gap-2">
              <Label>Atleta</Label>
              <Select onValueChange={setSelectedAthlete} value={selectedAthlete}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {athletes.length > 0 ? (
                    athletes.map((a) => <SelectItem key={a.id} value={a.id}>{a.full_name}</SelectItem>)
                  ) : (
                    <div className="p-2 text-sm text-gray-500 text-center">Nenhum atleta vinculado.</div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Título</Label>
              <Input placeholder="Ex: Fortalecimento" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-white" />
            </div>
            <div className="grid gap-2">
              <Label>Instruções</Label>
              <Textarea placeholder="Detalhes..." value={description} onChange={(e) => setDescription(e.target.value)} className="bg-white min-h-[100px]" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          {/* Layout em coluna no mobile para não quebrar os botões */}
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b bg-gray-50/50 p-4 sm:p-6">
            <CardTitle className="text-primary text-lg">Exercícios</CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm" className="w-full sm:w-auto bg-secondary text-white hover:bg-secondary/90 shadow-sm">
                    <Library className="mr-2 h-4 w-4 shrink-0" /> Importar da Biblioteca
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] sm:max-w-md p-4 sm:p-6 rounded-xl">
                  <DialogHeader>
                    <DialogTitle className="text-primary flex items-center gap-2"><Library className="h-5 w-5" /> Sua Biblioteca</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="Buscar exercício..." className="pl-9" value={searchLibrary} onChange={(e) => setSearchLibrary(e.target.value)} />
                    </div>
                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                      {libraryExercises.filter(ex => ex.name.toLowerCase().includes(searchLibrary.toLowerCase())).map(ex => (
                        <div key={ex.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors" onClick={() => addFromLibrary(ex)}>
                          <div className="overflow-hidden pr-2">
                            <p className="font-bold text-sm text-gray-800 truncate">{ex.name}</p>
                            <p className="text-xs text-primary font-medium mt-0.5 truncate">{ex.category}</p>
                          </div>
                          <PlusCircle className="h-5 w-5 text-primary shrink-0" />
                        </div>
                      ))}
                      {libraryExercises.length === 0 && (
                         <div className="text-center py-6">
                           <p className="text-sm text-gray-500">Sua biblioteca está vazia.</p>
                         </div>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="sm" onClick={addExercise} className="w-full sm:w-auto border-primary/20 text-primary">
                <PlusCircle className="mr-2 h-4 w-4 shrink-0" /> Criar Manual
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 p-3 sm:p-6 pt-6">
            {exercises.map((exercise, index) => (
              <div key={index} className="grid gap-4 rounded-lg border border-gray-200 p-3 sm:p-4 bg-white shadow-sm hover:border-primary/30 transition-colors">
                <div className="flex justify-between items-start">
                  <Label className="font-bold text-primary text-base">Exercício {index + 1}</Label>
                  {exercises.length > 1 && (
                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 -mt-1 -mr-1" onClick={() => removeExercise(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-gray-500 font-semibold">Nome do Exercício</Label>
                    <Input placeholder="Ex: Agachamento Livre" value={exercise.name} onChange={(e) => updateExercise(index, "name", e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 font-semibold">Séries x Repetições</Label>
                    <div className="flex gap-2 mt-1 items-center">
                      <Input placeholder="3" value={exercise.sets} onChange={(e) => updateExercise(index, "sets", e.target.value)} className="min-w-[60px]" />
                      <span className="text-gray-400 font-medium">x</span>
                      <Input placeholder="12" value={exercise.reps} onChange={(e) => updateExercise(index, "reps", e.target.value)} className="min-w-[60px]" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 font-semibold">Descanso</Label>
                    <Input placeholder="60s" value={exercise.rest} onChange={(e) => updateExercise(index, "rest", e.target.value)} className="mt-1" />
                  </div>

                  <div className="sm:col-span-2 space-y-2 mt-2 pt-3 border-t">
                    <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                      <Youtube className="h-4 w-4 text-red-600" /> Vídeo Demonstrativo
                    </Label>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input placeholder="Cole link do YouTube ou..." value={exercise.videoUrl} onChange={(e) => updateExercise(index, "videoUrl", e.target.value)} className="flex-1" />
                      <div className="relative shrink-0">
                        <input type="file" accept="video/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(index, e)} disabled={uploadingIndex === index} />
                        <Button type="button" variant="outline" className="w-full sm:w-auto border-gray-300" disabled={uploadingIndex === index}>
                          {uploadingIndex === index ? <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" /> : <UploadCloud className="h-4 w-4 text-gray-600 mr-2" />}
                          <span className="sm:sr-only">Upload</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="sticky bottom-4 z-10 pt-2">
          <Button className="w-full text-lg shadow-xl h-14 bg-primary hover:bg-primary/90 rounded-full sm:rounded-md" size="lg" onClick={handleSubmit} disabled={isLoading || uploadingIndex !== null}>
            {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Salvando...</> : <><Save className="mr-2 h-5 w-5" /> Salvar Protocolo</>}
          </Button>
        </div>
      </div>
    </div>
  );
}