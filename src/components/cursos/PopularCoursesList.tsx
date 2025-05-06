
import React from 'react';
import { BookOpen, Clock, Users } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Curso } from '@/types/curso';

interface PopularCoursesListProps {
  courses: Curso[];
  loading?: boolean;
  title?: string;
}

export const PopularCoursesList = ({ courses, loading = false, title = "Cursos Populares" }: PopularCoursesListProps) => {
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-muted/20 animate-pulse">
            <div className="h-20"></div>
          </Card>
        ))}
      </div>
    );
  }
  
  if (!courses || courses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      {courses.slice(0, 5).map((course) => (
        <Card 
          key={course.id} 
          className="hover:bg-muted/50 cursor-pointer transition-colors"
          onClick={() => navigate(`/curso/${course.id}`)}
        >
          <CardHeader className="p-3 pb-0">
            <h4 className="text-sm font-medium line-clamp-1">
              {course.materia || course.titulo}
            </h4>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="flex justify-between items-center">
              <Badge variant="outline" className="text-xs">
                {course.area || "Direito"}
              </Badge>
              
              {course.dificuldade && (
                <span className="text-xs text-muted-foreground">
                  {course.dificuldade}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
