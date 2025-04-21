
import React from "react";
import { Button } from "@/components/ui/button";
import { Heart, BookOpenCheck } from "lucide-react";

interface BookCoverActionsProps {
  bookId: number;
  isFavorite: boolean;
  isRead: boolean;
  onFavorite: (id: number) => void;
  onRead: (id: number) => void;
}

const BookCoverActions: React.FC<BookCoverActionsProps> = ({
  bookId,
  isFavorite,
  isRead,
  onFavorite,
  onRead,
}) => (
  <div className="flex gap-2">
    <Button
      variant="outline"
      size="icon"
      onClick={e => {
        e.stopPropagation();
        onFavorite(bookId);
      }}
      className={
        isFavorite
          ? "bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600 dark:bg-red-900/30 dark:text-red-400"
          : ""
      }
      aria-label="Favoritar"
    >
      <Heart className="h-4 w-4" />
    </Button>
    <Button
      variant="outline"
      size="icon"
      onClick={e => {
        e.stopPropagation();
        onRead(bookId);
      }}
      className={
        isRead
          ? "bg-green-100 text-green-500 hover:bg-green-200 hover:text-green-600 dark:bg-green-900/30 dark:text-green-400"
          : ""
      }
      aria-label="Marcar como lido"
    >
      <BookOpenCheck className="h-4 w-4" />
    </Button>
  </div>
);

export default BookCoverActions;
