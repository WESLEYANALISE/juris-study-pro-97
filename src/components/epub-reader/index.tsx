
import React, { useState } from 'react';
import { EpubViewer } from './EpubViewer';
import { BookControls } from './BookControls';
import { Library } from './Library';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import './styles.css';

interface EpubReaderProps {
  defaultUrl?: string;
}

export const EpubReader = ({ defaultUrl }: EpubReaderProps) => {
  const [bookUrl, setBookUrl] = useState<string | undefined>(defaultUrl);
  const [file, setFile] = useState<File | null>(null);
  
  return (
    <div className="epub-reader-container">
      <Tabs defaultValue="reader" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="reader">Leitor</TabsTrigger>
          <TabsTrigger value="library">Biblioteca</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reader" className="space-y-4">
          {(bookUrl || file) ? (
            <Card className="p-0 overflow-hidden">
              <EpubViewer 
                url={bookUrl} 
                file={file} 
              />
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <p>Selecione um livro da biblioteca ou faça upload de um arquivo .epub</p>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="library">
          <Library onSelectBook={(url) => {
            setBookUrl(url);
            setFile(null);
          }} 
          onFileSelect={(selectedFile) => {
            setFile(selectedFile);
            setBookUrl(undefined);
          }} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EpubReader;
