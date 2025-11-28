/**
 * Service for scraping website content
 * Uses Supabase Edge Function for server-side scraping
 */

const SCRAPE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-website`;

export interface ScrapeOptions {
  maxPages?: number; // Maximum number of pages to scrape (default: 10)
  includeImages?: boolean; // Include image URLs in results
  includeLinks?: boolean; // Include links and crawl the site
  selector?: string; // CSS selector to target specific content
}

export interface ScrapedContent {
  url: string;
  title: string;
  text: string;
  html?: string;
  links?: string[];
  images?: string[];
  timestamp: string;
}

export interface ScrapeResponse {
  success: boolean;
  pagesScraped: number;
  content: ScrapedContent[];
}

/**
 * Scrape a single page or entire website
 */
export async function scrapeWebsite(
  url: string,
  options: ScrapeOptions = {}
): Promise<ScrapeResponse> {
  try {
    console.log('Scraping website:', url);

    const response = await fetch(SCRAPE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        url,
        maxPages: options.maxPages || 10,
        includeImages: options.includeImages || false,
        includeLinks: options.includeLinks || false,
        selector: options.selector,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Scrape error:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Successfully scraped ${data.pagesScraped} pages`);
    return data as ScrapeResponse;
  } catch (error) {
    console.error('Failed to scrape website:', error);
    throw error;
  }
}

/**
 * Scrape a single page (convenience function)
 */
export async function scrapePage(url: string, options?: ScrapeOptions): Promise<ScrapedContent | null> {
  const result = await scrapeWebsite(url, { ...options, maxPages: 1, includeLinks: false });
  return result.content[0] || null;
}

/**
 * Extract all text content from scraped pages
 */
export function extractAllText(scrapedContent: ScrapedContent[]): string {
  return scrapedContent
    .map(page => page.text)
    .filter(text => text && text.trim().length > 0)
    .join('\n\n');
}

/**
 * Export scraped content as JSON
 */
export function exportAsJSON(content: ScrapedContent[]): string {
  return JSON.stringify(content, null, 2);
}

/**
 * Export scraped content as plain text
 */
export function exportAsText(content: ScrapedContent[]): string {
  return content
    .map(page => `# ${page.title}\n\nURL: ${page.url}\n\n${page.text}`)
    .join('\n\n---\n\n');
}

