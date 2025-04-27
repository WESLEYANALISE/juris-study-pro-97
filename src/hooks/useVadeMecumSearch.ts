
import { useState, useMemo } from 'react';

export const useVadeMecumSearch = <T extends { nome?: string }>(
  items: T[], 
  searchKey: keyof T = 'nome' as keyof T
) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    
    return items.filter(item => {
      const value = item[searchKey];
      return value && 
        String(value).toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [items, searchQuery, searchKey]);

  return { 
    searchQuery, 
    setSearchQuery, 
    filteredItems 
  };
};
