
import React, { useState } from 'react';
import { Book } from 'epubjs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  BookText, 
  BookMarked, 
  Settings,
  Sun, 
  Moon,
  Search,
  Plus,
  Minus,
  Menu,
  List
} from 'lucide-react';

interface BookControlsProps {
  theme: 'light' | 'dark';
  fontSize: number;
  onThemeChange: (theme: 'light' | 'dark') => void;
  onFontSizeChange: (size: number) => void;
  progress: number;
  currentLocation?: any;
  book?: Book | null;
}

export const BookControls = ({ 
  theme,
  fontSize,
  onThemeChange,
  onFontSizeChange,
  progress,
  currentLocation,
  book
}: BookControlsProps) => {
  const [tocOpen, setTocOpen] = useState(false);

  const handleFontSizeChange = (value: number[]) => {
    onFontSizeChange(value[0]);
  };

  return (
    <div className="book-controls">
      <div className="progress-section">
        <Progress value={progress} className="h-1" />
      </div>

      <div className="controls-section">
        <div className="controls-buttons">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <List className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="space-y-2">
                <h3 className="font-medium">Índice</h3>
                <Separator />
                <div className="max-h-[200px] overflow-y-auto">
                  {book && book.navigation?.toc?.map((item: any, i: number) => (
                    <Button 
                      key={i}
                      variant="ghost" 
                      className="w-full justify-start text-left text-sm"
                      onClick={() => {
                        if (book && item.href) {
                          book.rendition.display(item.href);
                        }
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Modo Noturno</span>
                    <Switch 
                      checked={theme === 'dark'}
                      onCheckedChange={(checked) => onThemeChange(checked ? 'dark' : 'light')}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span>Tamanho da Fonte</span>
                  <div className="flex items-center space-x-2">
                    <Minus className="h-4 w-4" />
                    <Slider 
                      value={[fontSize]} 
                      onValueChange={handleFontSizeChange} 
                      min={80} 
                      max={160}
                      step={10} 
                      className="w-full"
                    />
                    <Plus className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="icon" className="h-8 w-8">
            <BookMarked className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
