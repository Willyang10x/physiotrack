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

  // Estados do Formulário
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
      // Limpa os campos após salvar
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

  // Filtra os exercícios com base na barra de pesquisa
  const filteredExercises = initialExercises.filter(ex =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ["Membros Inferiores", "Membros Superiores", "Core", "Cardio", "Mobilidade", "Alongamento", "Outros"];

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
              <Library className="w-8 h-8" /> Biblioteca de Exercícios
            </h1>
            <p className="text-gray-500 mt-1">Cadastre seus exercícios uma vez para usá-los rapidamente nos treinos.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LADO ESQUERDO: Formulário de Cadastro */}
          <div className="lg:col-span-1 sticky top-6">
            <Card className="shadow-sm border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle className="text-primary text-lg">Novo Exercício</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Nome do Exercício *</label>
                    <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Ex: Cadeira Extensora" className="mt-1 bg-white" />
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
                    <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://..." className="mt-1 bg-white" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Instruções de Postura (Opcional)</label>
                    <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Manter a coluna neutra e o abdômen contraído..." className="mt-1 bg-white min-h-[100px] resize-y" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white shadow-sm font-bold">
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                    Salvar na Biblioteca
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* LADO DIREITO: Lista de Exercícios Salvos */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Barra de Pesquisa */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                placeholder="Buscar por nome ou categoria..." 
                className="pl-10 bg-white shadow-sm h-12 text-base rounded-xl"
              />
            </div>

            {filteredExercises.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {filteredExercises.map(ex => (
                  <Card key={ex.id} className="shadow-sm hover:border-primary/30 transition-colors h-full flex flex-col">
                    <CardContent className="p-4 flex flex-col flex-1 gap-4">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-gray-800 text-lg leading-tight">{ex.name}</h3>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0 -mt-1 -mr-1" onClick={() => handleDelete(ex.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex-1">
                        <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded tracking-wider">
                          {ex.category}
                        </span>
                        {ex.description && (
                          <p className="text-sm text-gray-500 mt-3 line-clamp-3 italic">"{ex.description}"</p>
                        )}
                      </div>

                      {ex.video_url && (
                        <a href={ex.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-secondary hover:text-secondary/80 hover:underline font-bold mt-2 pt-3 border-t">
                          <Video className="w-4 h-4 mr-1" /> Assistir Vídeo Base
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                <Library className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-lg">
                  {searchTerm ? "Nenhum exercício encontrado na busca." : "Sua biblioteca está vazia."}
                </p>
                {!searchTerm && <p className="text-gray-400 text-sm mt-1">Comece adicionando o seu primeiro exercício no menu ao lado.</p>}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}