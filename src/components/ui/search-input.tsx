
import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, suggestions = [], onSuggestionClick, value, onChange, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const mergedRef = useMergedRef(ref, inputRef);
    
    // Handle clear button click
    const handleClear = () => {
      if (inputRef.current) {
        inputRef.current.value = "";
        inputRef.current.focus();
      }
      if (onClear) {
        onClear();
      }
      // Trigger the onChange event with an empty value
      if (onChange) {
        const event = {
          target: { value: "" }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
    };

    return (
      <div className="relative w-full">
        <div className="relative">
          <motion.div 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            animate={{ 
              rotate: isFocused && value ? 90 : 0,
              opacity: 1 
            }}
            transition={{ duration: 0.2 }}
          >
            <Search className="h-4 w-4" />
          </motion.div>

          <Input
            ref={mergedRef}
            className={cn(
              "pl-10 pr-10 transition-all duration-300 focus-within:shadow-[0_0_0_2px_rgba(155,135,245,0.3)]",
              isFocused ? "border-primary" : "",
              className
            )}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          <AnimatePresence>
            {value && (
              <motion.button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                onClick={handleClear}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                type="button"
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {isFocused && value && suggestions.length > 0 && (
            <motion.div
              className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <ul className="py-1 px-2 max-h-60 overflow-auto">
                {suggestions.map((suggestion, index) => (
                  <motion.li
                    key={index}
                    className="px-2 py-1.5 text-sm rounded-md cursor-pointer hover:bg-accent"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    onClick={() => {
                      if (onSuggestionClick) {
                        onSuggestionClick(suggestion);
                      }
                    }}
                  >
                    {suggestion}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

// Helper function to merge refs
function useMergedRef<T>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
  return React.useCallback((value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T>).current = value;
      }
    });
  }, [refs]);
}
