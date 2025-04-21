
import React from "react";
import BookCard from "@/components/biblioteca/BookCard";

interface Book {
  id: number;
  livro: string | null;
  area: string | null;
  sobre: string | null;
  imagem: string | null;
  download: string | null;
  link: string | null;
}

interface ReadBooksGridProps {
  readBooks: Book[];
  allRead: { id: number }[];
  favoriteBooks: { id: number }[];
  openBookDialog: (book: Book) => void;
}

const ReadBooksGrid: React.FC<ReadBooksGridProps> = ({
  readBooks,
  allRead,
  favoriteBooks,
  openBookDialog,
}) => {
  if (!readBooks.length)
    return (
      <p className="text-center py-12 text-muted-foreground">
        Você ainda não marcou nenhum livro como lido.
      </p>
    );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-2">
      {readBooks.map((book) => (
        <div key={book.id} className="flex justify-center">
          <BookCard
            book={book}
            isRead={!!allRead.find((x) => x.id === book.id)}
            isFavorite={!!favoriteBooks.find((x) => x.id === book.id)}
            onClick={openBookDialog}
          />
        </div>
      ))}
    </div>
  );
};

export default ReadBooksGrid;
