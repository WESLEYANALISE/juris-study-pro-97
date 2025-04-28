
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Página não encontrada</p>
        <p className="text-md text-gray-500 mb-6">
          A página "{location.pathname}" não está disponível ou está em desenvolvimento.
        </p>
        <Link 
          to="/" 
          className="inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          Voltar para a Página Inicial
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
