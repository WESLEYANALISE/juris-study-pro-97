
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Mail, LogIn } from "lucide-react"; // Using LogIn instead of Google
import logo from "/favicon.ico"; // Substitua ou personalize se houver outro logo

const motivacional = "Tenha acesso aos melhores conteúdos jurídicos e transforme seus estudos com organização e foco.";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Verifica sessão ao abrir a página
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/", { replace: true });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/", { replace: true });
    });
    return () => subscription?.unsubscribe();
  }, [navigate]);

  // Login/cadastro com email via magic link
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      toast({
        title: "Link enviado!",
        description: "Verifique seu e-mail para acessar o app.",
      });
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Autenticação com Google (popup externo)
  const continueWithGoogle = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin, // após login
      },
    });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-md px-5 py-8 bg-card rounded-2xl shadow-lg border animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-14 w-14 rounded shadow-glow animate-fade-in" />
        </div>
        {/* Frase motivacional */}
        <h2 className="text-center text-xl font-semibold mb-2">Bem-vindo!</h2>
        <p className="text-muted-foreground text-center mb-8">{motivacional}</p>
        
        {/* Formulário de Email */}
        <form className="space-y-4 mb-4" onSubmit={handleEmailSubmit} autoComplete="off">
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">E-mail</label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="bg-white text-foreground"
            required
            disabled={isLoading}
          />
          <Button 
            size="full"
            type="submit"
            variant="default"
            disabled={isLoading || !email}
          >
            <Mail className="mr-2" /> Continuar com E-mail
          </Button>
        </form>

        {/* Separador */}
        <div className="relative flex items-center justify-center mb-4">
          <Separator className="flex-1" />
          <span className="mx-3 text-xs text-muted-foreground">ou</span>
          <Separator className="flex-1" />
        </div>

        {/* Google Auth */}
        <Button
          onClick={continueWithGoogle}
          variant="outline"
          size="full"
          className="
            bg-white text-foreground shadow
            hover:bg-accent border border-border
            flex items-center
            rounded-lg font-semibold 
            transition
          "
          disabled={isLoading}
          type="button"
        >
          <LogIn className="mr-2 text-[#4285F4]" />
          Entrar com o Google
        </Button>
      </div>
    </div>
  );
}
