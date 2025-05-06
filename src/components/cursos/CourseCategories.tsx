
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Scale, 
  BookText, 
  Gavel, 
  Building2, 
  Users, 
  FileText, 
  Globe,
  Shield,
  Landmark,
  ScrollText,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CategoryCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  courseCount: number;
  onSelect: () => void;
  color: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  icon, 
  title, 
  description, 
  courseCount, 
  onSelect,
  color
}) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className="cursor-pointer"
    >
      <Card className="h-full border-2 hover:shadow-md transition-all duration-200 hover:border-primary/50 overflow-hidden">
        <CardHeader className={`pb-2 ${color}`}>
          <div className="flex justify-between items-start">
            <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm">
              {icon}
            </div>
            <Badge variant="outline" className="bg-white/20 text-white border-white/30">
              {courseCount} cursos
            </Badge>
          </div>
          <CardTitle className="text-lg mt-2 text-white">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <CardDescription className="line-clamp-2 text-sm">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function CourseCategories({ onSelectCategory }: { onSelectCategory: (category: string) => void }) {
  const categories = [
    {
      id: 'Direito Civil',
      icon: <ScrollText className="h-5 w-5 text-white" />,
      title: 'Direito Civil',
      description: 'Contratos, responsabilidade civil, direito de família e sucessões.',
      courseCount: 12,
      color: 'bg-gradient-to-r from-blue-600 to-blue-400',
    },
    {
      id: 'Direito Penal',
      icon: <Gavel className="h-5 w-5 text-white" />,
      title: 'Direito Penal',
      description: 'Teoria do crime, execução penal e processo penal.',
      courseCount: 8,
      color: 'bg-gradient-to-r from-red-600 to-red-400',
    },
    {
      id: 'Direito Constitucional',
      icon: <Landmark className="h-5 w-5 text-white" />,
      title: 'Direito Constitucional',
      description: 'Princípios fundamentais, organização do Estado e controle de constitucionalidade.',
      courseCount: 10,
      color: 'bg-gradient-to-r from-green-600 to-green-400',
    },
    {
      id: 'Direito Administrativo',
      icon: <Building2 className="h-5 w-5 text-white" />,
      title: 'Direito Administrativo',
      description: 'Atos administrativos, licitações e regime jurídico administrativo.',
      courseCount: 7,
      color: 'bg-gradient-to-r from-amber-600 to-amber-400',
    },
    {
      id: 'Direito Tributário',
      icon: <FileText className="h-5 w-5 text-white" />,
      title: 'Direito Tributário',
      description: 'Sistema tributário nacional, impostos e processo tributário.',
      courseCount: 6,
      color: 'bg-gradient-to-r from-purple-600 to-purple-400',
    },
    {
      id: 'Direito do Trabalho',
      icon: <Users className="h-5 w-5 text-white" />,
      title: 'Direito do Trabalho',
      description: 'Relações de trabalho, direitos trabalhistas e processo do trabalho.',
      courseCount: 9,
      color: 'bg-gradient-to-r from-orange-600 to-orange-400',
    },
    {
      id: 'Direito Empresarial',
      icon: <Building2 className="h-5 w-5 text-white" />,
      title: 'Direito Empresarial',
      description: 'Sociedades, títulos de crédito e recuperação de empresas.',
      courseCount: 5,
      color: 'bg-gradient-to-r from-sky-600 to-sky-400',
    },
    {
      id: 'Direito Internacional',
      icon: <Globe className="h-5 w-5 text-white" />,
      title: 'Direito Internacional',
      description: 'Tratados internacionais, organismos internacionais e direitos humanos.',
      courseCount: 4,
      color: 'bg-gradient-to-r from-indigo-600 to-indigo-400',
    },
    {
      id: 'OAB',
      icon: <GraduationCap className="h-5 w-5 text-white" />,
      title: 'Preparatório OAB',
      description: 'Cursos específicos para aprovação no Exame da Ordem.',
      courseCount: 15,
      color: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
    },
    {
      id: 'Carreiras Jurídicas',
      icon: <Scale className="h-5 w-5 text-white" />,
      title: 'Carreiras Jurídicas',
      description: 'Preparação para concursos na magistratura, MP e outras carreiras.',
      courseCount: 10,
      color: 'bg-gradient-to-r from-rose-600 to-rose-400',
    },
    {
      id: 'Especializações',
      icon: <BookText className="h-5 w-5 text-white" />,
      title: 'Especializações',
      description: 'Cursos avançados em áreas específicas do Direito.',
      courseCount: 14,
      color: 'bg-gradient-to-r from-violet-600 to-violet-400',
    },
    {
      id: 'Novidades',
      icon: <Shield className="h-5 w-5 text-white" />,
      title: 'Novidades Legislativas',
      description: 'Atualizações sobre novas leis e alterações na legislação.',
      courseCount: 3,
      color: 'bg-gradient-to-r from-cyan-600 to-cyan-400',
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Categorias de Cursos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            icon={category.icon}
            title={category.title}
            description={category.description}
            courseCount={category.courseCount}
            color={category.color}
            onSelect={() => onSelectCategory(category.id)}
          />
        ))}
      </div>
    </div>
  );
}
