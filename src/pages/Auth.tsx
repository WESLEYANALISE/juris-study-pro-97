
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ExternalLink, Mail } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const LOGO_URL = "/lovable-uploads/58dfe876-fea8-4a29-9b9e-a8cbd69b2c5f.png";
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
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/", { replace: true });
      }
    };
    
    checkSession();
  }, [navigate]);

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

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/" }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast.error("Erro ao entrar com Google: " + (error.message || "Tente novamente mais tarde"));
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    const email = loginForm.getValues("email");
    if (!email || !z.string().email().safeParse(email).success) {
      loginForm.setError("email", { message: "Email inválido" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin + "/" }
      });

      if (error) throw error;
      
      setMagicLinkSent(true);
      toast.success("Link enviado! Verifique seu email para fazer login");
    } catch (error: any) {
      toast.error("Erro ao enviar link: " + (error.message || "Tente novamente mais tarde"));
    } finally {
      setLoading(false);
    }
  };

  const onLoginSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password
      });
      
      if (error) throw error;
      
      toast.success("Login realizado com sucesso");
      navigate("/", { replace: true });
    } catch (error: any) {
      toast.error("Erro na autenticação: " + (error.message || "Tente novamente mais tarde"));
    } finally {
      setLoading(false);
    }
  };

  const onSignupSubmit = async (values: SignupFormValues) => {
    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            display_name: values.name
          },
          emailRedirectTo: window.location.origin + "/"
        }
      });
      
      if (error) throw error;
      
      toast.success("Cadastro realizado com sucesso! Verifique seu email para confirmar a conta.");
      
      if (data?.session) {
        // Atualizar o perfil do usuário com o nome
        await supabase
          .from('profiles')
          .update({ display_name: values.name })
          .eq('id', data.user?.id);

        navigate("/", { replace: true });
      }
    } catch (error: any) {
      toast.error("Erro no cadastro: " + (error.message || "Tente novamente mais tarde"));
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
            alt="JurisStudy Pro Logo"
            className="h-20 w-20 mb-2 rounded-full bg-muted shadow"
          />
          <CardTitle className="text-2xl font-black text-primary tracking-tight">
            JurisStudy Pro
          </CardTitle>
          <CardDescription className="text-center">{SUBTITLE}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-0">
          {magicLinkSent ? (
            <div className="text-center py-10">
              <p className="font-semibold text-primary">Confira sua caixa de entrada!</p>
              <p className="text-sm mt-2 text-muted-foreground">
                Enviamos um link mágico para <span className="font-medium">{loginForm.getValues("email")}</span>
              </p>
              <Button
                variant="secondary"
                className="mt-6 rounded-lg"
                onClick={() => setMagicLinkSent(false)}
              >
                Voltar
              </Button>
            </div>
          ) : (
            <>
              <Tabs
                defaultValue="login"
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as "login" | "signup")}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="signup">Cadastrar</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-0">
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="seu@email.com"
                                disabled={loading}
                                autoComplete="email"
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
                            <FormLabel>Senha</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Sua senha"
                                disabled={loading}
                                autoComplete="current-password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full mt-4"
                        disabled={loading}
                      >
                        {loading ? "Entrando..." : "Entrar"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="signup" className="mt-0">
                  <Form {...signupForm}>
                    <form
                      onSubmit={signupForm.handleSubmit(onSignupSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={signupForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome completo</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Seu nome"
                                disabled={loading}
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
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="seu@email.com"
                                disabled={loading}
                                autoComplete="email"
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
                            <FormLabel>Senha</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                disabled={loading}
                                autoComplete="new-password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full mt-4"
                        disabled={loading}
                      >
                        {loading ? "Cadastrando..." : "Cadastrar"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>

              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-px bg-muted-foreground/20" />
                <span className="text-xs text-muted-foreground">ou</span>
                <div className="flex-1 h-px bg-muted-foreground/20" />
              </div>

              <Button
                type="button"
                className="w-full flex items-center justify-center gap-2 rounded-md"
                onClick={handleGoogleAuth}
                disabled={loading}
                variant="outline"
              >
                <ExternalLink className="h-5 w-5 text-blue-600" />
                <span>{loading ? "Entrando..." : "Continuar com Google"}</span>
              </Button>

              <Button
                type="button"
                className="w-full flex items-center justify-center gap-2 rounded-md"
                onClick={handleMagicLink}
                disabled={loading}
                variant="ghost"
              >
                <Mail className="h-5 w-5" />
                <span>Entrar com link mágico</span>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
