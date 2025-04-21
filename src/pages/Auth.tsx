
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [formType, setFormType] = useState<"login" | "signup">("signup");
  const [loading, setLoading] = useState(false);

  // Está logado? Redireciona para /
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });
  }, [navigate]);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (!email || !nome) {
      toast("Preencha todos os campos!");
      setLoading(false);
      return;
    }

    try {
      if (formType === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          options: {
            data: { nome },
          },
        });
        if (error) throw error;
        toast("Cadastro realizado! Verifique seu e-mail.");
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
        });
        if (error) throw error;
        toast("Enviamos um e-mail para login!");
      }
    } catch (err: any) {
      toast(err.message || "Erro na autenticação");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {formType === "signup" ? "Criar Conta" : "Entrar"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Maria Silva"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                type="email"
              />
            </div>
            <Button className="mt-2" type="submit" disabled={loading}>
              {loading
                ? "Enviando..."
                : formType === "signup"
                ? "Cadastrar"
                : "Entrar"}
            </Button>
          </form>
          <div className="text-sm mt-4 text-center">
            {formType === "signup" ? (
              <>
                Já tem uma conta?{" "}
                <button
                  className="underline text-primary"
                  onClick={() => setFormType("login")}
                >
                  Entrar
                </button>
              </>
            ) : (
              <>
                Não possui conta?{" "}
                <button
                  className="underline text-primary"
                  onClick={() => setFormType("signup")}
                >
                  Cadastrar
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
