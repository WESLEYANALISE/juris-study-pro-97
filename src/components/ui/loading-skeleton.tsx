
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "card" | "video" | "playlist" | "list";
  count?: number;
}

export function LoadingSkeleton({ 
  className, 
  variant = "card", 
  count = 4 
}: LoadingSkeletonProps) {
  // Helper function to generate random widths for text skeletons
  const randomWidth = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  // Card skeleton template
  const CardSkeleton = () => (
    <div className={cn("h-[320px] rounded-lg border overflow-hidden", className)}>
      <Skeleton className="h-40 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className={`h-4 w-[${randomWidth(60, 90)}%]`} />
        <Skeleton className={`h-3 w-[${randomWidth(40, 70)}%]`} />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );

  // Video skeleton template
  const VideoSkeleton = () => (
    <div className="space-y-3">
      <div className="relative">
        <Skeleton className="aspect-video w-full rounded-lg" />
        <Skeleton className="absolute bottom-2 right-2 h-5 w-12 rounded-sm" />
      </div>
      <Skeleton className={`h-4 w-[${randomWidth(70, 95)}%]`} />
      <Skeleton className={`h-3 w-[${randomWidth(40, 60)}%]`} />
    </div>
  );

  // Playlist skeleton template
  const PlaylistSkeleton = () => (
    <div className={cn("space-y-3", className)}>
      <Skeleton className="aspect-video w-full rounded-lg" />
      <Skeleton className={`h-5 w-[${randomWidth(70, 90)}%]`} />
      <Skeleton className={`h-4 w-[${randomWidth(40, 60)}%]`} />
      <Skeleton className="h-9 w-full rounded-md" />
    </div>
  );

  // List item skeleton template
  const ListSkeleton = () => (
    <div className={cn("flex items-center space-x-3 py-2", className)}>
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className={`h-4 w-[${randomWidth(60, 90)}%]`} />
        <Skeleton className={`h-3 w-[${randomWidth(30, 50)}%]`} />
      </div>
    </div>
  );

  // Select the appropriate skeleton based on variant
  const SkeletonComponent = 
    variant === "card" ? CardSkeleton :
    variant === "video" ? VideoSkeleton :
    variant === "playlist" ? PlaylistSkeleton :
    ListSkeleton;

  // Generate the specified number of skeletons
  return (
    <div className={
      variant === "card" || variant === "playlist" ? 
        "grid grid-cols-1 md:grid-cols-2 gap-4" : 
        "space-y-4"
    }>
      {Array(count).fill(0).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </div>
  );
}
