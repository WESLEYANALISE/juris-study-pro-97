
import React from "react";
import { Button } from "@/components/ui/button";
import { ListFilter } from "lucide-react";
import BookCard from "@/components/biblioteca/BookCard";
import BookList from "@/components/biblioteca/BookList";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

interface Book {
  id: number;
  livro: string | null;
  area: string | null;
  sobre: string | null;
  imagem: string | null;
  download: string | null;
  link: string | null;
}

interface BooksByAreaSectionProps {
  areas: string[];
  booksByArea: Record<string, Book[]>;
  booksPerArea: Record<string, number>;
  viewMode: Record<string, "grid" | "list">;
  readBooks: { id: number }[];
  favoriteBooks: { id: number }[];
  toggleViewMode: (area: string) => void;
  openBookDialog: (book: Book) => void;
  isLoading: boolean;
}

const BooksByAreaSection: React.FC<BooksByAreaSectionProps> = ({
  areas,
  booksByArea,
  booksPerArea,
  viewMode,
  readBooks,
  favoriteBooks,
  toggleViewMode,
  openBookDialog,
  isLoading,
}) => {
  if (isLoading)
    return (
      <div className="flex justify-center p-12">
        <p>Carregando biblioteca...</p>
      </div>
    );

  if (!areas.length)
    return (
      <p className="text-center py-12 text-muted-foreground">
        Nenhuma área encontrada na biblioteca.
      </p>
    );

  return (
    <div className="space-y-10">
      {areas.map(
        (area) =>
          area &&
          booksByArea[area]?.length > 0 && (
            <div key={area} className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <h2 className="text-base md:text-xl font-semibold">{area}</h2>
                  <span className="ml-2 text-xs md:text-sm text-muted-foreground">
                    ({booksPerArea[area] || 0} livros)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleViewMode(area)}
                  className="flex items-center gap-1"
                >
                  <ListFilter className="h-4 w-4 mr-1" />
                  Ver em {viewMode[area] === "grid" ? "lista" : "grade"}
                </Button>
              </div>
              {viewMode[area] === "grid" ? (
                <Carousel className="w-full">
                  <CarouselContent>
                    {booksByArea[area].map((book) => (
                      <CarouselItem
                        key={book.id}
                        className="md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-2 pr-0"
                      >
                        <BookCard
                          book={book}
                          isRead={!!readBooks.find((x) => x.id === book.id)}
                          isFavorite={!!favoriteBooks.find((x) => x.id === book.id)}
                          onClick={openBookDialog}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              ) : (
                <BookList
                  books={booksByArea[area]}
                  readBooks={readBooks}
                  favoriteBooks={favoriteBooks}
                  onOpenBookDialog={openBookDialog}
                />
              )}
            </div>
          )
      )}
    </div>
  );
};

export default BooksByAreaSection;
