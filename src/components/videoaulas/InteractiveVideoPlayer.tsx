
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { VideoPlayer } from "@/components/VideoPlayer";

interface InteractiveVideoPlayerProps {
  videoId: string;
  onQuestionAppear: (question: any) => void;
}

export function InteractiveVideoPlayer({ videoId, onQuestionAppear }: InteractiveVideoPlayerProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    loadQuestions();
  }, [videoId]);

  const loadQuestions = async () => {
    const { data } = await supabase
      .from("video_questions")
      .select("*")
      .eq("video_id", videoId)
      .order("timestamp");

    if (data) {
      setQuestions(data);
    }
  };

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
    
    const question = questions.find(
      q => !q.shown && Math.abs(q.timestamp - time) < 1
    );

    if (question) {
      question.shown = true;
      onQuestionAppear(question);
    }
  }, [questions, onQuestionAppear]);

  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden">
      <VideoPlayer 
        videoId={videoId}
        onTimeUpdate={handleTimeUpdate}
      />
    </div>
  );
}
