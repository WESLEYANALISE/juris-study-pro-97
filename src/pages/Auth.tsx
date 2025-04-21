
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient"; // Corrigir o caminho para o cliente Supabase
import { icons } from "lucide-react";

const GoogleIcon = icons["google"];

const LOGO_URL = "/placeholder.svg";
const SUBTITLE = "Acesse com e-mail ou Google e aproveite a experiência jurídica completa.";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [magicSent, setMagicSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/" },
    });

    if (signInError) {
      setError(signInError.message || "Erro ao enviar o e-mail. Tente novamente.");
    } else {
      setMagicSent(true);
      toast({
        title: "Verifique seu e-mail",
        description: "Enviamos um link mágico de acesso. Confira sua caixa de entrada!",
      });
    }

    setLoading(false);
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/" }
    });
    if (error) setError(error.message || "Erro no login com Google.");
    setGoogleLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-slate-50 via-gray-100 to-primary/10 dark:from-muted dark:to-bg">
      <Card className="w-full max-w-md border shadow-xl rounded-xl bg-background animate-fade-in">
        <CardHeader className="flex flex-col items-center gap-2 pb-2">
          <img src={LOGO_URL} alt="Logo" className="h-14 w-14 mb-2 rounded-full bg-muted shadow" />
          <CardTitle className="text-2xl font-black text-primary tracking-tight">JurisStudy Pro</CardTitle>
          <CardDescription className="text-center">{SUBTITLE}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-8 pt-0">
          {!magicSent ? (
            <>
              <form className="space-y-5" onSubmit={handleEmail}>
                <div>
                  <label htmlFor="email" className="font-semibold text-sm mb-2 block">
                    E-mail
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    autoFocus
                  />
                </div>
                {error && (
                  <div className="text-sm text-destructive font-medium">{error}</div>
                )}
                <Button
                  type="submit"
                  className="w-full rounded-md text-base font-semibold shadow transition"
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Entrar com link mágico"}
                </Button>
              </form>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-muted-foreground/20" />
                <span className="text-xs text-muted-foreground">ou</span>
                <div className="flex-1 h-px bg-muted-foreground/20" />
              </div>
              <Button
                type="button"
                className="w-full flex items-center justify-center gap-2 rounded-md border shadow"
                onClick={handleGoogle}
                disabled={googleLoading}
                variant="outline"
              >
                <GoogleIcon className="h-5 w-5 text-blue-600" />
                <span>{googleLoading ? "Entrando..." : "Entrar com Google"}</span>
              </Button>
            </>
          ) : (
            <div className="text-center py-10">
              <p className="font-semibold text-primary">Confira sua caixa de entrada!</p>
              <p className="text-sm mt-2 text-muted-foreground">
                Enviamos um link mágico para <span className="font-medium">{email}</span>.
              </p>
              <Button
                variant="secondary"
                className="mt-6 rounded-lg"
                onClick={() => { setMagicSent(false); setEmail(""); }}
              >
                Voltar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
