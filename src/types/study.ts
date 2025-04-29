
export interface StudyItem {
  id: string;
  content_id: string;
  content_type: 'flashcard' | 'book_section' | 'legal_article';
  interval_days: number;
  consecutive_correct: number;
  next_review_date: string;
  last_reviewed_at?: string;
  created_at: string;
  user_id: string;
}
