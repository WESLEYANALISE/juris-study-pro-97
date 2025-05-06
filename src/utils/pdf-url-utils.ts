
/**
 * Utility to handle consistent PDF URL processing
 */

/**
 * Process a URL to ensure it's a properly formatted full URL
 * Handles both absolute URLs and storage paths
 */
export function formatPDFUrl(url: string): string {
  if (!url) return '';

  // Already a full URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    console.log("URL is already complete:", url);
    return url;
  }

  // Remove any leading slashes to avoid double slashes
  const cleanPath = url.startsWith('/') ? url.substring(1) : url;
  
  // Add the Supabase storage URL prefix
  const storageBaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://yovocuutiwwmbempxcyo.supabase.co";
  const fullUrl = `${storageBaseUrl}/storage/v1/object/public/agoravai/${cleanPath}`;
  
  console.log("Converted URL:", fullUrl);
  return fullUrl;
}

/**
 * Test if a PDF URL is accessible
 * Returns a promise that resolves to true if the URL is accessible
 */
export async function testPDFAccess(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error("Error testing PDF access:", error);
    return false;
  }
}
