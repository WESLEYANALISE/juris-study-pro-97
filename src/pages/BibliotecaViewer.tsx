
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PDFViewer } from "@/components/biblioteca/PDFViewer";
import { supabase } from "@/lib/supabaseClient";

interface Livro {
  id: string;
  nome: string;
  pdf: string;
}

export default function BibliotecaViewer() {
  const { id } = useParams<{ id: string }>();
  const [livro, setLivro] = useState<Livro | null>(null);

  useEffect(() => {
    fetchLivro();
  }, [id]);

  const fetchLivro = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('livrospro')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching book:', error);
      return;
    }

    setLivro(data);
  };

  if (!livro) {
    return <div>Carregando...</div>;
  }

  return <PDFViewer url={livro.pdf} livroId={livro.id} />;
}
