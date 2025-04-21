
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Renderizar o app com tratamento de erro
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  createRoot(rootElement).render(<App />);
} catch (error) {
  console.error("Failed to render application:", error);
  // Mostrar um fallback de erro diretamente no DOM se tudo falhar
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif;">
        <h1 style="color: #d32f2f; margin-bottom: 1rem;">Erro ao iniciar a aplicação</h1>
        <p>Por favor, recarregue a página ou tente novamente mais tarde.</p>
      </div>
    `;
  }
}
