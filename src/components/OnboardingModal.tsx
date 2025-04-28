
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const areasInteresse = [
  { id: "direito_civil", label: "Direito Civil" },
  { id: "direito_penal", label: "Direito Penal" },
  { id: "direito_constitucional", label: "Direito Constitucional" },
  { id: "direito_administrativo", label: "Direito Administrativo" },
  { id: "direito_tributario", label: "Direito Tributário" },
  { id: "direito_trabalho", label: "Direito do Trabalho" },
  { id: "direito_empresarial", label: "Direito Empresarial" },
  { id: "direito_processual", label: "Direito Processual" },
];

const formSchema = z.object({
  displayName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  objetivo: z.enum(["oab", "concurso", "faculdade", "conhecimento", "carreira"], {
    required_error: "Selecione um objetivo",
  }),
  nivelAtual: z.enum(["iniciante", "intermediario", "avancado"], {
    required_error: "Selecione seu nível atual",
  }),
  horasEstudo: z.number().min(1).max(40),
  areasInteresse: z.array(z.string()).nonempty("Selecione pelo menos uma área de interesse"),
});

type FormValues = z.infer<typeof formSchema>;

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

const OnboardingModal = ({ open, onOpenChange, onComplete }: OnboardingModalProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      objetivo: "oab",
      nivelAtual: "iniciante",
      horasEstudo: 10,
      areasInteresse: [],
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Atualizar o perfil do usuário com o nome de exibição
      await supabase
        .from("profiles")
        .update({ 
          display_name: values.displayName,
          onboarding_completed: true 
        })
        .eq("id", user.id);

      // Criar o plano de estudos do usuário
      await supabase.from("plano_estudos").insert({
        user_id: user.id,
        area_interesse: values.areasInteresse,
        objetivo: values.objetivo,
        nivel_atual: values.nivelAtual,
        horas_estudo_semana: values.horasEstudo,
      });

      toast.success("Plano de estudos criado com sucesso!");
      
      // Chamar o callback de conclusão se fornecido
      if (onComplete) {
        onComplete();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao criar plano de estudos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Vamos começar!</DialogTitle>
          <DialogDescription>
            Configure seu plano de estudos personalizado para ter a melhor experiência.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 && (
              <>
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Como você gostaria de ser chamado?</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="objetivo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qual seu principal objetivo?</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um objetivo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="oab">Passar na OAB</SelectItem>
                          <SelectItem value="concurso">Concurso Público</SelectItem>
                          <SelectItem value="faculdade">Graduação em Direito</SelectItem>
                          <SelectItem value="conhecimento">Conhecimento Geral</SelectItem>
                          <SelectItem value="carreira">Desenvolvimento Profissional</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            {step === 2 && (
              <>
                <FormField
                  control={form.control}
                  name="nivelAtual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qual seu nível atual de conhecimento?</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione seu nível" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="iniciante">Iniciante</SelectItem>
                          <SelectItem value="intermediario">Intermediário</SelectItem>
                          <SelectItem value="avancado">Avançado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="horasEstudo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantas horas por semana você pretende estudar?</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          max={40} 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            {step === 3 && (
              <FormField
                control={form.control}
                name="areasInteresse"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Selecione suas áreas de interesse</FormLabel>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {areasInteresse.map((area) => (
                        <FormField
                          key={area.id}
                          control={form.control}
                          name="areasInteresse"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={area.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(area.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, area.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== area.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {area.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter className="flex justify-between mt-6">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Voltar
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={nextStep} className={step === 1 ? "ml-auto" : ""}>
                  Próximo
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading ? "Salvando..." : "Concluir"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
