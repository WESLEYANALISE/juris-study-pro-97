
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2, FileText, Check, AlertCircle, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const FerramentasApoio = () => {
  const [geradorLoading, setGeradorLoading] = useState(false);
  const [revisaoLoading, setRevisaoLoading] = useState(false);
  const [modeloSelecionado, setModeloSelecionado] = useState("peticao-inicial");
  const [textoDaRevisao, setTextoDaRevisao] = useState("");
  const [resultadoRevisao, setResultadoRevisao] = useState<string | null>(null);
  
  // Campos para geração de peça
  const [assunto, setAssunto] = useState("");
  const [partes, setPartes] = useState({
    autor: "",
    reu: ""
  });
  const [fatos, setFatos] = useState("");
  const [documentos, setDocumentos] = useState(true);
  const [pecaGerada, setPecaGerada] = useState<string | null>(null);

  const handleGerarPeca = async () => {
    if (!assunto.trim() || !partes.autor.trim() || !partes.reu.trim() || !fatos.trim()) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    setGeradorLoading(true);
    try {
      // Em um cenário real, chamaria o edge function
      // Simulação com timeout
      setTimeout(() => {
        // Exemplo de peça gerada
        const pecaExemplo = `
EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA VARA CÍVEL DA COMARCA DE [COMARCA]

${partes.autor.toUpperCase()}, [qualificação completa], vem, respeitosamente, à presença de Vossa Excelência, por seu advogado que esta subscreve (Doc. 01), com fundamento nos artigos 319 e seguintes do Código de Processo Civil, propor a presente

AÇÃO [TIPO DE AÇÃO]

em face de ${partes.reu.toUpperCase()}, [qualificação], pelos fatos e fundamentos que passa a expor:

I – DOS FATOS

${fatos}

II – DO DIREITO

[Fundamentação jurídica seria gerada aqui com base no assunto e fatos]

III – DO PEDIDO

Ante o exposto, requer a Vossa Excelência:

a) A citação do réu, no endereço indicado, para, querendo, contestar a presente ação, sob pena de revelia;

b) A procedência do pedido para [pedidos específicos seriam gerados com base no assunto];

c) A condenação do réu ao pagamento das custas processuais e honorários advocatícios;

${documentos ? `
IV – DAS PROVAS

Protesta provar o alegado por todos os meios de prova em direito admitidos, especialmente documental, testemunhal e pericial.
` : ''}

Dá-se à causa o valor de R$ [VALOR].

Termos em que,
Pede deferimento.

[Local], [Data].

[Nome do Advogado]
OAB/[Estado] [Número]`;

        setPecaGerada(pecaExemplo);
        setGeradorLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Erro ao gerar peça:", error);
      setGeradorLoading(false);
      alert("Erro ao gerar peça. Tente novamente.");
    }
  };

  const handleRevisarTexto = async () => {
    if (!textoDaRevisao.trim()) {
      alert("Digite o texto a ser revisado!");
      return;
    }

    setRevisaoLoading(true);
    try {
      // Em um cenário real, chamaria o edge function
      // Simulação com timeout
      setTimeout(() => {
        const revisaoExemplo = `
## Análise de Texto Jurídico

### Problemas de Formatação
- Faltam recuos em parágrafos [linhas 2, 5, 8]
- Espaçamento irregular entre parágrafos [linhas 10-12]
- Inconsistência no uso de negrito nos títulos

### Problemas Gramaticais
- "à princípio" -> "a princípio" [linha 3]
- "impetração do agravo" -> "interposição do agravo" [linha 7]
- "art.º" -> "art." (sem º) [diversas ocorrências]

### Problemas de Estilo Jurídico
- Uso excessivo de primeira pessoa [preferir impessoalidade]
- Argumentação repetitiva nos parágrafos 4 e 6
- Falta citação completa da jurisprudência mencionada

### Sugestões de Melhoria
- Reorganizar os argumentos em ordem lógica
- Fundamentar melhor o pedido com doutrina específica
- Revisar formatação das citações conforme ABNT
`;

        setResultadoRevisao(revisaoExemplo);
        setRevisaoLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Erro ao revisar texto:", error);
      setRevisaoLoading(false);
      alert("Erro ao revisar texto. Tente novamente.");
    }
  };

  const limparGerador = () => {
    setAssunto("");
    setPartes({
      autor: "",
      reu: ""
    });
    setFatos("");
    setDocumentos(true);
    setPecaGerada(null);
  };

  const limparRevisao = () => {
    setTextoDaRevisao("");
    setResultadoRevisao(null);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="gerador" className="space-y-4">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="gerador">Gerador de Peças</TabsTrigger>
          <TabsTrigger value="revisor">Revisor de Textos</TabsTrigger>
        </TabsList>

        <TabsContent value="gerador">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Gerador de Peças Jurídicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!pecaGerada ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="modelo">Tipo de Peça</Label>
                    <Select 
                      value={modeloSelecionado} 
                      onValueChange={setModeloSelecionado}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de peça" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="peticao-inicial">Petição Inicial</SelectItem>
                        <SelectItem value="contestacao">Contestação</SelectItem>
                        <SelectItem value="recurso-apelacao">Recurso de Apelação</SelectItem>
                        <SelectItem value="agravo-instrumento">Agravo de Instrumento</SelectItem>
                        <SelectItem value="habeas-corpus">Habeas Corpus</SelectItem>
                        <SelectItem value="mandado-seguranca">Mandado de Segurança</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assunto">Assunto</Label>
                    <Input 
                      id="assunto" 
                      placeholder="Ex: Ação de cobrança, Indenização por danos morais..." 
                      value={assunto}
                      onChange={(e) => setAssunto(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="autor">Autor/Requerente</Label>
                      <Input 
                        id="autor" 
                        placeholder="Nome do autor/requerente" 
                        value={partes.autor}
                        onChange={(e) => setPartes({...partes, autor: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reu">Réu/Requerido</Label>
                      <Input 
                        id="reu" 
                        placeholder="Nome do réu/requerido" 
                        value={partes.reu}
                        onChange={(e) => setPartes({...partes, reu: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fatos">Fatos (resumo)</Label>
                    <Textarea 
                      id="fatos" 
                      placeholder="Descreva brevemente os fatos relevantes para a peça" 
                      className="min-h-[120px]"
                      value={fatos}
                      onChange={(e) => setFatos(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="documentos"
                      checked={documentos}
                      onCheckedChange={setDocumentos}
                    />
                    <Label htmlFor="documentos">Incluir seção de provas/documentos</Label>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={limparGerador}>
                      Limpar
                    </Button>
                    <Button 
                      onClick={handleGerarPeca}
                      disabled={geradorLoading}
                    >
                      {geradorLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Gerar Peça
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-green-600">
                      <Check className="h-5 w-5 mr-2" />
                      <span className="font-medium">Peça gerada com sucesso!</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={limparGerador}>
                      Gerar Nova Peça
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="bg-muted p-4 rounded-md font-mono text-sm whitespace-pre-wrap overflow-auto max-h-[500px]">
                    {pecaGerada}
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">
                      Editar
                    </Button>
                    <Button>
                      Copiar Texto
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revisor">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Revisor de Textos Jurídicos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!resultadoRevisao ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="texto-revisao">Cole seu texto para revisão</Label>
                    <Textarea 
                      id="texto-revisao" 
                      placeholder="Cole aqui o texto jurídico que deseja revisar..." 
                      className="min-h-[300px] font-mono"
                      value={textoDaRevisao}
                      onChange={(e) => setTextoDaRevisao(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={limparRevisao}>
                      Limpar
                    </Button>
                    <Button 
                      onClick={handleRevisarTexto}
                      disabled={revisaoLoading || !textoDaRevisao.trim()}
                    >
                      {revisaoLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        "Revisar Texto"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-green-600">
                      <Check className="h-5 w-5 mr-2" />
                      <span className="font-medium">Revisão concluída!</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={limparRevisao}>
                      Nova Revisão
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="bg-muted p-4 rounded-md font-mono text-sm whitespace-pre-wrap overflow-auto max-h-[500px]">
                    {resultadoRevisao}
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">
                      Ver Texto Original
                    </Button>
                    <Button>
                      Aplicar Sugestões
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
