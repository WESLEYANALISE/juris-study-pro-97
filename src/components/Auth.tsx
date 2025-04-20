
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Provider } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { Scale } from 'lucide-react';
import { cn } from "@/lib/utils";

export const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Function to get greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Email Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast.success(`${getGreeting()}, bem-vindo(a) ao JurisStudy!`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Email Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success(`${getGreeting()}, bem-vindo(a) de volta!`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-background rounded-lg shadow-md flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-col items-center mb-8 space-y-4">
        <Scale 
          className={cn(
            "h-16 w-16 text-primary animate-pulse-subtle", 
            "transition-transform duration-300 hover:scale-110"
          )} 
        />
        <div className="text-center">
          <h1 className={cn(
            "text-4xl font-bold text-primary",
            "animate-fade-in tracking-tight"
          )}>
            JurisStudy
          </h1>
          <p className="text-muted-foreground mt-2 animate-slide-up">
            Plataforma de Estudos Jurídicos
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSignIn} className="w-full space-y-4">
        <Input 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
          className="animate-enter"
        />
        <Input 
          type="password" 
          placeholder="Senha" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
          className="animate-enter"
        />
        
        <div className="space-y-2">
          <Button 
            type="submit" 
            className="w-full animate-enter"
          >
            Entrar
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleSignUp} 
            className="w-full animate-enter"
          >
            Cadastrar
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleGoogleSignIn} 
            className="w-full animate-enter"
          >
            Entrar com Google
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Auth;
