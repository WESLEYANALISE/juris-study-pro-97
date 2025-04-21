
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
// Fix the Google icon import
import { LucideProps } from "lucide-react";

// Create Google icon component since it's not exported directly from lucide-react
const Google = (props: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M17.13 15.21c-.73.47-1.58.79-2.57.94C13.43 16.39 12.56 16.5 12 16.5c-2.36 0-4.56-.89-6.06-2.39C4.44 12.61 3.5 10.41 3.5 8c0-2.36.89-4.56 2.44-6.06C7.44 0.44 9.64 0.5 12 0.5s4.56.89 6.06 2.44C19.56 4.44 20.5 6.64 20.5 9v1.5H8.5" />
    <path d="M12 8.5v8" />
    <path d="M8.5 12h7" />
  </svg>
);

const APP_LOGO_URL = "/placeholder.svg";

const inspirationalText =
  "Tenha acesso aos melhores conteúdos jurídicos e transforme seus estudos com organização e foco.";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [magicLink, setMagicLink] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    // Try sign in first (if user exists), otherwise sign up
    try {
      // Try login using passwordless magic link
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + "/",
        },
      });
      if (!signInError) {
        setMagicLink(true);
        setSuccess(true);
        toast({
          title: "Verifique seu e-mail",
          description:
            "Enviamos um link mágico para seu e-mail. Clique nele para acessar sua conta.",
        });
        return;
      }

      setError(signInError.message);
    } catch (err: any) {
      setError(
        err?.message ||
          "Erro inesperado ao processar seu login/cadastro. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleAuth() {
    setGoogleLoading(true);
    setError("");
    // Sign in with Google using Supabase OAuth
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/",
        },
      });
      if (error) setError(error.message);
    } catch (err: any) {
      setError(
        err?.message ||
          "Erro inesperado ao tentar login com o Google. Tente novamente."
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-gray-200 dark:from-background dark:to-card">
      <Card className="w-full max-w-md p-6 shadow-lg rounded-2xl border border-gray-200 dark:border-border bg-white dark:bg-card animate-fade-in">
        <CardContent className="p-0 pt-6 flex flex-col gap-7">
          {/* Logo */}
          <div className="flex flex-col items-center mb-1">
            <img
              src={APP_LOGO_URL}
              alt="Logo"
              className="h-16 w-16 mb-2 rounded-full bg-gray-100 shadow pulse"
            />
            <h1 className="font-extrabold text-2xl text-primary">JurisStudy Pro</h1>
          </div>
          {/* Inspiracional */}
          <p className="text-center text-base text-gray-700 dark:text-gray-200 mb-2">
            {inspirationalText}
          </p>
          {/* Formulário */}
          {!magicLink ? (
            <form className="space-y-4" onSubmit={handleEmailAuth}>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="font-medium text-sm text-gray-700 dark:text-gray-100">
                  E-mail
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  autoComplete="email"
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="rounded-lg px-4 py-2 border shadow-sm bg-gray-50 dark:bg-muted dark:text-white focus-visible:ring-primary"
                />
              </div>
              {error && (
                <div className="text-sm text-destructive font-medium">{error}</div>
              )}
              <Button
                type="submit"
                variant="default"
                className="w-full rounded-lg text-base font-semibold shadow hover-scale transition"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Continuar com e-mail"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-6">
              <p className="font-semibold text-primary">
                Confira sua caixa de entrada!
              </p>
              <p className="text-sm mt-2 text-muted-foreground">
                Enviamos um link mágico para <span className="font-medium">{email}</span>.
              </p>
              <Button
                variant="outline"
                className="mt-4 rounded-lg"
                onClick={() => setMagicLink(false)}
              >
                Voltar
              </Button>
            </div>
          )}

          {/* OU */}
          <div className="text-center text-muted-foreground text-xs">ou</div>
          {/* Google */}
          <Button
            variant="outline"
            type="button"
            className="w-full flex justify-center items-center gap-2 rounded-lg border shadow hover-scale"
            onClick={handleGoogleAuth}
            disabled={googleLoading}
          >
            <Google className="h-5 w-5 text-blue-600" />
            <span>
              {googleLoading ? "Entrando..." : "Entrar com Google"}
            </span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
