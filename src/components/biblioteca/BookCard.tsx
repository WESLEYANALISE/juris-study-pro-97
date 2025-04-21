
import { motion } from "framer-motion";
import { BookOpenCheck, Heart } from "lucide-react";

interface Book {
  id: number;
  livro: string | null;
  area: string | null;
  sobre: string | null;
  imagem: string | null;
  download: string | null;
  link: string | null;
}

interface BookCardProps {
  book: Book;
  isRead: boolean;
  isFavorite: boolean;
  onClick: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, isRead, isFavorite, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
    className="relative cursor-pointer"
    onClick={() => onClick(book)}
  >
    <div className="relative w-[150px] h-[220px] rounded-md overflow-hidden shadow-lg group">
      <div
        className="w-full h-full flex items-end justify-center text-center p-2 backdrop-blur-md"
        style={{
          backgroundImage: book.imagem ? `url(${book.imagem})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <span className="text-xs font-semibold w-full bg-black/60 text-white py-1 px-2 rounded-b">
          {book.livro || "Livro sem título"}
        </span>
      </div>
      <div className="absolute top-1 right-1 flex flex-col gap-1">
        {isRead && (
          <div className="bg-green-500 rounded-full p-1 shadow-md">
            <BookOpenCheck size={14} className="text-white" />
          </div>
        )}
        {isFavorite && (
          <div className="bg-red-500 rounded-full p-1 shadow-md">
            <Heart size={14} className="text-white" />
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

export default BookCard;
