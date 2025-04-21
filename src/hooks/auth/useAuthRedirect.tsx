
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

type RedirectOptions = {
  // URL para redirecionar quando autenticado
  authenticatedRedirectUrl?: string;
  // URL para redirecionar quando não autenticado
  unauthenticatedRedirectUrl?: string;
  // Atraso antes do redirecionamento (em ms)
  redirectDelay?: number;
  // Verificar se precisamos forçar o redirecionamento mesmo sem mudança no estado de autenticação
  forceCheck?: boolean;
};

// Hook para gerenciar redirecionamentos baseados no estado de autenticação
export const useAuthRedirect = ({
  authenticatedRedirectUrl = "/",
  unauthenticatedRedirectUrl = "/auth",
  redirectDelay = 0,
  forceCheck = false
}: RedirectOptions = {}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Não fazer nada enquanto estiver carregando o estado de autenticação
    if (isLoading) return;
    
    // Determinar se precisamos redirecionar
    const shouldRedirectToAuth = !isAuthenticated && location.pathname !== unauthenticatedRedirectUrl;
    const shouldRedirectToApp = isAuthenticated && location.pathname === unauthenticatedRedirectUrl;
    
    // Executar redirecionamento após o atraso especificado
    const handleRedirect = () => {
      if (shouldRedirectToAuth) {
        // Redirecionar para página de autenticação com a localização atual para voltar depois
        navigate(unauthenticatedRedirectUrl, {
          state: { from: location.pathname },
          replace: true
        });
      } else if (shouldRedirectToApp || forceCheck) {
        // Redirecionar para o app ou para a página que o usuário estava tentando acessar
        const from = location.state?.from || authenticatedRedirectUrl;
        navigate(from, { replace: true });
      }
    };
    
    // Se precisamos redirecionar, configurar o timeout
    if (shouldRedirectToAuth || shouldRedirectToApp || forceCheck) {
      if (redirectDelay > 0) {
        const timer = setTimeout(handleRedirect, redirectDelay);
        return () => clearTimeout(timer);
      } else {
        handleRedirect();
      }
    }
  }, [
    isAuthenticated, 
    isLoading, 
    navigate, 
    location, 
    authenticatedRedirectUrl, 
    unauthenticatedRedirectUrl, 
    redirectDelay,
    forceCheck
  ]);
  
  // Retorna funções úteis para redirecionamentos manuais
  return {
    redirectToAuth: () => navigate(unauthenticatedRedirectUrl, { replace: true }),
    redirectToApp: (path?: string) => navigate(path || authenticatedRedirectUrl, { replace: true }),
    isAuthenticated,
    isLoading
  };
};
