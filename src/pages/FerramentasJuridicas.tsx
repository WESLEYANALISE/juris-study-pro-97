
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BookMarked, Search, FileSymlink, Clock, Scale } from "lucide-react";

const FerramentasJuridicas = () => {
  const navigate = useNavigate();
  
  const ferramentas = [
    {
      icon: BookMarked,
      title: "Vade Mecum Digital",
      description: "Códigos e legislação ao seu alcance",
      path: "/ferramentas/vademecum",
      color: "text-blue-600"
    },
    {
      icon: Search,
      title: "Dicionário Jurídico",
      description: "Consulta de termos e conceitos jurídicos",
      path: "/ferramentas/dicionario",
      color: "text-purple-600"
    },
    {
      icon: FileSymlink,
      title: "Modelos de Documentos",
      description: "Templates prontos para uso profissional",
      path: "/ferramentas/modelos",
      color: "text-green-600"
    },
    {
      icon: Clock,
      title: "Cronograma de Estudos",
      description: "Organize sua rotina de preparação",
      path: "/ferramentas/cronograma",
      color: "text-amber-600"
    }
  ];

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="flex flex-col items-center mb-8">
        <div className="mb-6">
          <Scale className="h-12 w-12 text-primary mx-auto mb-2" />
          <h1 className="text-2xl font-bold mb-1">Ferramentas Jurídicas</h1>
          <p className="text-muted-foreground mb-4">
            Recursos essenciais para sua prática jurídica
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ferramentas.map((ferramenta, index) => (
          <Card key={index} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border h-full">
            <CardHeader className="p-4">
              <div className="flex items-center gap-2">
                <ferramenta.icon className={`h-6 w-6 ${ferramenta.color}`} />
                <CardTitle className="text-xl">{ferramenta.title}</CardTitle>
              </div>
              <CardDescription className="text-sm mt-2">
                {ferramenta.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                {index === 0 && "Acesse a legislação brasileira atualizada, incluindo códigos, leis e súmulas dos principais tribunais."}
                {index === 1 && "Consulte definições de termos jurídicos, conceitos doutrinários e expressões em latim utilizadas no Direito."}
                {index === 2 && "Biblioteca com diversos modelos de peças processuais, contratos e documentos jurídicos prontos para uso."}
                {index === 3 && "Organize seus estudos com um cronograma personalizado, definindo metas e acompanhando seu progresso."}
              </p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button 
                onClick={() => navigate(ferramenta.path)} 
                className="w-full min-h-[48px]"
              >
                Acessar {ferramenta.title}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FerramentasJuridicas;
