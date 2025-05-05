
import React, { useEffect, useState } from 'react';
import { JuridicalBackground } from '@/components/ui/juridical-background';
import { Container } from '@/components/ui/container';
import { useVadeMecumFavorites } from '@/hooks/useVadeMecumFavorites';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookmarkIcon, BookOpen, Clock, SearchIcon, TrashIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

export default function VadeMecumFavorites() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favorites, loadFavorites, removeFavorite, isLoading, loadHistory } = useVadeMecumFavorites();
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [historyLoading, setHistoryLoading] = useState(true);
  
  // Load favorites and history when user changes
  useEffect(() => {
    if (user) {
      loadFavorites();
      setHistoryLoading(true);
      loadHistory().then(history => {
        setRecentHistory(history || []);
        setHistoryLoading(false);
      });
    } else {
      navigate('/login');
    }
  }, [user, loadFavorites, loadHistory, navigate]);
  
  // Filter favorites by search term
  const filteredFavorites = favorites.filter(fav => 
    fav.law_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fav.article_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fav.article_text.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter history by search term
  const filteredHistory = recentHistory.filter(item => 
    item.law_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.article_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.article_text.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle remove favorite
  const handleRemoveFavorite = async (articleNumber: string, lawName: string) => {
    await removeFavorite(articleNumber, lawName);
  };
  
  // Group items by law name
  const groupByLaw = (items: any[]) => {
    return items.reduce((acc, item) => {
      const lawName = item.law_name.replace(/_/g, ' ');
      if (!acc[lawName]) {
        acc[lawName] = [];
      }
      acc[lawName].push(item);
      return acc;
    }, {});
  };
  
  const groupedFavorites = groupByLaw(filteredFavorites);
  const groupedHistory = groupByLaw(filteredHistory);
  
  // Loading state
  if (isLoading) {
    return (
      <JuridicalBackground variant="books" opacity={0.03}>
        <Container className="py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner className="h-10 w-10" />
          </div>
        </Container>
      </JuridicalBackground>
    );
  }
  
  return (
    <JuridicalBackground variant="books" opacity={0.03}>
      <Container className="py-8">
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Vade Mecum Pessoal</h1>
              <p className="text-muted-foreground">Gerencie seus artigos favoritos e histórico de visualizações</p>
            </div>
            
            <div className="relative w-full md:w-auto">
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar artigos..."
                className="pl-9 w-full md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs defaultValue="favorites" className="w-full">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="favorites" className="flex-1 md:flex-none">
                <BookmarkIcon className="h-4 w-4 mr-2" />
                Favoritos
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1 md:flex-none">
                <Clock className="h-4 w-4 mr-2" />
                Histórico
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="favorites" className="mt-6">
              {filteredFavorites.length === 0 ? (
                <div className="text-center py-8 bg-muted/30 rounded-lg border">
                  <BookmarkIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum favorito encontrado</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-4">
                    {searchTerm ? "Nenhum artigo corresponde à sua busca." : "Você ainda não adicionou nenhum artigo aos favoritos."}
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/vademecum">Explorar Vade Mecum</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupedFavorites).map(([lawName, items]: [string, any]) => (
                    <div key={lawName} className="space-y-4">
                      <h2 className="text-xl font-semibold border-b pb-2">{lawName}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {items.map((item: any) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-start justify-between">
                                  <span>Artigo {item.article_number}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleRemoveFavorite(item.article_number, item.law_name)}
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </CardTitle>
                                <CardDescription>{lawName}</CardDescription>
                              </CardHeader>
                              <CardContent className="pb-2">
                                <p className="line-clamp-4 text-sm text-muted-foreground">
                                  {item.article_text}
                                </p>
                              </CardContent>
                              <CardFooter className="pt-0">
                                <Button asChild variant="outline" size="sm" className="w-full">
                                  <Link to={`/vademecum/${item.law_name}`}>
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Abrir
                                  </Link>
                                </Button>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history" className="mt-6">
              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner className="h-8 w-8" />
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="text-center py-8 bg-muted/30 rounded-lg border">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Histórico vazio</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-4">
                    {searchTerm ? "Nenhum artigo corresponde à sua busca." : "Você ainda não visualizou nenhum artigo."}
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/vademecum">Explorar Vade Mecum</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupedHistory).map(([lawName, items]: [string, any]) => (
                    <div key={lawName} className="space-y-4">
                      <h2 className="text-xl font-semibold border-b pb-2">{lawName}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {items.map((item: any) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Artigo {item.article_number}</CardTitle>
                                <CardDescription className="flex justify-between">
                                  <span>{lawName}</span>
                                  <span className="text-xs opacity-70">
                                    {new Date(item.viewed_at).toLocaleString('pt-BR', { 
                                      day: '2-digit', 
                                      month: '2-digit', 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="pb-2">
                                <p className="line-clamp-4 text-sm text-muted-foreground">
                                  {item.article_text}
                                </p>
                              </CardContent>
                              <CardFooter className="pt-0">
                                <Button asChild variant="outline" size="sm" className="w-full">
                                  <Link to={`/vademecum/${item.law_name}`}>
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Abrir
                                  </Link>
                                </Button>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </Container>
    </JuridicalBackground>
  );
}
