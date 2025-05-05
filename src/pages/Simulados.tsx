
import React from 'react';
import { JuridicalBackground } from '@/components/ui/juridical-background';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, BookOpen, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Simulados() {
  return (
    <JuridicalBackground variant="gradient">
      <Container className="py-12">
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl font-bold">Simulados Jurídicos</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Teste seus conhecimentos com simulados completos para concursos, OAB e exames da área jurídica.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {['OAB', 'Magistratura', 'Ministério Público', 'Defensoria', 'Delegado', 'Procuradoria'].map((category, index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-card border rounded-lg shadow-sm overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-bold">{category}</h3>
                  <p className="text-muted-foreground">
                    Simulados específicos para {category} com questões atualizadas e comentadas.
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground space-x-4">
                    <span className="flex items-center"><Clock className="mr-1 h-4 w-4" /> 4 horas</span>
                    <span className="flex items-center"><FileText className="mr-1 h-4 w-4" /> 80 questões</span>
                  </div>
                  <Button className="w-full">Iniciar Simulado</Button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 bg-primary/5 border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Recursos Disponíveis</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-2 mt-1" />
                <div>
                  <h3 className="font-medium">Questões Comentadas</h3>
                  <p className="text-sm text-muted-foreground">
                    Todas as questões incluem comentários detalhados.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-primary mr-2 mt-1" />
                <div>
                  <h3 className="font-medium">Cronômetro</h3>
                  <p className="text-sm text-muted-foreground">
                    Simule o tempo real de prova com nosso cronômetro.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <BookOpen className="h-5 w-5 text-primary mr-2 mt-1" />
                <div>
                  <h3 className="font-medium">Material de Apoio</h3>
                  <p className="text-sm text-muted-foreground">
                    Acesse o material de apoio para cada simulado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </JuridicalBackground>
  );
}
