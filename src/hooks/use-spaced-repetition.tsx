
import { useStudyItems } from './use-study-items';
import { useStudyItemMutations } from './use-study-item-mutations';

interface UseSpacedRepetitionOptions {
  contentType?: 'flashcard' | 'book_section' | 'legal_article';
}

export function useSpacedRepetition(options: UseSpacedRepetitionOptions = {}) {
  const { studyItems, dueItems, isLoading, refresh } = useStudyItems(options);
  const { updateStudyItem, addStudyItem, removeStudyItem } = useStudyItemMutations(options);

  return {
    studyItems,
    dueItems,
    isLoading,
    updateStudyItem,
    addStudyItem,
    removeStudyItem,
    refresh
  };
}
