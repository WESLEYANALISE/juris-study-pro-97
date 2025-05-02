
import React from 'react';
import { Container } from '@/components/ui/container';
import EpubReader from '@/components/epub-reader';

export const EpubReaderPage = () => {
  return (
    <Container>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Leitor de E-books</h1>
        <p className="text-muted-foreground">
          Leia e gerencie seus e-books no formato EPUB com uma experiência de leitura semelhante ao Kindle.
        </p>
        <EpubReader />
      </div>
    </Container>
  );
};

export default EpubReaderPage;
