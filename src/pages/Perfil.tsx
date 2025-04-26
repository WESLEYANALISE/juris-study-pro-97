
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  User, Settings, Bell, Mail, Lock, HelpCircle, LogOut, 
  Upload, Shield, Eye, Smartphone, Moon, Sun
} from "lucide-react";

const Perfil = () => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState("Usuário");
  const [email, setEmail] = useState("usuario@exemplo.com");
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    news: true,
    updates: false
  });

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setAvatarUrl(e.target.result);
          toast.success("Foto de perfil atualizada com sucesso!");
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    toast.success("Perfil salvo com sucesso!");
  };

  const handleSavePassword = () => {
    toast.success("Senha atualizada com sucesso!");
  };

  const handleSaveNotifications = () => {
    toast.success("Preferências de notificação atualizadas!");
  };

  const handleContactSupport = () => {
    window.location.href = `mailto:Wn7corporation@gmail.com?subject=Suporte JurisStudy Pro&body=Olá, preciso de ajuda com...`;
  };

  const initials = fullName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

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
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  <Upload size={14} />
                  <span className="sr-only">Carregar imagem</span>
                </Button>
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*"
                  className="hidden" 
                  onChange={handleAvatarUpload} 
                />
              </div>
              <h2 className="font-bold text-lg">{fullName}</h2>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={() => {}}>
                <User size={16} className="mr-2" />
                Meu Perfil
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => {}}>
                <Settings size={16} className="mr-2" />
                Configurações
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => {}}>
                <Shield size={16} className="mr-2" />
                Privacidade
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => {}}>
                <Bell size={16} className="mr-2" />
                Notificações
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={handleContactSupport}>
                <HelpCircle size={16} className="mr-2" />
                Suporte
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => {}}>
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
              <TabsTrigger value="password">Senha</TabsTrigger>
              <TabsTrigger value="notifications">Notificações</TabsTrigger>
              <TabsTrigger value="appearance">Aparência</TabsTrigger>
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
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oab">Número da OAB (opcional)</Label>
                      <Input id="oab" placeholder="Ex: 123456/SP" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone (opcional)</Label>
                      <Input id="phone" placeholder="(00) 00000-0000" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografia</Label>
                    <Textarea 
                      id="bio" 
                      placeholder="Conte um pouco sobre você..." 
                      rows={4}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveProfile}>Salvar Alterações</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Dados Acadêmicos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Instituição de Ensino</Label>
                      <Input placeholder="Nome da Universidade/Faculdade" />
                    </div>
                    <div className="space-y-2">
                      <Label>Curso</Label>
                      <Input placeholder="Ex: Direito" />
                    </div>
                    <div className="space-y-2">
                      <Label>Ano de Formação/Previsão</Label>
                      <Input type="number" placeholder="Ex: 2026" />
                    </div>
                    <div className="space-y-2">
                      <Label>Período/Semestre</Label>
                      <Input placeholder="Ex: 5º período" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Salvar Dados Acadêmicos</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Alterar Senha</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Senha Atual</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSavePassword}>Alterar Senha</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Preferências de Notificações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Notificações por Email</h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Atualizações de conteúdo</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba emails quando novos materiais forem adicionados
                        </p>
                      </div>
                      <Switch 
                        checked={notifications.email} 
                        onCheckedChange={(checked) => 
                          setNotifications(prev => ({...prev, email: checked}))
                        } 
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Novidades e ofertas</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba informações sobre promoções e novidades
                        </p>
                      </div>
                      <Switch 
                        checked={notifications.news} 
                        onCheckedChange={(checked) => 
                          setNotifications(prev => ({...prev, news: checked}))
                        } 
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Notificações no Aplicativo</h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificações push</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba notificações em seu dispositivo
                        </p>
                      </div>
                      <Switch 
                        checked={notifications.push} 
                        onCheckedChange={(checked) => 
                          setNotifications(prev => ({...prev, push: checked}))
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Atualizações do sistema</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba notificações sobre novas funcionalidades
                        </p>
                      </div>
                      <Switch 
                        checked={notifications.updates} 
                        onCheckedChange={(checked) => 
                          setNotifications(prev => ({...prev, updates: checked}))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveNotifications}>Salvar Preferências</Button>
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
                        <Sun size={18} className="text-muted-foreground" />
                        <Switch 
                          checked={darkMode} 
                          onCheckedChange={setDarkMode}
                        />
                        <Moon size={18} className="text-muted-foreground" />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Tamanho da Fonte</Label>
                        <p className="text-sm text-muted-foreground">
                          Ajuste o tamanho dos textos na aplicação
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">A-</Button>
                        <Button variant="outline" size="sm">A</Button>
                        <Button variant="outline" size="sm">A+</Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Modo de Leitura</Label>
                        <p className="text-sm text-muted-foreground">
                          Facilita a leitura, reduzindo distrações
                        </p>
                      </div>
                      <div className="flex">
                        <Button variant="outline" size="sm">
                          <Eye size={16} className="mr-2" />
                          Ativar
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Modo Móvel</Label>
                        <p className="text-sm text-muted-foreground">
                          Otimizar interface para dispositivos móveis
                        </p>
                      </div>
                      <div className="flex">
                        <Button variant="outline" size="sm">
                          <Smartphone size={16} className="mr-2" />
                          Ativar
                        </Button>
                      </div>
                    </div>
                  </div>
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
