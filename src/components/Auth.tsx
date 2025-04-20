
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { Scale } from 'lucide-react';
import { cn } from "@/lib/utils";

export const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

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
            "h-16 w-16 text-primary", 
            "transition-transform duration-1000",
            animationComplete ? "scale-100" : "scale-0",
            "animate-bounce-slow"
          )} 
        />
        <div className="text-center overflow-hidden">
          <h1 className={cn(
            "text-4xl font-bold text-primary tracking-tight",
            "transition-all duration-700 delay-300",
            animationComplete ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}>
            JurisStudy
          </h1>
          <p className={cn(
            "text-muted-foreground mt-2",
            "transition-all duration-700 delay-500",
            animationComplete ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          )}>
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
          className={cn(
            "transition-all duration-500 delay-700",
            animationComplete ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}
        />
        <Input 
          type="password" 
          placeholder="Senha" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
          className={cn(
            "transition-all duration-500 delay-800",
            animationComplete ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}
        />
        
        <div className="space-y-2">
          <Button 
            type="submit" 
            className={cn(
              "w-full",
              "transition-all duration-500 delay-900",
              animationComplete ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}
          >
            Entrar
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleSignUp} 
            className={cn(
              "w-full",
              "transition-all duration-500 delay-1000",
              animationComplete ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}
          >
            Cadastrar
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleGoogleSignIn} 
            className={cn(
              "w-full",
              "transition-all duration-500 delay-1100",
              animationComplete ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}
          >
            Entrar com Google
          </Button>
        </div>
      </form>
      
      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Auth;
