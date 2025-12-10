"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Camera, Loader2, Save, User, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setFullName(data.full_name);
        setAvatarUrl(data.avatar_url);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Selecione uma imagem.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch (error: any) {
      alert("Erro no upload: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // --- NOVA FUNÇÃO: REMOVER FOTO ---
  const handleRemovePhoto = async () => {
    if (!confirm("Tem certeza que deseja remover sua foto de perfil?")) return;

    try {
      setUploading(true);

      // Atualiza o banco definindo avatar_url como NULL
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", profile.id);

      if (error) throw error;

      setAvatarUrl(null); // Limpa visualmente
      alert("Foto removida com sucesso!");
      router.refresh();
    } catch (error: any) {
      alert("Erro ao remover: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          avatar_url: avatarUrl, // Salva a URL nova (ou null)
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;
      alert("Perfil atualizado com sucesso!");
      router.refresh();
      router.push("/dashboard");
    } catch (error: any) {
      alert("Erro ao salvar: " + error.message);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-primary">Carregando perfil...</div>
    );

  return (
    <div className="min-h-screen p-6 flex justify-center items-center">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-primary hover:bg-primary/10"
          >
            <Link href="/dashboard">
              <ArrowLeft className="h-6 w-6" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-primary">Meu Perfil</h1>
        </div>

        <Card className="border-t-4 border-t-primary shadow-sm">
          <CardHeader className="text-center">
            <div className="relative mx-auto w-32 h-32 mb-4 group">
              {/* Visual do Avatar */}
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 bg-white relative shadow-sm">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                    <User className="h-12 w-12" />
                  </div>
                )}

                {/* Overlay de Upload (Só aparece se passar o mouse) */}
                <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  {uploading ? (
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  ) : (
                    <Camera className="h-8 w-8 text-white" />
                  )}
                  <span className="text-white text-xs mt-1 font-medium">
                    Alterar
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* BOTÃO DE REMOVER (Só aparece se tiver foto) */}
              {avatarUrl && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md border-2 border-white"
                  onClick={handleRemovePhoto}
                  title="Remover foto"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <CardTitle className="text-primary">{profile.email}</CardTitle>
            <CardDescription className="capitalize text-secondary font-medium">
              {profile.role === "therapist" ? "Fisioterapeuta" : "Atleta"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Nome Completo</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="focus-visible:ring-primary"
              />
            </div>

            <div className="grid gap-2">
              <Label>ID do Sistema</Label>
              <div className="p-3 bg-muted rounded-md text-xs font-mono text-muted-foreground break-all border border-border">
                {profile.id}
              </div>
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90 mt-4 text-lg h-12 shadow-md"
              onClick={handleSave}
              disabled={uploading}
            >
              <Save className="mr-2 h-5 w-5" /> Salvar Alterações
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
