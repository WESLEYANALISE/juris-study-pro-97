
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      // Obter fragmentos de URL após o redirecionamento
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);
      
      try {
        // Verificar se há algum erro nos parâmetros
        const errorParam = hashParams.get("error") || queryParams.get("error");
        const errorDescription = hashParams.get("error_description") || queryParams.get("error_description");
        
        if (errorParam) {
          setError(errorDescription || "Erro no processo de autenticação");
          toast({
            title: "Erro de autenticação",
            description: errorDescription || "Ocorreu um erro durante o processo de autenticação",
            variant: "destructive"
          });
          
          // Redirecionar para login após um breve atraso
          setTimeout(() => {
            navigate("/auth", { replace: true });
          }, 3000);
          
          return;
        }
        
        // Processar o retorno da autenticação
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        // Redirecionar para página inicial se autenticado
        if (data.session) {
          toast({
            title: "Autenticação bem-sucedida",
            description: "Você foi autenticado com sucesso"
          });
          
          navigate("/", { replace: true });
        } else {
          // Se não houver sessão, voltar para login
          navigate("/auth", { replace: true });
        }
      } catch (err: any) {
        console.error("Erro no callback de autenticação:", err);
        setError(err.message || "Ocorreu um erro durante o processo de autenticação");
        
        toast({
          title: "Erro de autenticação",
          description: err.message || "Ocorreu um erro durante o processo de autenticação",
          variant: "destructive"
        });
        
        // Redirecionar para login após um breve atraso
        setTimeout(() => {
          navigate("/auth", { replace: true });
        }, 3000);
      }
    };
    
    handleAuthCallback();
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {error ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Erro de Autenticação</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p>Redirecionando para a página de login...</p>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Processando Autenticação</h1>
          <p className="text-muted-foreground">Por favor, aguarde...</p>
        </div>
      )}
    </div>
  );
}
