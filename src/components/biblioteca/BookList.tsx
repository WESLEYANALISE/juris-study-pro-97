
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, BookOpenCheck, Heart } from "lucide-react";

interface Book {
  id: number;
  livro: string | null;
  area: string | null;
  sobre: string | null;
  imagem: string | null;
  download: string | null;
  link: string | null;
}

interface BookListProps {
  books: Book[];
  readBooks: { id: number }[];
  favoriteBooks: { id: number }[];
  onOpenBookDialog: (book: Book, readingMode?: boolean) => void;
}

const BookList: React.FC<BookListProps> = ({ books, readBooks, favoriteBooks, onOpenBookDialog }) => (
  <div className="rounded-md border ">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Livro</TableHead>
          <TableHead>Sobre</TableHead>
          <TableHead className="w-[100px] text-center">Status</TableHead>
          <TableHead className="w-[100px] text-center">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {books.map((book) => (
          <TableRow
            key={book.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onOpenBookDialog(book)}
          >
            <TableCell className="font-medium">{book.livro}</TableCell>
            <TableCell className="line-clamp-2 text-sm text-muted-foreground">
              {book.sobre || "Sem descrição"}
            </TableCell>
            <TableCell className="text-center">
              <div className="flex justify-center space-x-2">
                {readBooks.some((item) => item.id === book.id) && (
                  <div className="text-green-500" title="Lido">
                    <BookOpenCheck size={16} />
                  </div>
                )}
                {favoriteBooks.some((item) => item.id === book.id) && (
                  <div className="text-red-500" title="Favorito">
                    <Heart size={16} />
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex justify-center space-x-2">
                {book.link && (
                  <Button
                    size="sm"
                    variant="ghost"
                    title="Ler agora"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenBookDialog(book, true);
                    }}
                  >
                    <BookOpen size={16} />
                  </Button>
                )}
                {book.download && (
                  <Button size="sm" variant="ghost" asChild>
                    <a
                      href={book.download}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download size={16} />
                    </a>
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default BookList;
