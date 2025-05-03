
import React from 'react';
import { Home, Library, Search, User } from 'lucide-react';

interface KindleMobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function KindleMobileNavigation({
  activeTab,
  onTabChange
}: KindleMobileNavigationProps) {
  return (
    <div className="mobile-bottom-controls md:hidden">
      <button 
        className={`flex flex-col items-center justify-center p-1 ${activeTab === 'all' ? 'text-amber-400' : 'text-gray-400'}`}
        onClick={() => onTabChange('all')}
      >
        <Home className="h-5 w-5" />
        <span className="text-xs mt-1">Início</span>
      </button>
      
      <button 
        className={`flex flex-col items-center justify-center p-1 ${activeTab === 'library' ? 'text-amber-400' : 'text-gray-400'}`}
        onClick={() => onTabChange('library')}
      >
        <Library className="h-5 w-5" />
        <span className="text-xs mt-1">Biblioteca</span>
      </button>
      
      <button 
        className={`flex flex-col items-center justify-center p-1 ${activeTab === 'search' ? 'text-amber-400' : 'text-gray-400'}`}
        onClick={() => onTabChange('search')}
      >
        <Search className="h-5 w-5" />
        <span className="text-xs mt-1">Pesquisar</span>
      </button>
      
      <button 
        className={`flex flex-col items-center justify-center p-1 ${activeTab === 'profile' ? 'text-amber-400' : 'text-gray-400'}`}
        onClick={() => onTabChange('profile')}
      >
        <User className="h-5 w-5" />
        <span className="text-xs mt-1">Perfil</span>
      </button>
    </div>
  );
}
