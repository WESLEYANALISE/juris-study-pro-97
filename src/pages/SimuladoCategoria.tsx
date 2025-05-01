
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimuladoCategoria as CategoriaType, SimuladoSessao } from "@/types/simulados";
import { useAuth } from "@/hooks/use-auth";
import { SimuladoDashboard } from "@/components/simulados/SimuladoDashboard";
import { SimuladoSetup } from "@/components/simulados/SimuladoSetup";
import { useSimulado } from "@/hooks/use-simulado";
import { GraduationCap, TrendingUp, BookOpen, Newspaper, Calendar } from "lucide-react";
import { JuridicalBackground } from "@/components/ui/juridical-background";
import { SimuladosAreasRelacionadas } from "@/components/simulados/SimuladosAreasRelacionadas";
import { SimuladosNews } from "@/components/simulados/SimuladosNews";
import { SimuladosEstudos } from "@/components/simulados/SimuladosEstudos";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

const categoriaInfo = {
  oab: {
    titulo: "Exame da OAB",
    descricao: "Prepare-se para o Exame da Ordem dos Advogados do Brasil",
    icon: GraduationCap
  },
  prf: {
    titulo: "Polícia Rodoviária Federal",
    descricao: "Preparação para o concurso da PRF",
    icon: GraduationCap
  },
  pf: {
    titulo: "Polícia Federal",
    descricao: "Preparação para concursos da PF",
    icon: GraduationCap
  },
  tjsp: {
    titulo: "Tribunal de Justiça de SP",
    descricao: "Preparação para concursos do TJSP",
    icon: GraduationCap
  },
  juiz: {
    titulo: "Magistratura",
    descricao: "Preparação para concursos de Juiz",
    icon: GraduationCap
  },
  promotor: {
    titulo: "Ministério Público",
    descricao: "Preparação para concursos de Promotor",
    icon: GraduationCap
  },
  delegado: {
    titulo: "Delegado de Polícia",
    descricao: "Preparação para concursos de Delegado",
    icon: GraduationCap
  }
};

const SimuladoCategoria = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { categoria } = useParams<{ categoria: string }>();
  const categoriaUpper = categoria?.toUpperCase() as CategoriaType || "OAB";

  const [loading, setLoading] = useState(true);
  const [sessoes, setSessoes] = useState<SimuladoSessao[]>([]);

  const { useCreateSessao } = useSimulado(categoriaUpper);
  const createSessaoMutation = useCreateSessao();
  
  const info = categoriaInfo[categoria?.toLowerCase() as keyof typeof categoriaInfo] || {
    titulo: "Simulado",
    descricao: "Preparação para concursos jurídicos",
    icon: GraduationCap
  };

  const IconComponent = info.icon;

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    const fetchSessoes = async () => {
      try {
        const { data, error } = await supabase
          .from('simulado_sessoes')
          .select('*')
          .eq('user_id', user.id)
          .eq('categoria', categoriaUpper)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setSessoes(data || []);
      } catch (error) {
        console.error('Erro ao buscar sessões:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o histórico de simulados",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessoes();
  }, [user, categoriaUpper, navigate, toast]);

  const handleCreateSimulado = async (config: { categoria: CategoriaType; questoes: number }) => {
    try {
      const sessao = await createSessaoMutation.mutateAsync({
        categoria: config.categoria,
        total_questoes: config.questoes
      });
      
      navigate(`/simulados/${categoria}/sessao/${sessao.id}`);
    } catch (error) {
      console.error('Erro ao criar simulado:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar o simulado",
        variant: "destructive"
      });
    }
  };

  if (!categoria) {
    navigate("/simulados");
    return null;
  }

  return (
    <JuridicalBackground variant="scales" opacity={0.03}>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10">
              <IconComponent className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{info.titulo}</h1>
              <p className="text-muted-foreground">{info.descricao}</p>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate('/simulados')}
            variant="outline"
          >
            Voltar para Simulados
          </Button>
        </div>

        <Tabs defaultValue="novo" className="w-full">
          <TabsList className="grid grid-cols-4 md:w-[600px]">
            <TabsTrigger value="novo" className="flex gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Iniciar Simulado</span>
              <span className="sm:hidden">Novo</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Estatísticas</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="materiais" className="flex gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Materiais</span>
              <span className="sm:hidden">Materiais</span>
            </TabsTrigger>
            <TabsTrigger value="noticias" className="flex gap-2">
              <Newspaper className="h-4 w-4" />
              <span className="hidden sm:inline">Notícias</span>
              <span className="sm:hidden">News</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="novo" className="space-y-6">
            <SimuladoSetup 
              onStart={(config) => handleCreateSimulado({...config, categoria: categoriaUpper})} 
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Simulados Recentes</CardTitle>
                <CardDescription>Seus últimos simulados desta categoria</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full rounded-md" />
                    <Skeleton className="h-16 w-full rounded-md" />
                    <Skeleton className="h-16 w-full rounded-md" />
                  </div>
                ) : sessoes.length > 0 ? (
                  <div className="space-y-3">
                    {sessoes.map((sessao) => (
                      <Card key={sessao.id} className="bg-card/50 cursor-pointer hover:bg-accent/10 transition-colors">
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{new Date(sessao.data_inicio).toLocaleDateString()}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{sessao.total_questoes} questões</span>
                              <span>{sessao.acertos}/{sessao.total_questoes} acertos</span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => navigate(sessao.completo 
                              ? `/simulados/resultado/${sessao.id}` 
                              : `/simulados/${categoria}/sessao/${sessao.id}`
                            )}
                          >
                            {sessao.completo ? 'Ver Resultado' : 'Continuar'}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 bg-card/50 rounded-lg border border-dashed text-muted-foreground">
                    <p className="mb-1">Você ainda não realizou simulados nesta categoria</p>
                    <p>Crie seu primeiro simulado para começar!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <SimuladosAreasRelacionadas categoria={categoriaUpper} />
          </TabsContent>

          <TabsContent value="dashboard">
            <SimuladoDashboard categoria={categoriaUpper} />
          </TabsContent>

          <TabsContent value="materiais">
            <SimuladosEstudos categoria={categoriaUpper} />
          </TabsContent>

          <TabsContent value="noticias">
            <SimuladosNews categoria={categoriaUpper} />
          </TabsContent>
        </Tabs>
      </div>
    </JuridicalBackground>
  );
};

export default SimuladoCategoria;
