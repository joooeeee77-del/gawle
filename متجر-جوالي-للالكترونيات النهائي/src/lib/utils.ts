/**
 * Dynamically optimizes Unsplash image URLs to reduce payload size,
 * enforce auto-formatting (WebP/AVIF), and set width and quality constraints.
 */
export function getOptimizedImageUrl(url: string, width = 600, quality = 80): string {
  if (!url || typeof url !== 'string') return '';
  if (url.includes('images.unsplash.com')) {
    try {
      const parsedUrl = new URL(url);
      parsedUrl.searchParams.set('w', width.toString());
      parsedUrl.searchParams.set('q', quality.toString());
      parsedUrl.searchParams.set('auto', 'format');
      parsedUrl.searchParams.set('fit', 'crop');
      return parsedUrl.toString();
    } catch (e) {
      return url;
    }
  }
  return url;
}
