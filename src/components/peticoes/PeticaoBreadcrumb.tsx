
import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

interface PeticaoBreadcrumbProps {
  items: { label: string; href?: string }[];
  className?: string;
}

export function PeticaoBreadcrumb({ items, className }: PeticaoBreadcrumbProps) {
  return (
    <Breadcrumb className={cn("mb-4", className)}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/peticoes" className="flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />
              <span>Petições</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {items.map((item, index) => (
          <React.Fragment key={item.label}>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3.5 w-3.5" />
            </BreadcrumbSeparator>
            
            <BreadcrumbItem>
              {index === items.length - 1 || !item.href ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
