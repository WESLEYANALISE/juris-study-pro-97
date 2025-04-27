
import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface VadeMecumCodeSectionProps {
  tableNames: string[];
  searchQuery: string;
}

const codeDisplayNames: Record<string, string> = {
  "Código_Civil": "Código Civil",
  "Código_Penal": "Código Penal",
  "Código_de_Processo_Civil": "Código de Processo Civil",
  "Código_de_Processo_Penal": "Código de Processo Penal",
  "Código_de_Defesa_do_Consumidor": "Código de Defesa do Consumidor",
  "Código_Tributário_Nacional": "Código Tributário Nacional",
  "Código_de_Trânsito_Brasileiro": "Código de Trânsito Brasileiro",
  "Código_Eleitoral": "Código Eleitoral",
  "Código_Comercial": "Código Comercial",
  "Código_Brasileiro_de_Telecomunicações": "Código Brasileiro de Telecomunicações",
};

const codeInfo: Record<string, { description: string; color: string }> = {
  "Código_Civil": { 
    description: "Regula os direitos e obrigações de ordem privada das pessoas", 
    color: "bg-blue-500" 
  },
  "Código_Penal": { 
    description: "Define crimes e estabelece penas", 
    color: "bg-red-500" 
  },
  "Código_de_Processo_Civil": { 
    description: "Regula o processo civil no âmbito do Poder Judiciário", 
    color: "bg-green-500" 
  },
  "Código_de_Processo_Penal": { 
    description: "Regula o processo penal no âmbito do Poder Judiciário", 
    color: "bg-amber-500" 
  },
  "Código_de_Defesa_do_Consumidor": { 
    description: "Estabelece normas de proteção e defesa do consumidor", 
    color: "bg-purple-500" 
  },
  "Código_Tributário_Nacional": { 
    description: "Regula o Sistema Tributário Nacional", 
    color: "bg-teal-500" 
  },
  "Código_de_Trânsito_Brasileiro": { 
    description: "Estabelece normas de trânsito e transporte", 
    color: "bg-orange-500" 
  },
  "Código_Eleitoral": { 
    description: "Regula o processo eleitoral brasileiro", 
    color: "bg-indigo-500" 
  },
  "Código_Comercial": { 
    description: "Regula as atividades comerciais", 
    color: "bg-cyan-500" 
  },
  "Código_Brasileiro_de_Telecomunicações": { 
    description: "Regula os serviços de telecomunicações", 
    color: "bg-pink-500" 
  },
};

const VadeMecumCodeSection: React.FC<VadeMecumCodeSectionProps> = ({ 
  tableNames, 
  searchQuery 
}) => {
  const navigate = useNavigate();

  console.log("CodeSection received tableNames:", tableNames);

  const filteredCodes = useMemo(() => {
    return tableNames.filter((codeName) => {
      const displayName = codeDisplayNames[codeName] || codeName.replace(/_/g, " ");
      return displayName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [tableNames, searchQuery]);

  const handleCodeClick = (codeName: string) => {
    navigate(`/vademecum/${codeName}`);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {filteredCodes.length === 0 ? (
        <div className="col-span-full text-center p-10">
          <p className="text-muted-foreground">Nenhum código encontrado.</p>
        </div>
      ) : (
        filteredCodes.map((codeName) => {
          const displayName = codeDisplayNames[codeName] || codeName.replace(/_/g, " ");
          const info = codeInfo[codeName] || { 
            description: "Conjunto de leis e normas jurídicas", 
            color: "bg-primary" 
          };
          
          return (
            <motion.div key={codeName} variants={item}>
              <Card 
                className="cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                onClick={() => handleCodeClick(codeName)}
              >
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className={`${info.color} h-full w-2 rounded-l-lg`}></div>
                    <div className="p-5 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold">{displayName}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })
      )}
    </motion.div>
  );
};

export default VadeMecumCodeSection;
