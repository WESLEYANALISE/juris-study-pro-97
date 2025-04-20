
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

const Biblioteca = () => {
  // Example data for biblioteca
  const recursos = [
    { id: 1, titulo: "Constituição Federal Comentada", tipo: "Livro Digital", autor: "Alexandre de Moraes", acesso: "12/04/2025" },
    { id: 2, titulo: "Código Civil Anotado", tipo: "Documento", autor: "Maria Helena Diniz", acesso: "10/04/2025" },
    { id: 3, titulo: "Direito Penal Esquematizado", tipo: "Material de Estudo", autor: "Cleber Masson", acesso: "05/04/2025" },
    { id: 4, titulo: "Manual de Direito Administrativo", tipo: "Livro Digital", autor: "José dos Santos Carvalho Filho", acesso: "01/04/2025" },
  ];

  return (
    <div className="container mx-auto">
      <div className="flex items-center mb-6">
        <BookOpen className="h-8 w-8 mr-2 text-primary" />
        <h1 className="text-2xl font-bold">Biblioteca Jurídica</h1>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recursos Disponíveis</CardTitle>
          <CardDescription>
            Acesse materiais de estudo, livros digitais e documentos jurídicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Lista de recursos jurídicos disponíveis</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead className="text-right">Último Acesso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recursos.map((recurso) => (
                <TableRow key={recurso.id}>
                  <TableCell className="font-medium">{recurso.titulo}</TableCell>
                  <TableCell>{recurso.tipo}</TableCell>
                  <TableCell>{recurso.autor}</TableCell>
                  <TableCell className="text-right">{recurso.acesso}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Biblioteca;
