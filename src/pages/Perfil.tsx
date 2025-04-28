
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  User, Settings, HelpCircle, LogOut, 
  Upload, Shield, Trash, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";

const Perfil = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user data
  useEffect(() => {
    if (user && profile) {
      setEmail(user.email || "");
      setFullName(profile.display_name || "");
      setAvatarUrl(profile.avatar_url);
    }
  }, [user, profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast.error("Você precisa estar logado para atualizar seu avatar");
      return;
    }
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      setIsLoading(true);
      
      try {
        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL for the file
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
          
        const publicUrl = urlData.publicUrl;
        
        // Update user profile with new avatar URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id);
          
        if (updateError) {
          throw updateError;
        }
        
        // Update local state and refresh profile data
        setAvatarUrl(publicUrl);
        await refreshProfile();
        
        toast.success("Foto de perfil atualizada com sucesso!");
      } catch (error: any) {
        console.error("Erro ao atualizar foto:", error);
        toast.error(`Erro ao atualizar foto: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para salvar seu perfil");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: fullName
        })
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      await refreshProfile();
      toast.success("Perfil salvo com sucesso!");
    } catch (error: any) {
      console.error("Erro ao salvar perfil:", error);
      toast.error(`Erro ao salvar perfil: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContactSupport = () => {
    window.location.href = `mailto:Wn7corporation@gmail.com?subject=Suporte JurisStudy Pro&body=Olá, preciso de ajuda com...`;
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout. Tente novamente.");
    }
  };
  
  const handleDeleteAccount = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para excluir sua conta");
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // Call our delete_user_account function
      const { error: functionError } = await supabase.rpc('delete_user_account', {
        user_id: user.id
      });
      
      if (functionError) {
        throw functionError;
      }

      toast.success("Sua conta foi excluída com sucesso");
      
      // Sign out and redirect to auth page
      await signOut();
      navigate('/auth');
    } catch (error: any) {
      console.error("Erro ao excluir conta:", error);
      toast.error(`Erro ao excluir conta: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const initials = fullName
    ?.split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || '??';

  // If not authenticated, show a loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-start gap-8">
        <Card className="md:w-64 w-full">
          <CardHeader>
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="Foto de perfil" />
                  ) : (
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Upload size={14} />
                  )}
                  <span className="sr-only">Carregar imagem</span>
                </Button>
                <input 
                  ref={fileInputRef}
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*"
                  className="hidden" 
                  onChange={handleAvatarUpload} 
                  disabled={isLoading}
                />
              </div>
              <h2 className="font-bold text-lg">{fullName || email}</h2>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <User size={16} className="mr-2" />
                Meu Perfil
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Settings size={16} className="mr-2" />
                Configurações
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Shield size={16} className="mr-2" />
                Privacidade
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={handleContactSupport}>
                <HelpCircle size={16} className="mr-2" />
                Suporte
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" />
              Sair
            </Button>
          </CardFooter>
        </Card>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6">Configurações de Perfil</h1>
          
          <Tabs defaultValue="account">
            <TabsList className="mb-6">
              <TabsTrigger value="account">Conta</TabsTrigger>
              <TabsTrigger value="appearance">Aparência</TabsTrigger>
              <TabsTrigger value="danger">Zona de Perigo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full-name">Nome Completo</Label>
                      <Input 
                        id="full-name" 
                        value={fullName} 
                        onChange={e => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Alterações'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Aparência</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Tema Escuro</Label>
                        <p className="text-sm text-muted-foreground">
                          Alterne entre tema claro e escuro
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={darkMode} 
                          onCheckedChange={setDarkMode}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="danger">
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Excluir Conta</h3>
                    <p className="text-sm text-muted-foreground">
                      Ao excluir sua conta, todos os seus dados serão permanentemente removidos e não poderão ser recuperados.
                      Isso inclui seu perfil, histórico de atividades, anotações, favoritos e progresso em simulados.
                    </p>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="mt-4" disabled={isDeleting}>
                        {isDeleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Excluindo...
                          </>
                        ) : (
                          <>
                            <Trash size={16} className="mr-2" />
                            Excluir Minha Conta
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta
                          e removerá todos os seus dados de nossos servidores.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteAccount} 
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Sim, excluir minha conta
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
