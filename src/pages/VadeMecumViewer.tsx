
// In the ArticleCard component
<ArticleCard
  key={article.id}
  article={article}
  isCurrentlyNarrating={isNarrating && currentArticle?.id === article.id}
  onNarrate={() => handleNarration(article)}
/>
