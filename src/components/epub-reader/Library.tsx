
import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Upload } from 'lucide-react';

interface BookItem {
  title: string;
  author: string;
  cover?: string;
  url: string;
}

// Sample books
const sampleBooks: BookItem[] = [
  {
    title: "Dom Casmurro",
    author: "Machado de Assis",
    cover: "https://www.gutenberg.org/cache/epub/55752/pg55752.cover.medium.jpg",
    url: "https://www.gutenberg.org/ebooks/55752.epub.images"
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    cover: "https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg",
    url: "https://www.gutenberg.org/ebooks/1342.epub.images"
  },
  {
    title: "A Tale of Two Cities",
    author: "Charles Dickens",
    cover: "https://www.gutenberg.org/cache/epub/98/pg98.cover.medium.jpg",
    url: "https://www.gutenberg.org/ebooks/98.epub.images"
  }
];

interface LibraryProps {
  onSelectBook: (url: string) => void;
  onFileSelect: (file: File) => void;
}

export const Library = ({ onSelectBook, onFileSelect }: LibraryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/epub+zip') {
      onFileSelect(file);
    } else {
      alert('Por favor, selecione um arquivo .epub válido');
    }
  }, [onFileSelect]);
  
  const filteredBooks = sampleBooks.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="library-container space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Pesquisar livros..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        
        <label htmlFor="file-upload" className="cursor-pointer">
          <Button variant="outline" className="gap-2" asChild>
            <div>
              <Upload className="h-4 w-4" /> 
              Upload EPUB
            </div>
          </Button>
        </label>
        <input
          type="file"
          id="file-upload"
          accept=".epub"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBooks.map((book, index) => (
          <Card 
            key={index} 
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onSelectBook(book.url)}
          >
            <div className="aspect-[2/3] relative">
              {book.cover ? (
                <img 
                  src={book.cover} 
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-medium line-clamp-1">{book.title}</h3>
              <p className="text-sm text-muted-foreground">{book.author}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
