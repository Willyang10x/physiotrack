"use client";

import { useState } from "react";
import { createExercise, deleteExercise } from "@/app/actions/exercises";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { Library, Plus, Trash2, Video, Search, Loader2 } from "lucide-react";

export function ExerciseManager({ initialExercises }: { initialExercises: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Membros Inferiores");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await createExercise({ name, category, description, video_url: videoUrl });
    
    if (res.error) alert("Erro: " + res.error);
    else {
      setName("");
      setDescription("");
      setVideoUrl("");
      alert("Exercício salvo com sucesso na biblioteca! 📚");
      router.refresh();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza? Ele será apagado da sua biblioteca permanentemente.")) return;
    setLoading(true);
    await deleteExercise(id);
    router.refresh();
    setLoading(false);
  };

  const filteredExercises = initialExercises.filter(ex =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ["Membros Inferiores", "Membros Superiores", "Core", "Cardio", "Mobilidade", "Alongamento", "Outros"];

  return (
    // Removido o p-4 md:p-8 para px-4 py-6 no mobile
    <div className="min-h-screen px-4 py-6 md:p-8 bg-gray-50 overflow-x-hidden pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-3">
              <Library className="w-7 h-7 md:w-8 md:h-8 shrink-0" /> Biblioteca de Exercícios
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">Cadastre exercícios uma vez para usar nos treinos.</p>
          </div>
        </div>

        {/* MUDANÇA: No mobile, o grid empilha (col-1). No PC, divide 1 pra form e 2 pra lista */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LADO ESQUERDO: Formulário de Cadastro */}
          <div className="lg:col-span-1 lg:sticky lg:top-6 w-full">
            <Card className="shadow-sm border-t-4 border-t-primary w-full">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-primary text-lg">Novo Exercício</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <form onSubmit={handleAdd} className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Nome do Exercício *</label>
                    <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Ex: Cadeira Extensora" className="mt-1 bg-white w-full" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Categoria *</label>
                    <select 
                      value={category} 
                      onChange={e => setCategory(e.target.value)} 
                      className="w-full mt-1 p-2 rounded-md border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Link do Vídeo (YouTube/Insta)</label>
                    <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://..." className="mt-1 bg-white w-full" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Instruções de Postura (Opcional)</label>
                    <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Manter a coluna neutra..." className="mt-1 bg-white min-h-[100px] resize-y w-full" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white shadow-sm font-bold py-6">
                    {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
                    Salvar na Biblioteca
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* LADO DIREITO: Lista de Exercícios Salvos */}
          <div className="lg:col-span-2 space-y-4 w-full mt-4 lg:mt-0">
            
            {/* Barra de Pesquisa */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                placeholder="Buscar por nome ou categoria..." 
                className="pl-10 bg-white shadow-sm h-12 text-sm sm:text-base rounded-xl w-full"
              />
            </div>

            {filteredExercises.length > 0 ? (
              // MUDANÇA: Grid em coluna única no mobile (sm:grid-cols-2)
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {filteredExercises.map(ex => (
                  <Card key={ex.id} className="shadow-sm hover:border-primary/30 transition-colors h-full flex flex-col w-full">
                    <CardContent className="p-4 flex flex-col flex-1 gap-3">
                      <div className="flex justify-between items-start gap-2">
                        {/* Quebra de texto garantida no mobile */}
                        <h3 className="font-bold text-gray-800 text-base md:text-lg leading-tight break-words pr-2">{ex.name}</h3>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0 -mt-1 -mr-1" onClick={() => handleDelete(ex.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex-1">
                        <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded tracking-wider">
                          {ex.category}
                        </span>
                        {ex.description && (
                          <p className="text-xs md:text-sm text-gray-500 mt-2 line-clamp-3 italic">"{ex.description}"</p>
                        )}
                      </div>

                      {ex.video_url && (
                        <a href={ex.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs md:text-sm text-secondary hover:text-secondary/80 hover:underline font-bold mt-2 pt-3 border-t">
                          <Video className="w-4 h-4 mr-1 shrink-0" /> Assistir Vídeo Base
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 md:p-12 bg-white rounded-xl border-2 border-dashed border-gray-200 w-full">
                <Library className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-base md:text-lg">
                  {searchTerm ? "Nenhum exercício encontrado." : "Sua biblioteca está vazia."}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}