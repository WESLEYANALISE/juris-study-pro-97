
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { JuridicalBackground } from "@/components/ui/juridical-background";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ArrowRight, Home } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

export default function AssinaturaResultado() {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkSubscription } = useSubscription();
  
  const isSuccess = location.pathname.includes("sucesso");
  
  // Verificar status de assinatura na montagem do componente
  useEffect(() => {
    const checkStatus = async () => {
      if (isSuccess) {
        await checkSubscription();
      }
    };
    
    checkStatus();
    
    // Mostrar mensagem de acordo com o resultado
    if (isSuccess) {
      toast.success("Assinatura realizada com sucesso!");
    } else {
      toast.error("A assinatura foi cancelada ou ocorreu um erro no processo.");
    }
  }, [isSuccess, checkSubscription]);

  return (
    <JuridicalBackground variant="scales" opacity={0.03}>
      <div className="container mx-auto flex h-[80vh] items-center justify-center px-4">
        <div className="mx-auto max-w-md text-center">
          {isSuccess ? (
            <>
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="mb-2 text-3xl font-bold">Assinatura realizada!</h1>
              <p className="mb-8 text-lg text-muted-foreground">
                Sua assinatura foi confirmada com sucesso. Agora você tem acesso a todos os recursos premium do Direito 360.
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <h1 className="mb-2 text-3xl font-bold">Assinatura cancelada</h1>
              <p className="mb-8 text-lg text-muted-foreground">
                O processo de assinatura foi cancelado ou encontrou um erro. Você pode tentar novamente a qualquer momento.
              </p>
            </>
          )}
          
          <div className="space-y-4">
            <Button 
              className="w-full"
              onClick={() => navigate("/assinatura")}
            >
              {isSuccess ? "Gerenciar assinatura" : "Tentar novamente"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/")}
            >
              <Home className="mr-2 h-4 w-4" />
              Voltar para o início
            </Button>
          </div>
        </div>
      </div>
    </JuridicalBackground>
  );
}
