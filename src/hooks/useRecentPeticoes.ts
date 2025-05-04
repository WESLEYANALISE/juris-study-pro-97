
import { useCallback, useEffect, useState } from 'react';

interface RecentPeticao {
  id: string;
  title: string;
  area: string;
  url: string;
  viewedAt: number;
}

const STORAGE_KEY = 'recent-peticoes';
const MAX_RECENT_ITEMS = 5;

export function useRecentPeticoes() {
  const [recentItems, setRecentItems] = useState<RecentPeticao[]>([]);

  // Load recent items from localStorage on mount
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(STORAGE_KEY);
      if (savedItems) {
        setRecentItems(JSON.parse(savedItems));
      }
    } catch (err) {
      console.error('Failed to load recent petições from localStorage:', err);
    }
  }, []);

  // Save items to localStorage whenever they change
  useEffect(() => {
    if (recentItems.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recentItems));
      } catch (err) {
        console.error('Failed to save recent petições to localStorage:', err);
      }
    }
  }, [recentItems]);

  // Add a new item to recent list
  const addRecentItem = useCallback((item: Omit<RecentPeticao, 'viewedAt'>) => {
    setRecentItems(prev => {
      // Remove existing item with same ID if present
      const filteredItems = prev.filter(existingItem => existingItem.id !== item.id);
      
      // Add new item at the beginning
      const newItem = { ...item, viewedAt: Date.now() };
      const newItems = [newItem, ...filteredItems].slice(0, MAX_RECENT_ITEMS);
      
      return newItems;
    });
  }, []);

  // Clear all recent items
  const clearRecentItems = useCallback(() => {
    setRecentItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    recentItems,
    addRecentItem,
    clearRecentItems
  };
}
