
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface Playlist {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  videoCount: number;
  thumbnail: string;
}

interface VideoAulasPlaylistsProps {
  playlists: Playlist[];
  loading: boolean;
  onPlaylistClick: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (t: string) => void;
}

const VideoAulasPlaylists: React.FC<VideoAulasPlaylistsProps> = ({
  playlists,
  loading,
  onPlaylistClick,
  searchTerm,
  setSearchTerm
}) => {
  if (loading)
    return <div className="flex items-center justify-center py-16">Carregando...</div>;

  if (!playlists.length)
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhuma playlist encontrada para "{searchTerm}"</p>
        <Button variant="outline" className="mt-4" onClick={() => setSearchTerm("")}>
          Limpar filtro
        </Button>
      </div>
    );

  return (
    <div className="flex flex-wrap gap-4">
      {playlists.map(playlist => (
        <Card
          key={playlist.id}
          className="cursor-pointer w-[260px] hover:shadow-lg transition"
          onClick={() => onPlaylistClick(playlist.id)}
        >
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <img src={playlist.thumbnail || "/placeholder.svg"} alt={playlist.title} className="w-full h-full object-cover" />
          </div>
          <CardHeader>
            <CardTitle className="text-base">{playlist.title}</CardTitle>
            <CardDescription>
              {playlist.channelTitle} • {playlist.videoCount} vídeos
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full">Ver Playlist</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default VideoAulasPlaylists;
