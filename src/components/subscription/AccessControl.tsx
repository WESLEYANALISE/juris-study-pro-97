
import { ReactNode } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

interface AccessControlProps {
  children: ReactNode;
  fallback?: ReactNode;
  premiumOnly?: boolean;
  showUpgrade?: boolean;
}

export function AccessControl({
  children,
  fallback,
  premiumOnly = true,
  showUpgrade = true
}: AccessControlProps) {
  const { subscribed } = useSubscription();
  const navigate = useNavigate();
  
  // Se o conteúdo não é premium ou o usuário tem assinatura, mostrar conteúdo normal
  if (!premiumOnly || subscribed) {
    return <>{children}</>;
  }
  
  // Se existe um fallback personalizado, mostrá-lo
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Caso contrário, mostrar card de conteúdo premium
  return (
    <Card className="mx-auto max-w-md border-primary/20">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Conteúdo Premium</CardTitle>
        <CardDescription>
          Este conteúdo está disponível apenas para assinantes do plano Premium.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground">
          Faça upgrade para o plano Premium e obtenha acesso ilimitado a todos os recursos exclusivos da plataforma Direito 360.
        </p>
      </CardContent>
      {showUpgrade && (
        <CardFooter className="flex justify-center">
          <Button onClick={() => navigate("/assinatura")}>
            Assinar plano Premium
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
