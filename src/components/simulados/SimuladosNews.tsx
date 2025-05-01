
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SimuladoCategoria } from "@/types/simulados";
import { Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SimuladosNewsProps {
  categoria: SimuladoCategoria;
}

interface News {
  id: string;
  title: string;
  date: string;
  summary: string;
  url: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
}

export const SimuladosNews = ({ categoria }: SimuladosNewsProps) => {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<News[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Simulate API call to fetch news and events
    setTimeout(() => {
      // Customize news and events based on category
      switch(categoria) {
        case 'OAB':
          setNews([
            {
              id: '1',
              title: 'OAB divulga calendário para o próximo exame',
              date: '15/04/2025',
              summary: 'O Conselho Federal da OAB divulgou as datas do próximo Exame de Ordem.',
              url: '#'
            },
            {
              id: '2',
              title: 'Mudanças no edital do Exame da OAB',
              date: '10/04/2025',
              summary: 'Confira as principais alterações para o próximo exame.',
              url: '#'
            }
          ]);
          setEvents([
            {
              id: '1',
              title: 'XXXIX Exame de Ordem',
              date: '20/07/2025',
              location: 'Nacional'
            },
            {
              id: '2',
              title: 'Curso Preparatório Intensivo',
              date: '01/06/2025',
              location: 'Online'
            }
          ]);
          break;
          
        case 'PRF':
          setNews([
            {
              id: '1',
              title: 'Autorizado novo concurso para a PRF',
              date: '12/04/2025',
              summary: 'Governo autoriza abertura de 1.500 vagas para a Polícia Rodoviária Federal.',
              url: '#'
            }
          ]);
          setEvents([
            {
              id: '1',
              title: 'Prova do Concurso PRF',
              date: '15/08/2025',
              location: 'Nacional'
            }
          ]);
          break;
          
        default:
          setNews([
            {
              id: '1',
              title: 'Atualizações na legislação afetam próximos concursos',
              date: '10/04/2025',
              summary: 'Mudanças importantes na legislação devem ser observadas pelos candidatos.',
              url: '#'
            }
          ]);
          setEvents([
            {
              id: '1',
              title: 'Webinar sobre carreiras jurídicas',
              date: '25/05/2025',
              location: 'Online'
            }
          ]);
      }
      
      setLoading(false);
    }, 1500);
  }, [categoria]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Últimas Notícias</CardTitle>
          <CardDescription>
            Mantenha-se informado sobre {categoria}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-md" />
              <Skeleton className="h-24 w-full rounded-md" />
            </div>
          ) : (
            <div className="space-y-4">
              {news.length > 0 ? (
                news.map((item) => (
                  <Card key={item.id} className="bg-card/60 overflow-hidden">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">{item.date}</p>
                      <h4 className="font-medium mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{item.summary}</p>
                      <Button size="sm" variant="ghost" className="text-primary flex items-center gap-1">
                        <span>Leia mais</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground p-4">
                  Nenhuma notícia disponível no momento.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Calendário</CardTitle>
          <CardDescription>
            Próximos eventos e datas importantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full rounded-md" />
              <Skeleton className="h-16 w-full rounded-md" />
            </div>
          ) : (
            <div className="space-y-4">
              {events.length > 0 ? (
                events.map((event) => (
                  <div key={event.id} className="flex gap-4 p-3 border rounded-md">
                    <div className="flex flex-col items-center justify-center bg-primary/10 p-2 rounded-md min-w-[60px]">
                      <span className="text-xs text-primary">
                        {new Date(event.date).toLocaleString('default', { month: 'short' }).toUpperCase()}
                      </span>
                      <span className="text-xl font-bold text-primary">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{event.location}</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground p-4">
                  Nenhum evento programado.
                </p>
              )}
              
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">Ver Calendário Completo</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
