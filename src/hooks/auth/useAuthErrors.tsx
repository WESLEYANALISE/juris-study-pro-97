
import { useState, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import { AuthError } from "@/services/auth/authService";

type ErrorMessages = {
  [key: string]: string;
};

// Mensagens de erro padrão para diferentes categorias
const defaultErrorMessages: ErrorMessages = {
  // Erros de login
  login: "Houve um problema ao fazer login. Tente novamente.",
  "auth/invalid-email": "Email inválido. Verifique e tente novamente.",
  "auth/user-disabled": "Esta conta foi desativada.",
  "auth/user-not-found": "Nenhuma conta encontrada com este email.",
  "auth/wrong-password": "Senha incorreta. Tente novamente.",
  "auth/too-many-requests": "Muitas tentativas de login. Tente novamente mais tarde.",
  
  // Erros de cadastro
  signup: "Houve um problema ao criar sua conta. Tente novamente.",
  "auth/email-already-in-use": "Este email já está em uso por outra conta.",
  "auth/invalid-password": "A senha deve ter pelo menos 6 caracteres.",
  
  // Erros de redefinição de senha
  resetPassword: "Houve um problema ao enviar o email de redefinição. Tente novamente.",
  
  // Erros de verificação de email
  verifyEmail: "Não foi possível enviar o email de verificação. Tente novamente.",
  
  // Erros de logout
  logout: "Houve um problema ao fazer logout. Tente novamente.",
  
  // Erros gerais
  default: "Ocorreu um erro. Tente novamente mais tarde."
};

// Hook para gerenciar erros de autenticação
export const useAuthErrors = (customErrorMessages?: ErrorMessages) => {
  // Combinar mensagens de erro padrão com personalizadas
  const errorMessages = { ...defaultErrorMessages, ...customErrorMessages };
  
  // Estado para armazenar o erro atual
  const [currentError, setCurrentError] = useState<AuthError | null>(null);
  
  // Função para obter mensagem amigável de erro
  const getErrorMessage = useCallback((error: AuthError | null, category: string = "default"): string => {
    if (!error) return "";
    
    // Tentar encontrar mensagem específica para o código de erro
    if (error.code && errorMessages[error.code]) {
      return errorMessages[error.code];
    }
    
    // Tentar encontrar mensagem para a categoria
    if (errorMessages[category]) {
      return errorMessages[category];
    }
    
    // Usar a mensagem de erro original ou mensagem padrão
    return error.message || errorMessages.default;
  }, [errorMessages]);
  
  // Função para lidar com erros
  const handleError = useCallback((error: AuthError | null | Error, category: string = "default", showToast: boolean = true): void => {
    // Converter Error para AuthError se necessário
    const authError: AuthError = error instanceof Error && !(error as any).code 
      ? { message: error.message }
      : error as AuthError;
    
    // Atualizar o erro atual
    setCurrentError(authError);
    
    // Mostrar toast de erro se solicitado
    if (showToast && authError) {
      const message = getErrorMessage(authError, category);
      toast({
        title: "Erro",
        description: message,
        variant: "destructive"
      });
    }
  }, [getErrorMessage]);
  
  // Função para limpar o erro atual
  const clearError = useCallback((): void => {
    setCurrentError(null);
  }, []);
  
  return {
    currentError,
    getErrorMessage,
    handleError,
    clearError
  };
};
