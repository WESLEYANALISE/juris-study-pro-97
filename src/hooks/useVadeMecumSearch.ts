
import { useState } from 'react';

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

  const normalizeText = (text: string) => {
    if (searchOptions.ignoreAccents) {
      return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }
    return text.toLowerCase();
  };

  const filterArticles = <T extends { numero?: string; artigo: string }>(
    articles: T[],
    query: string
  ): T[] => {
    if (!query) return articles;

    const normalizedQuery = normalizeText(query);

    return articles.filter(article => {
      if (searchOptions.searchByNumber && article.numero) {
        return article.numero.includes(query);
      }

      const normalizedArticle = normalizeText(article.artigo);

      if (searchOptions.exactMatch) {
        return normalizedArticle.includes(normalizedQuery);
      }

      const queryWords = normalizedQuery.split(/\s+/);
      return queryWords.every(word => normalizedArticle.includes(word));
    });
  };

  return {
    searchQuery,
    setSearchQuery,
    searchOptions,
    setSearchOptions,
    filterArticles
  };
};
