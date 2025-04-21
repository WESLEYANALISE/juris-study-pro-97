
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

interface FavoriteBooksGridProps {
  favoriteBooks: Book[];
  allRead: { id: number }[];
  favoriteBookIds: { id: number }[];
  openBookDialog: (book: Book) => void;
}

const FavoriteBooksGrid: React.FC<FavoriteBooksGridProps> = ({
  favoriteBooks,
  allRead,
  favoriteBookIds,
  openBookDialog,
}) => {
  if (!favoriteBooks.length)
    return (
      <p className="text-center py-12 text-muted-foreground">
        Você ainda não adicionou nenhum livro aos favoritos.
      </p>
    );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-2">
      {favoriteBooks.map((book) => (
        <div key={book.id} className="flex justify-center">
          <BookCard
            book={book}
            isRead={!!allRead.find((x) => x.id === book.id)}
            isFavorite={!!favoriteBookIds.find((x) => x.id === book.id)}
            onClick={openBookDialog}
          />
        </div>
      ))}
    </div>
  );
};

export default FavoriteBooksGrid;
