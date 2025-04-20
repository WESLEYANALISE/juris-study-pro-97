
import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface ProxyStatusAlertProps {
  proxyStatus: "checking" | "online" | "offline";
  setShowProxyInstructions: (show: boolean) => void;
}

export default function ProxyStatusAlert({
  proxyStatus,
  setShowProxyInstructions,
}: ProxyStatusAlertProps) {
  if (proxyStatus === "checking") {
    return (
      <Alert className="my-4 bg-blue-50 dark:bg-blue-950/30">
        <Info className="h-5 w-5" />
        <AlertTitle>Verificando status do servidor proxy</AlertTitle>
        <AlertDescription>
          Verificando se o servidor proxy está disponível...
        </AlertDescription>
      </Alert>
    );
  } else if (proxyStatus === "offline") {
    return (
      <Alert className="my-4 bg-amber-50 dark:bg-amber-950/30">
        <Info className="h-5 w-5" />
        <AlertTitle>Servidor proxy offline</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-2">
            O servidor proxy para a API do Datajud não está disponível.
            Estamos exibindo dados simulados para demonstração.
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowProxyInstructions(true)}
              className="text-xs"
            >
              Como configurar o proxy
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  return null;
}
