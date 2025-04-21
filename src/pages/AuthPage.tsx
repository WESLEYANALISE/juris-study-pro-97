
import { useEffect } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { Scale } from "lucide-react";

export default function AuthPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const from = location.state?.from || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location]);
  
  // Não renderizar nada enquanto verifica a autenticação para evitar flash de conteúdo
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Scale className="h-12 w-12 text-primary mx-auto mb-4" />
          <div className="h-6 w-48 bg-muted rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5DEFF] via-[#F1F0FB] to-white flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <Scale className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold">JurisStudy Pro</h1>
        <p className="text-muted-foreground mt-2">
          Plataforma completa para estudos jurídicos
        </p>
      </div>
      
      <LoginForm />
      
      <p className="mt-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} JurisStudy Pro. Todos os direitos reservados.
      </p>
    </div>
  );
}
