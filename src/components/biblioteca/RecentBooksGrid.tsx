
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

interface RecentBooksGridProps {
  recentBooks: Book[];
  readBooks: { id: number }[];
  favoriteBooks: { id: number }[];
  openBookDialog: (book: Book) => void;
}

const RecentBooksGrid: React.FC<RecentBooksGridProps> = ({
  recentBooks,
  readBooks,
  favoriteBooks,
  openBookDialog,
}) => {
  if (!recentBooks.length)
    return (
      <p className="text-center py-10 text-muted-foreground">
        Você ainda não acessou nenhum livro recentemente.
      </p>
    );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-2">
      {recentBooks.map((book) => (
        <div key={book.id} className="flex justify-center">
          <BookCard
            book={book}
            isRead={!!readBooks.find((x) => x.id === book.id)}
            isFavorite={!!favoriteBooks.find((x) => x.id === book.id)}
            onClick={openBookDialog}
          />
        </div>
      ))}
    </div>
  );
};

export default RecentBooksGrid;
