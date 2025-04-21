
import { Button } from "@/components/ui/button";
import { AnimatedTabs, AnimatedTabsList, AnimatedTabsTrigger, AnimatedTabsContent } from "@/components/ui/animated-tabs";
import BooksByAreaSection from "@/components/biblioteca/BooksByAreaSection";
import RecentBooksGrid from "@/components/biblioteca/RecentBooksGrid";
import ReadBooksGrid from "@/components/biblioteca/ReadBooksGrid";
import FavoriteBooksGrid from "@/components/biblioteca/FavoriteBooksGrid";
import { BookOpen } from "lucide-react";

interface BibliotecaTabsProps {
  areas: string[];
  booksByArea: Record<string, any[]>;
  booksPerArea: Record<string, number>;
  viewMode: Record<string, "grid" | "list">;
  readBooks: any[];
  favoriteBooks: any[];
  toggleViewMode: (area: string) => void;
  openBookDialog: (book: any) => void;
  isLoading: boolean;
  recentBooks: any[];
  allRead: any[];
  favoriteBookIds: any[];
  readBooksData: any[];
  favoriteBooksData: any[];
  openAnnotationsDialog: () => void;
}

const BibliotecaTabs: React.FC<BibliotecaTabsProps> = ({
  areas,
  booksByArea,
  booksPerArea,
  viewMode,
  readBooks,
  favoriteBooks,
  toggleViewMode,
  openBookDialog,
  isLoading,
  recentBooks,
  allRead,
  favoriteBookIds,
  readBooksData,
  favoriteBooksData,
  openAnnotationsDialog
}) => {
  return (
    <AnimatedTabs defaultValue="areas" className="w-full">
      <AnimatedTabsList className="w-full justify-start mb-4">
        <AnimatedTabsTrigger value="areas">
          <BookOpen className="h-4 w-4 mr-1" />
          Por Área
        </AnimatedTabsTrigger>
        <AnimatedTabsTrigger value="recentes">Recentes</AnimatedTabsTrigger>
        <AnimatedTabsTrigger value="lidos">Lidos</AnimatedTabsTrigger>
        <AnimatedTabsTrigger value="favoritos">Favoritos</AnimatedTabsTrigger>
      </AnimatedTabsList>
      <AnimatedTabsContent value="areas" slideDirection="right">
        <BooksByAreaSection
          areas={areas}
          booksByArea={booksByArea}
          booksPerArea={booksPerArea}
          viewMode={viewMode}
          readBooks={readBooks}
          favoriteBooks={favoriteBooks}
          toggleViewMode={toggleViewMode}
          openBookDialog={openBookDialog}
          isLoading={isLoading}
        />
      </AnimatedTabsContent>
      <AnimatedTabsContent value="recentes" slideDirection="right">
        <RecentBooksGrid
          recentBooks={recentBooks}
          readBooks={readBooks}
          favoriteBooks={favoriteBooks}
          openBookDialog={openBookDialog}
        />
      </AnimatedTabsContent>
      <AnimatedTabsContent value="lidos" slideDirection="right">
        <ReadBooksGrid
          readBooks={readBooksData}
          allRead={allRead}
          favoriteBooks={favoriteBooks}
          openBookDialog={openBookDialog}
        />
      </AnimatedTabsContent>
      <AnimatedTabsContent value="favoritos" slideDirection="right">
        <FavoriteBooksGrid
          favoriteBooks={favoriteBooksData}
          allRead={allRead}
          favoriteBookIds={favoriteBookIds}
          openBookDialog={openBookDialog}
        />
      </AnimatedTabsContent>
    </AnimatedTabs>
  );
};

export default BibliotecaTabs;
