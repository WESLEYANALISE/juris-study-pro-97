
import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Download, Star, MessageSquare, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";

// Types for course data
interface Curso {
  id: number;
  area: string;
  materia: string;
  sequencia: number;
  link: string;
  capa: string;
  sobre: string;
  download: string | null;
}

// Type for user progress
interface CursoProgress {
  id?: string;
  curso_id: number;
  user_id: string;
  progresso: number;
  concluido: boolean;
  created_at?: string;
  updated_at?: string;
}

// Type for course feedback
interface CursoFeedback {
  id?: string;
  curso_id: number;
  user_id: string;
  avaliacao: number;
  comentario: string | null;
  created_at?: string;
}

const CursoViewer = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get course from route state or fetch it
  const [curso, setCurso] = useState<Curso | null>(
    location.state?.curso || null
  );
  
  const [loading, setLoading] = useState(!location.state?.curso);
  const [progress, setProgress] = useState<number>(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [feedbacks, setFeedbacks] = useState<CursoFeedback[]>([]);
  const [feedbackSort, setFeedbackSort] = useState<"recent" | "helpful">("recent");
  
  // Get course data if not available from route state
  useEffect(() => {
    const getCurso = async () => {
      if (!curso && id) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from("cursos_narrados")
            .select("*")
            .eq("id", parseInt(id))
            .single();
            
          if (error) throw error;
          setCurso(data as Curso);
        } catch (error) {
          console.error("Error fetching course:", error);
          toast({
            variant: "destructive",
            title: "Erro ao carregar curso",
            description: "Não foi possível carregar as informações do curso.",
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    getCurso();
  }, [curso, id]);
  
  // Check if user is enrolled and get progress
  useEffect(() => {
    const getProgress = async () => {
      if (!user || !curso) return;
      
      try {
        const { data, error } = await supabase
          .from("curso_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("curso_id", curso.id)
          .single();
          
        if (error && error.code !== "PGRST116") {
          console.error("Error fetching progress:", error);
          return;
        }
        
        if (data) {
          setProgress(data.progresso);
          setIsEnrolled(true);
        }
      } catch (error) {
        console.error("Error checking enrollment:", error);
      }
    };
    
    getProgress();
  }, [user, curso]);
  
  // Get course feedbacks
  useEffect(() => {
    const getFeedbacks = async () => {
      if (!curso) return;
      
      try {
        const { data, error } = await supabase
          .from("curso_feedback")
          .select("*, profiles(display_name, avatar_url)")
          .eq("curso_id", curso.id)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        setFeedbacks(data as CursoFeedback[]);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };
    
    getFeedbacks();
  }, [curso]);
  
  // Enroll in course
  const handleEnroll = async () => {
    if (!user || !curso) {
      toast({
        title: "Necessário fazer login",
        description: "Por favor, faça login para se inscrever neste curso.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase.from("curso_progress").insert({
        curso_id: curso.id,
        user_id: user.id,
        progresso: 0,
        concluido: false,
      });
      
      if (error) throw error;
      
      setIsEnrolled(true);
      setProgress(0);
      
      toast({
        title: "Inscrição realizada!",
        description: "Você foi inscrito com sucesso neste curso.",
      });
    } catch (error) {
      console.error("Error enrolling:", error);
      toast({
        variant: "destructive",
        title: "Erro na inscrição",
        description: "Não foi possível realizar a inscrição. Tente novamente.",
      });
    }
  };
  
  // Update progress (simulated for demo)
  const updateProgress = async (newProgress: number) => {
    if (!user || !curso) return;
    
    try {
      const { error } = await supabase
        .from("curso_progress")
        .update({ progresso: newProgress, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("curso_id", curso.id);
        
      if (error) throw error;
      setProgress(newProgress);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };
  
  // Submit feedback
  const submitFeedback = async () => {
    if (!user || !curso) {
      toast({
        title: "Necessário fazer login",
        description: "Por favor, faça login para enviar avaliações.",
        variant: "destructive",
      });
      return;
    }
    
    if (rating === 0) {
      toast({
        title: "Avaliação necessária",
        description: "Por favor, selecione uma classificação de 1 a 5 estrelas.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase.from("curso_feedback").insert({
        curso_id: curso.id,
        user_id: user.id,
        avaliacao: rating,
        comentario: comment.trim() || null,
      });
      
      if (error) throw error;
      
      toast({
        title: "Avaliação enviada",
        description: "Obrigado pelo seu feedback!",
      });
      
      // Reset form
      setRating(0);
      setComment("");
      
      // Refresh feedbacks
      const { data } = await supabase
        .from("curso_feedback")
        .select("*, profiles(display_name, avatar_url)")
        .eq("curso_id", curso.id)
        .order("created_at", { ascending: false });
        
      setFeedbacks(data as CursoFeedback[]);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar avaliação",
        description: "Não foi possível enviar sua avaliação. Tente novamente.",
      });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
        <p className="text-lg mb-4">Curso não encontrado</p>
        <Button onClick={() => navigate("/cursos")}>Voltar para Cursos</Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-card border-b">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/cursos")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold truncate mx-4">{curso.materia}</h1>
        {curso.download && (
          <a href={curso.download} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="icon">
              <Download className="h-5 w-5" />
            </Button>
          </a>
        )}
      </div>

      {/* Content */}
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        {/* Main content - iframe */}
        <div className="flex-grow">
          <iframe
            src={curso.link}
            className="w-full h-full border-0"
            title={curso.materia}
            allowFullScreen
          ></iframe>
        </div>

        {/* Side panel with course info, progress, feedback */}
        <div className="bg-card border-l w-full md:w-96 overflow-y-auto">
          <Tabs defaultValue="info">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="progress">Progresso</TabsTrigger>
              <TabsTrigger value="feedback">Avaliações</TabsTrigger>
            </TabsList>
            
            {/* Info Tab */}
            <TabsContent value="info" className="p-4">
              {curso.capa && (
                <div className="aspect-video mb-4">
                  <img 
                    src={curso.capa} 
                    alt={curso.materia} 
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
              )}
              <h2 className="text-xl font-semibold mb-1">{curso.materia}</h2>
              <div className="text-sm text-muted-foreground mb-4">
                Área: {curso.area}
              </div>
              <div className="text-sm mb-6">
                {curso.sobre || "Sem descrição disponível."}
              </div>
              
              {curso.download && (
                <a
                  href={curso.download}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block"
                >
                  <Button variant="secondary" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Material de Apoio
                  </Button>
                </a>
              )}
            </TabsContent>
            
            {/* Progress Tab */}
            <TabsContent value="progress" className="p-4">
              {isEnrolled ? (
                <>
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Seu progresso</span>
                      <span className="text-sm text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  {/* This is a demo - in a real app, you'd track actual modules */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Módulos</h3>
                    {[1, 2, 3, 4].map((module) => (
                      <div
                        key={module}
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div className="flex items-center">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                            progress >= module * 25 ? "bg-primary text-primary-foreground" : ""
                          }`}>
                            {progress >= module * 25 && (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">Módulo {module}</p>
                            <p className="text-sm text-muted-foreground">
                              {progress >= module * 25 ? "Concluído" : "Pendente"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateProgress(module * 25)}
                          disabled={progress >= module * 25}
                        >
                          {progress >= module * 25 ? "Concluído" : "Marcar como concluído"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="mb-4">
                    Inscreva-se neste curso para acompanhar seu progresso
                  </p>
                  <Button onClick={handleEnroll}>Inscrever-se</Button>
                </div>
              )}
            </TabsContent>
            
            {/* Feedback Tab */}
            <TabsContent value="feedback" className="p-4">
              {/* Add feedback */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full mb-6">
                    <Star className="mr-2 h-4 w-4" />
                    Avaliar este curso
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Avalie este curso</DialogTitle>
                    <DialogDescription>
                      Compartilhe sua opinião sobre o curso. Sua avaliação ajuda outros estudantes.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex justify-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Button
                          key={star}
                          variant="ghost"
                          size="icon"
                          onClick={() => setRating(star)}
                          className={rating >= star ? "text-yellow-500" : "text-muted-foreground"}
                        >
                          <Star className={`h-6 w-6 ${rating >= star ? "fill-yellow-500" : ""}`} />
                        </Button>
                      ))}
                    </div>
                    <Textarea
                      placeholder="Deixe um comentário (opcional, máx. 300 caracteres)"
                      value={comment}
                      onChange={(e) => setComment(e.target.value.substring(0, 300))}
                      rows={4}
                    />
                    <div className="text-right text-xs text-muted-foreground">
                      {comment.length}/300
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={submitFeedback}>Enviar avaliação</Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              {/* Feedback list */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Avaliações</h3>
                  <select
                    className="text-xs px-2 py-1 border rounded-md"
                    value={feedbackSort}
                    onChange={(e) => setFeedbackSort(e.target.value as "recent" | "helpful")}
                  >
                    <option value="recent">Mais recentes</option>
                    <option value="helpful">Mais úteis</option>
                  </select>
                </div>
                
                {feedbacks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="mx-auto h-8 w-8 mb-2" />
                    <p>Nenhuma avaliação ainda</p>
                    <p className="text-sm">Seja o primeiro a avaliar este curso</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.map((feedback) => (
                      <div key={feedback.id} className="border rounded-md p-4">
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {/* Display first letter of name or default */}
                                {(feedback as any).profiles?.display_name?.charAt(0) || "U"}
                              </span>
                            </div>
                            <span className="ml-2 text-sm font-medium">
                              {(feedback as any).profiles?.display_name || "Usuário"}
                            </span>
                          </div>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < feedback.avaliacao
                                    ? "fill-yellow-500 text-yellow-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {feedback.comentario && (
                          <p className="text-sm">{feedback.comentario}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(feedback.created_at as string).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CursoViewer;
