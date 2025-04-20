
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Provider } from '@supabase/supabase-js';
import { toast } from 'sonner';

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
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login JurisStudy</h2>
      
      <form onSubmit={handleSignIn} className="space-y-4">
        <Input 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
        <Input 
          type="password" 
          placeholder="Senha" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />
        
        <div className="space-y-2">
          <Button type="submit" className="w-full">Entrar</Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleSignUp} 
            className="w-full"
          >
            Cadastrar
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleGoogleSignIn} 
            className="w-full"
          >
            Entrar com Google
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Auth;
