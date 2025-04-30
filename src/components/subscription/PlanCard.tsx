
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Feature {
  name: string;
  available: boolean;
}

interface PlanCardProps {
  title: string;
  description: string;
  price: string;
  features: Feature[];
  recommended?: boolean;
  className?: string;
  onSubscribe: () => void;
  current?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}

export function PlanCard({
  title,
  description,
  price,
  features,
  recommended = false,
  current = false,
  isLoading = false,
  disabled = false,
  onSubscribe,
  className,
}: PlanCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col",
        recommended ? "border-primary shadow-md" : "",
        current ? "border-primary/70 bg-primary/5" : "",
        className
      )}
    >
      {recommended && (
        <div className="bg-primary py-1 text-center text-sm font-medium text-primary-foreground">
          Recomendado
        </div>
      )}
      {current && (
        <div className="bg-primary/20 text-primary py-1 text-center text-sm font-medium">
          Seu plano atual
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mb-4 mt-2 flex items-baseline text-center">
          <span className="text-3xl font-bold tracking-tight">{price}</span>
          <span className="ml-1 text-sm text-muted-foreground">/mês</span>
        </div>

        <div className="mt-6 space-y-2">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={cn(
                "flex items-center",
                !feature.available ? "opacity-60" : ""
              )}
            >
              {feature.available ? (
                <Check className="mr-2 h-4 w-4 text-primary" />
              ) : (
                <div className="mr-2 h-4 w-4" />
              )}
              <span className="text-sm">{feature.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onSubscribe}
          className="w-full" 
          variant={recommended ? "default" : "outline"}
          disabled={disabled || isLoading || current}
        >
          {isLoading ? "Carregando..." : current ? "Plano atual" : "Assinar agora"}
        </Button>
      </CardFooter>
    </Card>
  );
}
