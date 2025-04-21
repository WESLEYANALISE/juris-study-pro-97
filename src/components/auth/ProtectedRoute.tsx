
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "user";
  authenticationPath?: string;
}

export const ProtectedRoute = ({
  children,
  requiredRole,
  authenticationPath = "/auth"
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, userState } = useAuth();
  const location = useLocation();
  
  // Verificar estado de carregamento
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }
  
  // Verificar autenticação
  if (!isAuthenticated) {
    return <Navigate to={authenticationPath} state={{ from: location.pathname }} replace />;
  }
  
  // Verificar papel se necessário
  if (requiredRole === "admin" && !userState.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  // Renderizar conteúdo protegido
  return <>{children}</>;
};
