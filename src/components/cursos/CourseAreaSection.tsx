
import React from 'react';
import { motion } from 'framer-motion';
import { CourseCard } from './CourseCard';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { Curso } from '@/types/curso';
import { useNavigate } from 'react-router-dom';

interface CourseAreaSectionProps {
  area: string;
  courses: Curso[];
  compact?: boolean;
}

export const CourseAreaSection = ({ area, courses, compact = false }: CourseAreaSectionProps) => {
  const navigate = useNavigate();
  
  if (!courses || courses.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{area}</h2>
        {!compact && courses.length > 4 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => navigate('/cursos', { state: { selectedCategory: area } })}
          >
            Ver todos
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {compact ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {courses.slice(0, 4).map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </div>
      ) : (
        <ScrollArea className="pb-4">
          <div className="flex space-x-4">
            {courses.map((course, index) => (
              <div key={course.id} className="min-w-[280px] max-w-[280px]">
                <CourseCard course={course} index={index} />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  );
};
