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
  PlusCircle,
  Trash2,
  Save,
  ArrowLeft,
  Youtube,
  UploadCloud,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
// IMPORTANTE: Importamos a Server Action aqui
import { createProtocolAction } from "@/app/actions/create-protocol";

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
}

export default function CreateProtocolPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [exercises, setExercises] = useState<Exercise[]>([
    { name: "", sets: "", reps: "", rest: "", videoUrl: "" },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchAthletes() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "athlete")
        .eq("assigned_therapist_id", user.id);

      if (data) setAthletes(data);
    }
    fetchAthletes();
  }, []);

  const addExercise = () => {
    setExercises([
      ...exercises,
      { name: "", sets: "", reps: "", rest: "", videoUrl: "" },
    ]);
  };

  const removeExercise = (index: number) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    setExercises(newExercises);
  };

  const updateExercise = (
    index: number,
    field: keyof Exercise,
    value: string
  ) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    setExercises(newExercises);
  };

  const handleFileUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setUploadingIndex(index);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("videos").getPublicUrl(filePath);

      updateExercise(index, "videoUrl", publicUrl);
    } catch (error: any) {
      alert("Erro ao enviar vídeo: " + error.message);
    } finally {
      setUploadingIndex(null);
    }
  };

  // --- AQUI ESTÁ A MUDANÇA PRINCIPAL ---
  const handleSubmit = async () => {
    if (!selectedAthlete || !title) {
      alert("Preencha atleta e título.");
      return;
    }
    
    setIsLoading(true);

    // Chamamos a Server Action em vez de fazer o insert direto aqui
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
      // Sucesso! Redireciona
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="w-full max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-blue-900">Novo Protocolo</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Atleta</Label>
              <Select
                onValueChange={setSelectedAthlete}
                value={selectedAthlete}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {athletes.length > 0 ? (
                    athletes.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.full_name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      Nenhum atleta vinculado.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Título</Label>
              <Input
                placeholder="Ex: Fortalecimento"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Instruções</Label>
              <Textarea
                placeholder="Detalhes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Exercícios</CardTitle>
            <Button variant="outline" size="sm" onClick={addExercise}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {exercises.map((exercise, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-lg border p-4 bg-white shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <Label className="font-bold text-gray-700">
                    Exercício {index + 1}
                  </Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 h-6 w-6"
                    onClick={() => removeExercise(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label className="text-xs">Nome do Exercício</Label>
                    <Input
                      placeholder="Agachamento"
                      value={exercise.name}
                      onChange={(e) =>
                        updateExercise(index, "name", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Séries x Repetições</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="3"
                        value={exercise.sets}
                        onChange={(e) =>
                          updateExercise(index, "sets", e.target.value)
                        }
                      />
                      <span className="self-center">x</span>
                      <Input
                        placeholder="12"
                        value={exercise.reps}
                        onChange={(e) =>
                          updateExercise(index, "reps", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Descanso</Label>
                    <Input
                      placeholder="60s"
                      value={exercise.rest}
                      onChange={(e) =>
                        updateExercise(index, "rest", e.target.value)
                      }
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs flex items-center gap-1">
                      <Youtube className="h-3 w-3 text-red-600" /> Vídeo
                      Demonstrativo
                    </Label>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Cole link do YouTube ou..."
                        value={exercise.videoUrl}
                        onChange={(e) =>
                          updateExercise(index, "videoUrl", e.target.value)
                        }
                        className="flex-1"
                      />

                      <div className="relative">
                        <input
                          type="file"
                          accept="video/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => handleFileUpload(index, e)}
                          disabled={uploadingIndex === index}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={uploadingIndex === index}
                        >
                          {uploadingIndex === index ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          ) : (
                            <UploadCloud className="h-4 w-4 text-gray-600" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500">
                      Cole um link ou clique no ícone de nuvem para subir um
                      vídeo do seu dispositivo.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button
          className="w-full text-lg"
          size="lg"
          onClick={handleSubmit}
          disabled={isLoading || uploadingIndex !== null}
        >
          <Save className="mr-2 h-5 w-5" /> Salvar Protocolo e Notificar
        </Button>
      </div>
    </div>
  );
}