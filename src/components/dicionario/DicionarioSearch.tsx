
import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from '@/lib/utils';

interface SearchProps {
  onSearch: (term: string) => void;
  className?: string;
}

interface Suggestion {
  id: string;
  termo: string;
}

export const DicionarioSearch: React.FC<SearchProps> = ({ onSearch, className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions as user types
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Debounce search
    timerRef.current = setTimeout(async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('dicionario_juridico')
        .select('id, termo')
        .ilike('termo', `%${searchTerm}%`)
        .order('termo')
        .limit(5);

      if (data) {
        setSuggestions(data);
      }
      setIsLoading(false);
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchTerm]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setSearchTerm(suggestion.termo);
    onSearch(suggestion.termo);
    setSuggestions([]);
    setIsFocused(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
    setIsFocused(false);
  };

  // Highlight matched text in suggestions
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? <span key={i} className="bg-primary/20 font-medium">{part}</span> : part
    );
  };

  return (
    <div className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative flex items-center">
          <Input 
            ref={inputRef}
            placeholder="Pesquisar termo jurídico..."
            value={searchTerm}
            onChange={handleInputChange}
            className="pr-10 pl-4 h-12 text-base border-2 hover:border-primary/70 focus:border-primary transition-all"
            onFocus={() => setIsFocused(true)}
          />
          <Button 
            type="submit"
            variant="ghost" 
            size="icon" 
            className="absolute right-2"
          >
            <Search className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </form>

      {isFocused && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute w-full mt-1 bg-popover border rounded-md shadow-md z-10 animate-fade-in"
        >
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="px-4 py-2 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {highlightMatch(suggestion.termo, searchTerm)}
            </div>
          ))}
        </div>
      )}

      {isLoading && searchTerm.length >= 2 && (
        <div className="absolute right-2 top-3">
          <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      )}
    </div>
  );
};
