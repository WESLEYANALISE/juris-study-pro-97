
import { EstudosHoje } from "@/components/biblioteca/EstudosHoje";
import { PageTransition } from "@/components/PageTransition";

export default function BibliotecaEstudosHojePage() {
  return (
    <PageTransition>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Estudos de Hoje</h1>
        <EstudosHoje />
      </div>
    </PageTransition>
  );
}
