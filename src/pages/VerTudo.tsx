
import { useState } from "react";
import { 
  Scale, Video, BookOpen, Brain, FileText, GraduationCap, FilePlus, Gavel, 
  PenTool, Newspaper, MessageSquare, Monitor, Search, Settings, BookText, 
  Calendar, FileCode, Landmark, Clock, Lightbulb, Award, Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const VerTudo = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  
  const allFeatures = [
    {
      category: "Materiais de Estudo",
      items: [
        { icon: Video, title: "Vídeo-aulas", description: "Assista às aulas das principais disciplinas jurídicas", path: "/videoaulas", color: "text-blue-500" },
        { icon: BookOpen, title: "Biblioteca Jurídica", description: "Acesse livros, códigos e materiais de estudo", path: "/biblioteca", color: "text-green-500" },
        { icon: Brain, title: "Flashcards", description: "Memorize conceitos com repetição espaçada", path: "/flashcards", color: "text-purple-500" },
        { icon: FileText, title: "Resumos", description: "Banco de resumos e geração de novos resumos", path: "/resumos", color: "text-yellow-500" },
        { icon: BookText, title: "Vade Mecum", description: "Consulta rápida à legislação e códigos", path: "/vade-mecum", color: "text-rose-500" }
      ]
    },
    {
      category: "Prática e Treinamento",
      items: [
        { icon: GraduationCap, title: "Simulados", description: "Pratique com questões das principais bancas", path: "/simulados", color: "text-amber-500" },
        { icon: FilePlus, title: "Peticionário", description: "Modelos e templates de peças jurídicas", path: "/peticionario", color: "text-rose-500" },
        { icon: Gavel, title: "Jurisprudência", description: "Busque decisões judiciais e precedentes", path: "/jurisprudencia", color: "text-indigo-500" },
        { icon: PenTool, title: "Anotações", description: "Salve e organize suas anotações de estudo", path: "/anotacoes", color: "text-emerald-500" },
        { icon: Clock, title: "Controle de Prazos", description: "Gestão de prazos processuais", path: "/prazos", color: "text-sky-500" }
      ]
    },
    {
      category: "Conteúdo e Ferramentas",
      items: [
        { icon: Newspaper, title: "Notícias Jurídicas", description: "Atualizações do mundo jurídico", path: "/noticias", color: "text-cyan-500" },
        { icon: MessageSquare, title: "Bloger", description: "Artigos e publicações sobre Direito", path: "/bloger", color: "text-teal-500" },
        { icon: Monitor, title: "Remote Desktop", description: "Acesse sua área de trabalho remotamente", path: "/remote-desktop", color: "text-pink-500" },
        { icon: MessageSquare, title: "Assistente Jurídico", description: "Tire dúvidas com IA e obtenha ajuda", path: "/assistente", color: "text-orange-500" },
        { icon: Landmark, title: "Tribunais", description: "Acesso rápido aos principais tribunais", path: "/tribunais", color: "text-blue-400" }
      ]
    },
    {
      category: "Outros",
      items: [
        { icon: Calendar, title: "Calendário", description: "Agenda com compromissos e eventos jurídicos", path: "/calendario", color: "text-violet-500" },
        { icon: FileCode, title: "Calculadoras", description: "Calculadoras para diferentes áreas do Direito", path: "/calculadoras", color: "text-lime-500" },
        { icon: Lightbulb, title: "Dicas de Estudo", description: "Métodos e técnicas para otimizar seus estudos", path: "/dicas", color: "text-amber-400" },
        { icon: Award, title: "Certificados", description: "Seus certificados e conquistas", path: "/certificados", color: "text-yellow-600" },
        { icon: Users, title: "Grupos de Estudo", description: "Participe de grupos de estudo colaborativos", path: "/grupos", color: "text-indigo-400" }
      ]
    }
  ];

  const filteredFeatures = allFeatures.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Todas as Funcionalidades</h1>
        <p className="text-muted-foreground">
          Explore todas as ferramentas disponíveis no JurisStudy Pro
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          className="pl-10" 
          placeholder="Buscar funcionalidade..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
        />
      </div>

      <Tabs defaultValue="grid" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="grid">Grade</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid">
          {filteredFeatures.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{category.category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {category.items.map((item, itemIndex) => (
                  <Button
                    key={itemIndex}
                    variant="outline"
                    className="flex flex-col h-auto items-start p-4 border gap-2 hover:bg-accent hover:text-accent-foreground"
                    onClick={() => navigate(item.path)}
                  >
                    <div className="flex items-center w-full">
                      <item.icon className={`h-5 w-5 ${item.color} mr-2`} />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-left">{item.description}</p>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>
        
        <TabsContent value="list">
          {filteredFeatures.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-6">
              <h2 className="text-lg font-semibold mb-2">{category.category}</h2>
              <div className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <Button
                    key={itemIndex}
                    variant="ghost"
                    className="flex items-center w-full justify-start px-3 py-2 hover:bg-accent"
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className={`h-5 w-5 ${item.color} mr-3`} />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VerTudo;
