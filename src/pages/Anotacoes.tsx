import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, LinkIcon, Plus, Save, Search, Trash } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data for annotations
const mockNotes = [{
  id: 1,
  title: "Direito Constitucional - Controle de Constitucionalidade",
  content: "O controle de constitucionalidade é o mecanismo de verificação da compatibilidade entre uma lei ou ato normativo infraconstitucional e a Constituição. Pode ser preventivo ou repressivo, concentrado ou difuso.",
  createdAt: new Date('2025-04-15'),
  linkedTo: "Aula de Constitucional - Prof. Maria Silva",
  tags: ["constitucional", "controle", "videoaula"]
}, {
  id: 2,
  title: "Prazos Processuais - CPC",
  content: "Art. 219. Na contagem de prazo em dias, estabelecido por lei ou pelo juiz, computar-se-ão somente os dias úteis. Lembrando que para o Ministério Público e Defensoria Pública os prazos são contados em dobro.",
  createdAt: new Date('2025-04-14'),
  linkedTo: "Código de Processo Civil",
  tags: ["processual", "prazos", "CPC"]
}, {
  id: 3,
  title: "Preparação para OAB - Pontos principais",
  content: "Focar em: Ética, Constitucional, Civil, Processo Civil e Trabalho. Resolver pelo menos 30 questões por dia. Revisar pontos críticos nos fins de semana.",
  createdAt: new Date('2025-04-10'),
  linkedTo: "Calendário de estudos",
  tags: ["OAB", "planejamento", "estudos"]
}];
const Anotacoes = () => {
  const [notes, setNotes] = useState(mockNotes);
  const [searchTerm, setSearchTerm] = useState("");
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    linkedTo: ""
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const filteredNotes = notes.filter(note => note.title.toLowerCase().includes(searchTerm.toLowerCase()) || note.content.toLowerCase().includes(searchTerm.toLowerCase()) || note.tags.some(tag => tag.includes(searchTerm.toLowerCase())));
  const handleSaveNote = () => {
    if (!newNote.title || !newNote.content) return;
    const note = {
      id: Date.now(),
      title: newNote.title,
      content: newNote.content,
      createdAt: new Date(),
      linkedTo: newNote.linkedTo,
      tags: extractTags(newNote.content)
    };
    setNotes([note, ...notes]);
    setNewNote({
      title: "",
      content: "",
      linkedTo: ""
    });
  };
  const handleDeleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
  };
  const extractTags = (content: string) => {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex) || [];
    return matches.map(tag => tag.substring(1));
  };
  const handleAddToCalendar = (note: typeof mockNotes[0]) => {
    // In a real implementation, this would connect to Google Calendar API
    alert(`Nota "${note.title}" seria adicionada ao Google Calendar para ${format(selectedDate!, 'dd/MM/yyyy')}`);
  };
  return <div className="container mx-auto px-[12px]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Minhas Anotações</h1>
        <p className="text-muted-foreground">
          Organize suas notas de estudo e vincule com seu calendário
        </p>
      </div>
      
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Nova Anotação</CardTitle>
            <CardDescription>Crie uma nova anotação e organize seus estudos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Título da anotação" value={newNote.title} onChange={e => setNewNote({
            ...newNote,
            title: e.target.value
          })} />
            <Textarea placeholder="Conteúdo da anotação... Use #tags para organizar" className="min-h-[120px]" value={newNote.content} onChange={e => setNewNote({
            ...newNote,
            content: e.target.value
          })} />
            <div className="flex gap-2 items-center">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Vincular a um material (opcional)" value={newNote.linkedTo} onChange={e => setNewNote({
              ...newNote,
              linkedTo: e.target.value
            })} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveNote}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Anotação
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input className="pl-10" placeholder="Buscar em anotações ou #tags" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.map(note => <Card key={note.id}>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle className="text-lg">{note.title}</CardTitle>
                <div className="flex">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <CalendarComponent mode="single" selected={selectedDate} onSelect={setSelectedDate} locale={ptBR} />
                      <div className="p-3 border-t border-border">
                        <Button size="sm" className="w-full" onClick={() => handleAddToCalendar(note)}>
                          Adicionar ao Calendário
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteNote(note.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                {format(note.createdAt, "dd/MM/yyyy", {
              locale: ptBR
            })} 
                {note.linkedTo && ` • Vinculado a: ${note.linkedTo}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{note.content}</p>
            </CardContent>
            <CardFooter>
              <div className="flex flex-wrap gap-2">
                {note.tags.map(tag => <span key={tag} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full" onClick={() => setSearchTerm(tag)}>
                    #{tag}
                  </span>)}
              </div>
            </CardFooter>
          </Card>)}
      </div>

      {filteredNotes.length === 0 && <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhuma anotação encontrada.</p>
          {searchTerm && <Button variant="outline" className="mt-4" onClick={() => setSearchTerm("")}>
              Limpar busca
            </Button>}
        </div>}
    </div>;
};
export default Anotacoes;