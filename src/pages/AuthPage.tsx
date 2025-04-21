
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Mail, Key, LogIn, UserPlus, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import AnimatedLogo from "@/components/AnimatedLogo";

const AuthPage = () => {
  const { user, loading, error, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  // Se o usuário já estiver autenticado, redirecione para a página inicial
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    
    let success = false;
    
    if (mode === "login") {
      success = await signIn(email, password);
      if (success) {
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo(a) de volta ao JurisLab!",
        });
      }
    } else {
      success = await signUp(email, password);
      if (success) {
        toast({
          title: "Cadastro realizado com sucesso",
          description: "Uma mensagem de confirmação foi enviada para seu e-mail.",
        });
        setMode("login");
      }
    }
    
    setPending(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-primary/10 via-background to-background px-2">
      <div className="w-full max-w-sm bg-background border rounded-xl shadow-lg py-8 px-6 flex flex-col gap-6">
        <div className="flex flex-col items-center">
          <AnimatedLogo size="large" />
          <h2 className="text-lg font-semibold mt-2 mb-0 text-white">Sua aprovação começa aqui</h2>
          <p className="text-xs text-muted-foreground text-center max-w-[280px] mt-2">
            O aplicativo jurídico que vai te levar da dúvida à aprovação. Domine a lei. Vença o edital.
          </p>
        </div>
        
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="E-mail"
              className="pl-10"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
            />
          </div>
          
          <div className="relative">
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              className="pl-10 pr-10"
              required
              minLength={6}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pending}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          <Button 
            type="submit" 
            size="lg" 
            disabled={pending || loading}
            className="mt-2 flex items-center gap-2"
          >
            {mode === "login" ? (
              <>
                <LogIn className="h-4 w-4" />
                {pending ? "Entrando..." : "Entrar"}
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                {pending ? "Criando conta..." : "Criar conta"}
              </>
            )}
          </Button>
          
          <div className="relative flex items-center gap-3 py-2">
            <div className="flex-grow h-px bg-border"></div>
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="flex-grow h-px bg-border"></div>
          </div>
          
          <Button 
            type="button" 
            variant="outline" 
            size="lg" 
            disabled={pending || loading}
            className="flex items-center gap-2"
            onClick={() => toast({
              title: "Google Sign In",
              description: "Funcionalidade a ser implementada",
            })}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" className="h-4 w-4">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
            </svg>
            Entrar com Google
          </Button>
        </form>
        
        {error && (
          <div className="text-destructive text-xs text-center flex items-center justify-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </div>
        )}
        
        <div className="text-center text-xs flex flex-col gap-3">
          {mode === "login" ? (
            <>
              <button className="text-primary hover:underline" onClick={() => setMode("register")}>
                Criar nova conta
              </button>
              <button className="text-muted-foreground hover:text-primary transition-colors" onClick={() => toast({
                title: "Recuperação de senha",
                description: "Funcionalidade a ser implementada",
              })}>
                Esqueci minha senha
              </button>
            </>
          ) : (
            <button className="text-primary hover:underline" onClick={() => setMode("login")}>
              Já tenho uma conta
            </button>
          )}
          
          <div className="text-muted-foreground mt-1">
            Ao continuar, você concorda com nossos{" "}
            <button className="text-primary hover:underline" onClick={() => toast({
              title: "Termos de uso",
              description: "Funcionalidade a ser implementada",
            })}>
              Termos de Uso
            </button>{" "}
            e{" "}
            <button className="text-primary hover:underline" onClick={() => toast({
              title: "Política de Privacidade",
              description: "Funcionalidade a ser implementada",
            })}>
              Política de Privacidade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
