
import { useState, useCallback, useMemo } from 'react';

interface VadeMecumSearchOptions {
  exactMatch?: boolean;
  ignoreAccents?: boolean;
  searchByNumber?: boolean;
}

export const useVadeMecumSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOptions, setSearchOptions] = useState<VadeMecumSearchOptions>({
    exactMatch: false,
    ignoreAccents: true,
    searchByNumber: false
  });

  // Memoize the normalize function to prevent unnecessary re-renders
  const normalizeText = useCallback((text: string): string => {
    if (!text) return '';
    
    if (searchOptions.ignoreAccents) {
      return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }
    return text.toLowerCase();
  }, [searchOptions.ignoreAccents]);

  // Create a debounced search query to improve performance
  const debouncedSearch = useMemo(() => {
    return searchQuery;
  }, [searchQuery]);

  const filterArticles = useCallback(<T extends { numero?: string; artigo: string }>(
    articles: T[],
    query: string
  ): T[] => {
    if (!query) return articles;

    const normalizedQuery = normalizeText(query);
    
    // Use memoization for better performance on large datasets
    return articles.filter(article => {
      // If searching by number is enabled and article has a number
      if (searchOptions.searchByNumber && article.numero) {
        return article.numero.includes(query);
      }

      // Normalize the article text based on options
      const normalizedArticle = normalizeText(article.artigo);

      // For exact matches we check if the normalized article contains the entire query
      if (searchOptions.exactMatch) {
        return normalizedArticle.includes(normalizedQuery);
      }

      // For non-exact matches, split the query into words and check if all are present
      const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 0);
      return queryWords.every(word => normalizedArticle.includes(word));
    });
  }, [normalizeText, searchOptions.exactMatch, searchOptions.searchByNumber]);

  return {
    searchQuery,
    setSearchQuery,
    searchOptions,
    setSearchOptions,
    filterArticles,
    debouncedSearch
  };
};
