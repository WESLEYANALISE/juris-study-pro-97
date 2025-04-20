
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonitorPlay, Shield, Link2, Laptop, Lock, Power, Plus, Settings } from "lucide-react";

const RemoteDesktop = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const handleConnect = () => {
    setIsConnecting(true);
    
    // Simulando conexão
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 2000);
  };
  
  const handleDisconnect = () => {
    setIsConnected(false);
  };
  
  // Dados de exemplo para computadores salvos
  const savedComputers = [
    { id: 1, name: "Computador do Escritório", address: "192.168.1.105", lastConnected: "18/04/2025" },
    { id: 2, name: "Notebook Pessoal", address: "192.168.1.110", lastConnected: "15/04/2025" }
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col items-center mb-8">
        <div className="mb-6">
          <MonitorPlay className="h-12 w-12 text-primary mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-center mb-1">Desktop Remoto</h1>
          <p className="text-muted-foreground text-center">
            Acesse seu computador à distância com segurança
          </p>
        </div>
      </div>

      <Tabs defaultValue="conectar" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="conectar">
            <Link2 className="h-4 w-4 mr-2" />
            Conectar
          </TabsTrigger>
          <TabsTrigger value="computadores">
            <Laptop className="h-4 w-4 mr-2" />
            Computadores Salvos
          </TabsTrigger>
          <TabsTrigger value="configuracoes">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="conectar">
          {!isConnected ? (
            <Card>
              <CardHeader>
                <CardTitle>Conectar a um Computador Remoto</CardTitle>
                <CardDescription>
                  Insira as informações do computador ao qual deseja se conectar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="remote-address">Endereço do Computador</Label>
                  <Input id="remote-address" placeholder="192.168.1.100 ou nome.dominio.com" />
                  <p className="text-xs text-muted-foreground">
                    Insira o endereço IP ou nome do computador remoto
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="remote-port">Porta (opcional)</Label>
                  <Input id="remote-port" placeholder="3389" />
                  <p className="text-xs text-muted-foreground">
                    Porta padrão: 3389 para RDP
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Nome de Usuário</Label>
                  <Input id="username" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" />
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" id="save-credentials" className="rounded-sm" />
                  <Label htmlFor="save-credentials" className="text-sm">
                    Salvar credenciais para conexões futuras
                  </Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Limpar</Button>
                <Button onClick={handleConnect} disabled={isConnecting}>
                  {isConnecting ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Link2 className="h-4 w-4 mr-2" />
                      Conectar
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader className="bg-green-500/10 border-b border-green-500/20">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-green-500 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Conectado
                  </CardTitle>
                  <Button variant="destructive" size="sm" onClick={handleDisconnect}>
                    <Power className="h-4 w-4 mr-2" />
                    Desconectar
                  </Button>
                </div>
                <CardDescription>
                  Você está conectado ao computador remoto
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-900 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-center p-6">
                    <div>
                      <MonitorPlay className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Tela Remota</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        Por razões de segurança, a visualização da tela remota não está disponível na versão web. 
                        Para uma experiência completa, baixe o aplicativo desktop.
                      </p>
                      <Button>
                        Baixar Aplicativo Desktop
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Status da Conexão</p>
                      <p className="text-sm text-muted-foreground">Conectado (Criptografado)</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Endereço</p>
                      <p className="text-sm text-muted-foreground">192.168.1.105</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Usuário</p>
                      <p className="text-sm text-muted-foreground">admin</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Tempo de Conexão</p>
                      <p className="text-sm text-muted-foreground">00:05:23</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Configurações de Exibição</Button>
                <Button variant="outline">
                  <Lock className="h-4 w-4 mr-2" />
                  Bloquear Computador Remoto
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="computadores">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedComputers.map(computer => (
              <Card key={computer.id}>
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle>{computer.name}</CardTitle>
                    <Laptop className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardDescription>{computer.address}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Último acesso: {computer.lastConnected}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">Editar</Button>
                  <Button size="sm">Conectar</Button>
                </CardFooter>
              </Card>
            ))}
            
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center h-[200px]">
                <Plus className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Adicionar Novo Computador</h3>
                <Button variant="outline">Adicionar</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="configuracoes">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Desktop Remoto</CardTitle>
              <CardDescription>
                Personalize sua experiência de acesso remoto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="display-quality">Qualidade de Exibição</Label>
                  <select 
                    id="display-quality"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="high">Alta (consumo maior de banda)</option>
                    <option value="medium" selected>Média (recomendado)</option>
                    <option value="low">Baixa (conexões lentas)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="connection-protocol">Protocolo de Conexão</Label>
                  <select 
                    id="connection-protocol"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="rdp" selected>RDP (Remote Desktop Protocol)</option>
                    <option value="vnc">VNC (Virtual Network Computing)</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4 pt-4">
                <h3 className="font-medium">Segurança</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="verify-certificate">Verificar Certificado</Label>
                    <p className="text-sm text-muted-foreground">
                      Verificar certificados SSL antes de estabelecer conexão
                    </p>
                  </div>
                  <input type="checkbox" id="verify-certificate" className="rounded-sm" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-disconnect">Desconexão Automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Desconectar automaticamente após período de inatividade
                    </p>
                  </div>
                  <input type="checkbox" id="auto-disconnect" className="rounded-sm" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="clipboard-sharing">Compartilhamento de Área de Transferência</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir compartilhamento de área de transferência entre os computadores
                    </p>
                  </div>
                  <input type="checkbox" id="clipboard-sharing" className="rounded-sm" defaultChecked />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Restaurar Padrões</Button>
              <Button>Salvar Configurações</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RemoteDesktop;
