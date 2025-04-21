
-- Execute the migration functions to transfer data from old tables to new improved tables
SELECT migrate_biblioteca_data();
SELECT migrate_flashcards_data();
