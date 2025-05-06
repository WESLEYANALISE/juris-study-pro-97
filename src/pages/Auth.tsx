
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";

const LOGO_URL = "https://imgur.com/G15NKWM.png";
const SUBTITLE = "Acesse ou crie uma conta para aproveitar a experiência jurídica completa.";

const loginSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres")
});

const signupSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres")
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const Auth = () => {
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [authError, setAuthError] = useState<string | null>(null);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const from = location.state?.from || "/";
        navigate(from, { replace: true });
      }
    };
    
    checkSession();
  }, [navigate, location.state]);

  useEffect(() => {
    // Reset error when tab changes
    setAuthError(null);
  }, [activeTab]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  });

  const onLoginSubmit = async (values: LoginFormValues) => {
    setAuthError(null);
    setLoading(true);
    try {
      const { data, error } = await signIn(values.email, values.password);
      
      if (error) {
        // Check if error is about invalid credentials
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos. Tente novamente.');
        }
        throw error;
      }
      
      if (data?.session) {
        const from = location.state?.from || "/";
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      setAuthError(error.message);
      toast.error(error.message || "Erro na autenticação. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const onSignupSubmit = async (values: SignupFormValues) => {
    setAuthError(null);
    setLoading(true);
    
    try {
      console.log("Tentando cadastrar novo usuário:", values.email);
      
      const { data, error } = await signUp(values.email, values.password, {
        display_name: values.name
      });
      
      if (error) {
        console.error("Erro retornado pelo Supabase:", error);
        // Verificação específica para usuário já registrado
        if (error.message.includes("User already registered")) {
          throw new Error(`O email ${values.email} já está cadastrado. Tente fazer login ou recuperar sua senha.`);
        }
        throw error;
      }
      
      if (data.user?.identities?.length === 0) {
        // Se identities é um array vazio, o usuário já existe
        setAuthError(`O email ${values.email} já está cadastrado. Tente fazer login ou recuperar sua senha.`);
        setRecoveryMode(true);
        return;
      }
      
      toast.success("Cadastro realizado com sucesso! Verifique seu email para confirmar a conta.");
      
      if (data.session) {
        navigate("/", { replace: true });
      }
    } catch (error: any) {
      console.error("Erro no processo de cadastro:", error);
      
      // Handle specific cases
      if (error.message.includes("already registered") || error.message.includes("já está cadastrado")) {
        setAuthError(error.message);
        setRecoveryMode(true);
      } else {
        setAuthError(error.message);
        toast.error("Erro no cadastro: " + (error.message || "Tente novamente mais tarde"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const email = activeTab === "login" 
      ? loginForm.getValues("email") 
      : signupForm.getValues("email");

    if (!email || !z.string().email().safeParse(email).success) {
      const form = activeTab === "login" ? loginForm : signupForm;
      form.setError("email", { message: "Email inválido" });
      return;
    }

    setLoading(true);
    try {
      console.log("Enviando email de recuperação para:", email);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/auth"
      });

      if (error) throw error;
      
      toast.success("Instruções para redefinir sua senha foram enviadas para seu email");
      setRecoveryMode(false);
    } catch (error: any) {
      console.error("Erro ao enviar email de recuperação:", error);
      toast.error("Erro ao enviar email de recuperação: " + (error.message || "Tente novamente mais tarde"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-slate-50 via-gray-100 to-primary/10 dark:from-muted dark:to-bg p-4">
      <Card className="w-full max-w-md border shadow-xl rounded-xl bg-background animate-fade-in">
        <CardHeader className="flex flex-col items-center gap-2 pb-2">
          <img
            src={LOGO_URL}
            alt="Direito 360 Logo"
            className="h-24 w-24 mb-2" // Increased logo size
          />
          <CardTitle className="text-3xl font-black text-primary tracking-tight">
            Direito 360
          </CardTitle>
          <CardDescription className="text-center text-base">{SUBTITLE}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-0">
          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {authError}
              </AlertDescription>
            </Alert>
          )}

          {recoveryMode && (
            <div className="bg-muted p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">Esqueceu sua senha?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Podemos enviar um link para redefinir sua senha.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  className="text-sm" 
                  onClick={() => setRecoveryMode(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  className="text-sm flex items-center gap-1"
                  onClick={handleResetPassword}
                  disabled={loading}
                >
                  Redefinir senha
                </Button>
              </div>
            </div>
          )}

          <Tabs
            defaultValue="login"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "login" | "signup")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="text-base py-3">Entrar</TabsTrigger>
              <TabsTrigger value="signup" className="text-base py-3">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0">
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="seu@email.com"
                            disabled={loading}
                            autoComplete="email"
                            className="h-12 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel className="text-base">Senha</FormLabel>
                          <button 
                            type="button" 
                            className="text-sm text-muted-foreground hover:text-primary"
                            onClick={() => setRecoveryMode(true)}
                          >
                            Esqueceu a senha?
                          </button>
                        </div>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Sua senha"
                            disabled={loading}
                            autoComplete="current-password"
                            className="h-12 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full mt-6 h-14 text-lg"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <Form {...signupForm}>
                <form
                  onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={signupForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Nome completo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Seu nome"
                            disabled={loading}
                            className="h-12 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="seu@email.com"
                            disabled={loading}
                            autoComplete="email"
                            className="h-12 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            disabled={loading}
                            autoComplete="new-password"
                            className="h-12 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full mt-6 h-14 text-lg"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      "Cadastrar"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4 pb-6">
          <div className="text-sm text-center text-muted-foreground mt-2">
            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
