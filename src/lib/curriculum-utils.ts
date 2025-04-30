
/**
 * Get the appropriate CSS class for an area badge based on the area name
 */
export const getAreaColor = (area: string): string => {
  const normalizedArea = area.toUpperCase();
  
  switch (normalizedArea) {
    case 'CIVIL':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'PENAL':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'CONSTITUCIONAL':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'EMPRESARIAL':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'PROCESSO':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'FUNDAMENTOS':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    case 'LINGUAGEM':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
    case 'ECONÔMICO':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};
