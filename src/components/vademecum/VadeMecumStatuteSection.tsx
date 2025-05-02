
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ScrollText, Users, UserRound, FileSpreadsheet, Shield, 
  Building, Scale, MapPin, UserCog, UsersRound
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface VadeMecumStatuteSectionProps {
  tableNames: string[];
  searchQuery: string;
}

const statuteDisplayNames: Record<string, string> = {
  "Estatuto_da_Criança_e_do_Adolescente": "Estatuto da Criança e do Adolescente",
  "Estatuto_do_Idoso": "Estatuto do Idoso",
  "Estatuto_da_Igualdade_Racial": "Estatuto da Igualdade Racial",
  "Estatuto_da_Pessoa_com_Deficiência": "Estatuto da Pessoa com Deficiência",
  "Estatuto_do_Desarmamento": "Estatuto do Desarmamento",
  "Estatuto_da_Advocacia_e_da_OAB": "Estatuto da Advocacia e da OAB",
  "Estatuto_dos_Servidores_Públicos_Civis_da_União": "Estatuto dos Servidores Públicos Civis da União",
  "Estatuto_da_Terra": "Estatuto da Terra",
  "Estatuto_da_Cidade": "Estatuto da Cidade",
  "Estatuto_do_Torcedor": "Estatuto do Torcedor"
};

// Icons for each statute
const statuteIcons: Record<string, React.ElementType> = {
  "Estatuto_da_Criança_e_do_Adolescente": Users,
  "Estatuto_do_Idoso": UserRound,
  "Estatuto_da_Igualdade_Racial": UsersRound,
  "Estatuto_da_Pessoa_com_Deficiência": UserRound,
  "Estatuto_do_Desarmamento": Shield,
  "Estatuto_da_Advocacia_e_da_OAB": Scale,
  "Estatuto_dos_Servidores_Públicos_Civis_da_União": UserCog,
  "Estatuto_da_Terra": MapPin,
  "Estatuto_da_Cidade": Building,
  "Estatuto_do_Torcedor": UsersRound
};

// Information about each statute
const statuteInfo: Record<string, { description: string; color: string }> = {
  "Estatuto_da_Criança_e_do_Adolescente": { 
    description: "Estabelece direitos e garantias fundamentais a crianças e adolescentes", 
    color: "bg-yellow-500" 
  },
  "Estatuto_do_Idoso": { 
    description: "Regula os direitos das pessoas com idade igual ou superior a 60 anos", 
    color: "bg-purple-500" 
  },
  "Estatuto_da_Igualdade_Racial": { 
    description: "Garante à população negra a efetivação da igualdade de oportunidades", 
    color: "bg-blue-500" 
  },
  "Estatuto_da_Pessoa_com_Deficiência": { 
    description: "Assegura direitos às pessoas com deficiência", 
    color: "bg-green-500" 
  },
  "Estatuto_do_Desarmamento": { 
    description: "Dispõe sobre registro, posse e comercialização de armas de fogo", 
    color: "bg-red-500" 
  },
  "Estatuto_da_Advocacia_e_da_OAB": { 
    description: "Dispõe sobre o Estatuto da Advocacia e a OAB", 
    color: "bg-indigo-500" 
  },
  "Estatuto_dos_Servidores_Públicos_Civis_da_União": { 
    description: "Dispõe sobre o regime jurídico dos servidores públicos", 
    color: "bg-amber-500" 
  },
  "Estatuto_da_Terra": { 
    description: "Regula os direitos e obrigações relativos aos imóveis rurais", 
    color: "bg-emerald-500" 
  },
  "Estatuto_da_Cidade": { 
    description: "Estabelece normas de ordem pública e interesse social", 
    color: "bg-cyan-500" 
  },
  "Estatuto_do_Torcedor": { 
    description: "Estabelece normas de proteção e defesa do torcedor", 
    color: "bg-pink-500" 
  },
};

const VadeMecumStatuteSection: React.FC<VadeMecumStatuteSectionProps> = ({ tableNames, searchQuery }) => {
  const navigate = useNavigate();

  console.log("StatuteSection received tableNames:", tableNames);

  // Filter statutes based on search query
  const filteredStatutes = tableNames.filter((statuteName) => {
    const displayName = statuteDisplayNames[statuteName] || statuteName.replace(/_/g, " ");
    return displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleStatuteClick = (statuteName: string) => {
    navigate(`/vademecum/${statuteName}`);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
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
      {filteredStatutes.length === 0 ? (
        <div className="col-span-full text-center p-10">
          <p className="text-muted-foreground">Nenhum estatuto encontrado.</p>
        </div>
      ) : (
        filteredStatutes.map((statuteName) => {
          const displayName = statuteDisplayNames[statuteName] || statuteName.replace(/_/g, " ");
          const info = statuteInfo[statuteName] || { 
            description: "Conjunto de normas que regulam direitos específicos", 
            color: "bg-secondary" 
          };
          const IconComponent = statuteIcons[statuteName] || ScrollText;
          
          return (
            <motion.div key={statuteName} variants={item}>
              <Card 
                className="cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                onClick={() => handleStatuteClick(statuteName)}
              >
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className={`${info.color} h-full w-2 rounded-l-lg`}></div>
                    <div className="p-5 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
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

export default VadeMecumStatuteSection;
