
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  type?: "fade" | "slide" | "scale" | "none";
}

export const PageTransition = ({ children, type = "fade" }: PageTransitionProps) => {
  const getTransitionProps = () => {
    switch (type) {
      case "fade":
        return {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -10 },
          transition: { duration: 0.3, ease: "easeInOut" }
        };
      case "slide":
        return {
          initial: { opacity: 0, x: 100 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -100 },
          transition: { duration: 0.4 }
        };
      case "scale":
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 },
          transition: { duration: 0.3 }
        };
      case "none":
      default:
        return {
          initial: {},
          animate: {},
          exit: {},
        };
    }
  };

  return (
    <motion.div
      {...getTransitionProps()}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
};
