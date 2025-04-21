
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";

const AuthPage = () => {
  const { user, loading, error, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    if (mode === "login") {
      await signIn(email, password);
    } else {
      await signUp(email, password);
    }
    setPending(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-primary/10 via-background to-background px-2">
      <div className="w-full max-w-sm bg-background border rounded-xl shadow-lg py-8 px-6 flex flex-col gap-6">
        <div className="flex flex-col items-center">
          <div className="bg-primary rounded-full p-3 mb-2 shadow-sm">
            <Scale className="w-8 h-8 text-white drop-shadow" />
          </div>
          <h1 className="font-extrabold text-xl mb-0 text-primary">JurisStudy Pro</h1>
          <p className="text-xs text-muted-foreground text-center max-w-[220px]">Entre para continuar sua jornada de estudos jurídicos 👩‍⚖️</p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="E-mail"
            required
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
          />
          <Input
            type="password"
            placeholder="Senha"
            required
            minLength={6}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={pending}
          />
          <Button type="submit" size="full" disabled={pending || loading}>
            {pending ? "Carregando..." : mode === "login" ? "Entrar" : "Cadastrar"}
          </Button>
        </form>
        {error && <div className="text-red-600 text-xs text-center">{error}</div>}
        <div className="text-center text-xs text-muted-foreground">
          {mode === "login" ? (
            <>
              Ainda não tem conta?{" "}
              <button className="text-primary font-semibold underline" onClick={() => setMode("register")} type="button">
                Cadastrar
              </button>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <button className="text-primary font-semibold underline" onClick={() => setMode("login")} type="button">
                Entrar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
