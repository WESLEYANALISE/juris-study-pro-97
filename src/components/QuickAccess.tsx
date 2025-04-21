
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Laptop, BarChart2, BookOpen, SendHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const QuickAccess = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  
  const handleSendLink = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Por favor, informe um email válido");
      return;
    }
    
    toast.success(`Link enviado para ${email}`, {
      description: "Você receberá o acesso à versão desktop em breve."
    });
    
    setEmail("");
  };
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 px-2">Acesso Rápido</h2>
      
      <div className="grid grid-cols-3 gap-3 px-2">
        <Card className="h-full">
          <CardHeader className="p-3">
            <Laptop className="h-5 w-5 text-blue-500 mb-1" />
            <CardTitle className="text-sm">Acesso Desktop</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-xs text-muted-foreground mb-2">
              Estude no computador com tela ampla
            </p>
          </CardContent>
          <CardFooter className="p-3 pt-0 flex flex-col items-start gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => window.open("https://preview-1587c822--juris-study-pro.lovable.app/", "_blank")}
            >
              Acessar Site
            </Button>
            
            <form onSubmit={handleSendLink} className="w-full">
              <div className="flex flex-col gap-1 w-full">
                <Input
                  type="email"
                  placeholder="Seu email"
                  className="h-8 text-xs"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  className="w-full text-xs h-8"
                >
                  <SendHorizontal className="h-3 w-3 mr-1" />
                  Enviar Link
                </Button>
              </div>
            </form>
          </CardFooter>
        </Card>

        <Card className="h-full">
          <CardHeader className="p-3">
            <BarChart2 className="h-5 w-5 text-purple-500 mb-1" />
            <CardTitle className="text-sm">Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-xs text-muted-foreground">
              Estatísticas de desempenho
            </p>
          </CardContent>
          <CardFooter className="p-3 pt-0">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => navigate("/perfil")}
            >
              Ver Estatísticas
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="h-full">
          <CardHeader className="p-3">
            <BookOpen className="h-5 w-5 text-green-500 mb-1" />
            <CardTitle className="text-sm">Vade Mecum</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-xs text-muted-foreground">
              Códigos e legislação
            </p>
          </CardContent>
          <CardFooter className="p-3 pt-0">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => navigate("/ferramentas/vademecum")}
            >
              Consultar
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default QuickAccess;
