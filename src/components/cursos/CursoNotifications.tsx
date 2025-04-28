import { useState, useEffect } from "react";
import { Bell, BookOpen, Clock, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  type: "reminder" | "new_course" | "achievement" | "system";
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
  curso_id?: number;
}

export function CursoNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const mockNotifications: Notification[] = [
          {
            id: "1",
            type: "reminder",
            title: "Continue seu curso",
            message: "Você não concluiu o curso de Direito Civil. Continue de onde parou!",
            read: false,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            action_url: "/cursos/1",
            curso_id: 1
          },
          {
            id: "2",
            type: "new_course",
            title: "Novo curso disponível",
            message: "O curso 'Introdução ao Direito Penal' acabou de ser lançado!",
            read: false,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            action_url: "/cursos/2",
            curso_id: 2
          },
          {
            id: "3",
            type: "achievement",
            title: "Nova conquista!",
            message: "Parabéns! Você completou seu primeiro curso e desbloqueou uma conquista.",
            read: true,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
          },
          {
            id: "4",
            type: "system",
            title: "Bem-vindo ao JurisStudy",
            message: "Agradecemos por se juntar à nossa plataforma de estudos jurídicos.",
            read: true,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
          }
        ];

        setNotifications(mockNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reminder":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "new_course":
        return <BookOpen className="h-5 w-5 text-emerald-500" />;
      case "achievement":
        return <Bell className="h-5 w-5 text-indigo-500" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            {unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-80 sm:w-96 overflow-hidden rounded-md border bg-card shadow-lg"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                <h3 className="font-semibold">Notificações</h3>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount} não lida{unreadCount > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Marcar todas como lidas
              </Button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Você não tem notificações
                  </p>
                </div>
              ) : (
                <div>
                  {(showAll ? notifications : notifications.slice(0, 5)).map((notification) => (
                    <div
                      key={notification.id}
                      className={`border-b px-4 py-3 hover:bg-accent transition-colors ${
                        notification.read ? "" : "bg-primary/5"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm truncate">
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-1 flex-shrink-0">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1.5">
                            {notification.message}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleString(undefined, {
                                timeStyle: "short",
                                dateStyle: "short",
                              })}
                            </span>
                            {notification.action_url && (
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0"
                                onClick={() => {
                                  markAsRead(notification.id);
                                  window.location.href = notification.action_url!;
                                }}
                              >
                                Ver detalhes
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {notifications.length > 5 && !showAll && (
                    <div className="p-2 text-center">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowAll(true)}
                      >
                        Ver todas as notificações
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CursoNotifications;
