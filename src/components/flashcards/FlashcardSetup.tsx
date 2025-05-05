
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Dices, PlayCircle, Sparkles, FileAudio } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface FlashcardSetupProps {
  onStartStudy: (config: {
    selectedTemas: string[];
    selectedAreas: string[];
    showAnswers: boolean;
    studyMode: "manual" | "auto";
    autoNarrate: boolean;
    cardCount: number;
    spaceInterval: "normal" | "short" | "long";
  }) => void;
  availableAreas?: string[];
  availableTemas?: string[];
}

export function FlashcardSetup({ 
  onStartStudy,
  availableAreas = [],
  availableTemas = []
}: FlashcardSetupProps) {
  const [step, setStep] = useState<'config' | 'advanced'>('config');
  
  const form = useForm({
    defaultValues: {
      selectedTemas: [] as string[],
      selectedAreas: [] as string[],
      showAnswers: true,
      studyMode: "manual" as "manual" | "auto",
      autoNarrate: false,
      cardCount: 20,
      spaceInterval: "normal" as "normal" | "short" | "long"
    }
  });
  
  const watchStudyMode = form.watch("studyMode");
  
  const handleRandomize = () => {
    // Select random areas (1-3)
    const randomAreaCount = Math.floor(Math.random() * 3) + 1;
    const shuffledAreas = [...availableAreas].sort(() => 0.5 - Math.random());
    const randomAreas = shuffledAreas.slice(0, randomAreaCount);
    
    // Select random temas (2-5)
    const randomTemaCount = Math.floor(Math.random() * 4) + 2;
    const shuffledTemas = [...availableTemas].sort(() => 0.5 - Math.random());
    const randomTemas = shuffledTemas.slice(0, randomTemaCount);
    
    // Update form
    form.setValue("selectedAreas", randomAreas);
    form.setValue("selectedTemas", randomTemas);
  };
  
  const onSubmit = form.handleSubmit((data) => {
    onStartStudy(data);
  });

  return (
    <Card className="border border-primary/20">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Sparkles className="mr-2 h-5 w-5 text-primary" /> Configurar Estudo
        </CardTitle>
        <CardDescription>
          Escolha as áreas e temas que deseja estudar
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            {step === 'config' ? (
              <>
                {/* Areas selection */}
                <FormField
                  control={form.control}
                  name="selectedAreas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Áreas de estudo</FormLabel>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {availableAreas.map((area) => (
                          <Badge
                            key={area}
                            variant={field.value.includes(area) ? "default" : "outline"}
                            className={cn(
                              "cursor-pointer transition-all",
                              field.value.includes(area) 
                                ? "bg-primary text-primary-foreground" 
                                : "hover:bg-primary/10"
                            )}
                            onClick={() => {
                              const updatedValue = field.value.includes(area)
                                ? field.value.filter(val => val !== area)
                                : [...field.value, area];
                              field.onChange(updatedValue);
                            }}
                          >
                            {area}
                            {field.value.includes(area) && (
                              <Check className="ml-1 h-3 w-3" />
                            )}
                          </Badge>
                        ))}
                      </div>
                      <FormDescription>
                        Selecione as áreas que deseja estudar
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                {/* Temas selection */}
                <FormField
                  control={form.control}
                  name="selectedTemas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temas</FormLabel>
                      <ScrollArea className="h-32 rounded-md border p-2">
                        <div className="space-y-2">
                          {availableTemas.map((tema) => (
                            <div key={tema} className="flex items-center space-x-2">
                              <Checkbox
                                id={`tema-${tema}`}
                                checked={field.value.includes(tema)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, tema]);
                                  } else {
                                    field.onChange(field.value.filter(val => val !== tema));
                                  }
                                }}
                              />
                              <label
                                htmlFor={`tema-${tema}`}
                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {tema}
                              </label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <FormDescription>
                        Selecione os temas específicos para estudo
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                {/* Card count */}
                <FormField
                  control={form.control}
                  name="cardCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade de cartões: {field.value}</FormLabel>
                      <FormControl>
                        <Slider
                          min={5}
                          max={50}
                          step={5}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="py-4"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {/* Study mode */}
                <FormField
                  control={form.control}
                  name="studyMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modo de estudo</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => field.onChange(value as "manual" | "auto")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha o modo de estudo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual (você controla o ritmo)</SelectItem>
                          <SelectItem value="auto">Automático (tempo definido)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                {/* Auto-narrate option */}
                {watchStudyMode === "auto" && (
                  <FormField
                    control={form.control}
                    name="autoNarrate"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex items-center">
                            <FileAudio className="mr-2 h-4 w-4 text-primary" />
                            Narração automática
                          </FormLabel>
                          <FormDescription>
                            Ler as perguntas e respostas automaticamente
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
                
                {/* Show answers option */}
                <FormField
                  control={form.control}
                  name="showAnswers"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Mostrar respostas</FormLabel>
                        <FormDescription>
                          Exibir respostas automaticamente ou manualmente
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <>
                {/* Advanced options */}
                <FormField
                  control={form.control}
                  name="spaceInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intervalo de repetição espaçada</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha o intervalo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Curto (revisões mais frequentes)</SelectItem>
                          <SelectItem value="normal">Normal (equilíbrio entre revisões)</SelectItem>
                          <SelectItem value="long">Longo (revisões mais espaçadas)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Define o intervalo entre as revisões dos cartões
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-4 pb-3">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step === 'config' ? 'advanced' : 'config')}
              >
                {step === 'config' ? 'Opções avançadas' : 'Voltar'}
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                onClick={handleRandomize}
                className="flex items-center"
              >
                <Dices className="mr-2 h-4 w-4" /> Aleatório
              </Button>
            </div>
            
            <Button type="submit" className="bg-gradient-to-r from-primary/90 to-purple-600/90">
              <PlayCircle className="mr-2 h-4 w-4" /> Iniciar Estudo
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
