
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Mail, Google } from "lucide-react";

const LOGO_URL = "https://lovable.dev/opengraph-image-p98pqg.png"; // Você pode trocar para seu logo local depois!

export default function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Detecção de autenticação já feita
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/");
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  // Enviar magic link para login/cadastro
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Registrar ou logar: o supabase faz os dois automaticamente
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + "/",
        },
      });
      if (error) throw error;
      toast({
        title: "Verifique seu e-mail",
        description: "Enviamos um link mágico para acesso!",
      });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Google auth
  const handleGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/" },
      });
      if (error) throw error;
      // A navegação ocorre por conta do redirect do Google
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5DEFF] via-[#F1F0FB] to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-xl shadow-card-hover bg-white p-8 pt-6 flex flex-col gap-6">
        {/* Logo */}
        <img
          src={LOGO_URL}
          alt="Logo JurisStudy"
          className="h-20 mx-auto mb-2"
        />
        {/* Frase inspiradora */}
        <p className="text-center text-lg font-semibold text-juris-purple-dark mb-1">
          Tenha acesso aos melhores conteúdos jurídicos e transforme seus estudos com organização e foco.
        </p>
        {/* Formulário de e-mail */}
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4 w-full">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700 pl-0.5">
              E-mail
            </label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              placeholder="seu@email.com"
              onChange={e => setEmail(e.target.value)}
              className="text-base bg-[rgba(245,245,255,0.7)] border border-juris-purple-light"
              autoComplete="email"
            />
          </div>
          <Button
            disabled={loading || !email}
            className="w-full bg-juris-purple hover:bg-juris-purple-dark text-white text-base shadow hover:shadow-lg transition disabled:opacity-60"
            type="submit"
            size="full"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Mail className="mr-2" /> }
            Continuar com e-mail
          </Button>
        </form>
        {/* Separador */}
        <div className="flex items-center gap-2 my-2">
          <div className="h-px flex-1 bg-gray-200"/>
          <span className="text-xs text-gray-400">ou</span>
          <div className="h-px flex-1 bg-gray-200"/>
        </div>
        {/* Google login */}
        <Button
          type="button"
          variant="outline"
          className="w-full border shadow hover:bg-gray-50 text-base flex items-center"
          size="full"
          onClick={handleGoogle}
          disabled={loading}
        >
          <span className="mr-2 flex items-center">
            <Google className="w-5 h-5" />
          </span>
          Entrar com Google
        </Button>
        {/* Rodapé */}
        <div className="mt-1 text-xs text-center text-gray-400">
          Ao continuar, você aceita os <a href="#" className="underline text-juris-purple">Termos de Uso</a>.
        </div>
      </div>
    </div>
  );
}
