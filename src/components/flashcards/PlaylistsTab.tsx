
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export const PlaylistsTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Playlists de Estudo</CardTitle>
        <CardDescription>
          Crie playlists personalizadas com temas de diferentes áreas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="bg-muted/40 rounded-lg p-4 text-center">
            <p className="text-sm">Você ainda não tem playlists de estudo.</p>
            <Button className="mt-3" size="sm">
              <PlusCircle className="h-4 w-4 mr-1" />
              Criar Nova Playlist
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
