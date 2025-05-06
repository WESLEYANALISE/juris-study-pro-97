
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JuridicalBackground } from '@/components/ui/juridical-background';
import { Container } from '@/components/ui/container';
import { HTMLBookViewer } from '@/components/biblioteca-html/HTMLBookViewer';
import { Search, BookOpen, X } from 'lucide-react';
import { DocumentoHTML } from '@/types/biblioteca-html';
import { 
  getAllHTMLDocuments, 
  getHTMLDocumentCategories,
  getHTMLDocumentsByCategory,
  getRecentlyViewedDocuments,
  getFavoriteDocuments,
  searchHTMLDocuments
} from '@/utils/biblioteca-html-service';

export default function BibliotecaHTMLPage() {
  const [documentos, setDocumentos] = useState<DocumentoHTML[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [documentosRecentes, setDocumentosRecentes] = useState<DocumentoHTML[]>([]);
  const [documentosFavoritos, setDocumentosFavoritos] = useState<DocumentoHTML[]>([]);
  const [pesquisa, setPesquisa] = useState('');
  const [resultadosPesquisa, setResultadosPesquisa] = useState<DocumentoHTML[]>([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);
  const [documentoSelecionado, setDocumentoSelecionado] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const { user } = useAuth();

  // Carregar documentos e categorias
  useEffect(() => {
    async function carregarDados() {
      setCarregando(true);
      try {
        // Carregar categorias
        const categoriasData = await getHTMLDocumentCategories();
        setCategorias(categoriasData);

        // Se uma categoria está selecionada, carregar apenas documentos dessa categoria
        if (categoriaAtiva) {
          const docsData = await getHTMLDocumentsByCategory(categoriaAtiva);
          setDocumentos(docsData);
        } else {
          // Caso contrário, carregar todos os documentos
          const docsData = await getAllHTMLDocuments();
          setDocumentos(docsData);
        }

        // Carregar dados do usuário se estiver autenticado
        if (user) {
          const recentesData = await getRecentlyViewedDocuments(user.id);
          setDocumentosRecentes(recentesData);

          const favoritosData = await getFavoriteDocuments(user.id);
          setDocumentosFavoritos(favoritosData);
        }
      } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, [categoriaAtiva, user]);

  // Realizar pesquisa
  useEffect(() => {
    async function realizarPesquisa() {
      if (pesquisa.trim() === '') {
        setResultadosPesquisa([]);
        return;
      }

      setCarregando(true);
      try {
        const resultados = await searchHTMLDocuments(pesquisa);
        setResultadosPesquisa(resultados);
      } catch (erro) {
        console.error('Erro na pesquisa:', erro);
      } finally {
        setCarregando(false);
      }
    }

    const timerId = setTimeout(realizarPesquisa, 500);
    return () => clearTimeout(timerId);
  }, [pesquisa]);

  // Manipulador para selecionar documento
  const handleSelecionarDocumento = (documentoId: string) => {
    setDocumentoSelecionado(documentoId);
  };

  // Manipulador para fechar visualizador
  const handleFecharVisualizar = () => {
    setDocumentoSelecionado(null);
  };

  return (
    <JuridicalBackground variant="books" opacity={0.03}>
      <Container size="xl" className="py-6">
        <div className="space-y-8">
          {/* Cabeçalho */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold">Biblioteca HTML Jurídica</h1>
            <p className="text-muted-foreground">
              Explore nossa coleção de documentos jurídicos em formato HTML - melhor visualização e desempenho
            </p>
          </motion.div>

          {/* Barra de pesquisa */}
          <motion.div 
            className="relative w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <Search className="h-4 w-4" />
            </div>
            <Input 
              placeholder="Buscar documentos..." 
              className="pl-9 w-full"
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
            />
            {pesquisa && (
              <Button
                variant="ghost"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setPesquisa('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </motion.div>

          {/* Conteúdo Principal */}
          {pesquisa ? (
            // Resultados da pesquisa
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                Resultados da pesquisa para "{pesquisa}"
              </h2>
              
              {carregando ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Buscando documentos...</p>
                </div>
              ) : resultadosPesquisa.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground opacity-30" />
                  <h3 className="text-xl font-medium mt-4">Nenhum documento encontrado</h3>
                  <p className="text-muted-foreground mt-2">
                    Tente usar termos diferentes ou navegue pelas categorias.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {resultadosPesquisa.map(doc => (
                    <DocCard 
                      key={doc.id} 
                      documento={doc} 
                      onClick={() => handleSelecionarDocumento(doc.id)} 
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Tabs defaultValue="todos" className="space-y-6">
              <TabsList>
                <TabsTrigger value="todos" onClick={() => setCategoriaAtiva(null)}>
                  Todos os Documentos
                </TabsTrigger>
                {user && (
                  <>
                    <TabsTrigger value="recentes">Recentes</TabsTrigger>
                    <TabsTrigger value="favoritos">Favoritos</TabsTrigger>
                  </>
                )}
                <TabsTrigger value="categorias">Categorias</TabsTrigger>
              </TabsList>

              {/* Todos os Documentos */}
              <TabsContent value="todos" className="space-y-4">
                {carregando ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Carregando documentos...</p>
                  </div>
                ) : documentos.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 mx-auto text-muted-foreground opacity-30" />
                    <h3 className="text-xl font-medium mt-4">Nenhum documento disponível</h3>
                    <p className="text-muted-foreground mt-2">
                      Ainda não há documentos cadastrados na biblioteca.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {documentos.map(doc => (
                      <DocCard 
                        key={doc.id} 
                        documento={doc} 
                        onClick={() => handleSelecionarDocumento(doc.id)} 
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Recentes */}
              {user && (
                <TabsContent value="recentes" className="space-y-4">
                  {documentosRecentes.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-16 w-16 mx-auto text-muted-foreground opacity-30" />
                      <h3 className="text-xl font-medium mt-4">Nenhum documento recente</h3>
                      <p className="text-muted-foreground mt-2">
                        Você ainda não leu nenhum documento.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {documentosRecentes.map(doc => (
                        <DocCard 
                          key={doc.id} 
                          documento={doc} 
                          onClick={() => handleSelecionarDocumento(doc.id)} 
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              )}

              {/* Favoritos */}
              {user && (
                <TabsContent value="favoritos" className="space-y-4">
                  {documentosFavoritos.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-16 w-16 mx-auto text-muted-foreground opacity-30" />
                      <h3 className="text-xl font-medium mt-4">Nenhum favorito</h3>
                      <p className="text-muted-foreground mt-2">
                        Você ainda não adicionou documentos aos favoritos.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {documentosFavoritos.map(doc => (
                        <DocCard 
                          key={doc.id} 
                          documento={doc} 
                          onClick={() => handleSelecionarDocumento(doc.id)} 
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              )}

              {/* Categorias */}
              <TabsContent value="categorias" className="space-y-6">
                {categorias.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Carregando categorias...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categorias.map(categoria => (
                      <Card 
                        key={categoria} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setCategoriaAtiva(categoria)}
                      >
                        <CardContent className="p-6 flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-lg text-primary">
                            <BookOpen className="h-6 w-6" />
                          </div>
                          
                          <div>
                            <h3 className="font-medium text-lg">{categoria}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Ver documentos desta categoria
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {categoriaAtiva && (
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">{categoriaAtiva}</h2>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setCategoriaAtiva(null)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Voltar
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {documentos.map(doc => (
                        <DocCard 
                          key={doc.id} 
                          documento={doc} 
                          onClick={() => handleSelecionarDocumento(doc.id)} 
                        />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
        
        {/* Visualizador de HTML */}
        {documentoSelecionado && (
          <HTMLBookViewer
            documentoId={documentoSelecionado}
            onClose={handleFecharVisualizar}
          />
        )}
      </Container>
    </JuridicalBackground>
  );
}

// Componente de cartão para documentos
function DocCard({ documento, onClick }: { documento: DocumentoHTML, onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="overflow-hidden cursor-pointer h-full" onClick={onClick}>
        <div className="aspect-[3/2] bg-muted relative">
          {documento.thumbnail_url ? (
            <img 
              src={documento.thumbnail_url} 
              alt={documento.titulo} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BookOpen className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-1 line-clamp-2">{documento.titulo}</h3>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted-foreground">{documento.categoria}</span>
            {documento.autor && (
              <span className="text-xs font-medium">{documento.autor}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
