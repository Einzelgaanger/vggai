import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapeRequest {
  url: string;
  maxPages?: number;
  includeImages?: boolean;
  includeLinks?: boolean;
  selector?: string; // CSS selector to target specific content
}

interface ScrapedContent {
  url: string;
  title: string;
  text: string;
  html?: string;
  links?: string[];
  images?: string[];
  timestamp: string;
}

/**
 * Scrape a single page
 */
async function scrapePage(url: string, options: ScrapeRequest): Promise<ScrapedContent | null> {
  try {
    console.log(`Scraping: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    
    // Parse HTML using regex (simple approach)
    // For more complex parsing, you'd want to use a proper HTML parser
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'No Title';

    // Extract text content (remove scripts, styles, etc.)
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // If selector is provided, try to extract specific content
    if (options.selector) {
      // Simple selector matching (for basic cases)
      // For complex selectors, you'd need a proper HTML parser
      const selectorRegex = new RegExp(`<[^>]*class=["'][^"']*${options.selector}[^"']*["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`, 'gi');
      const matches = html.match(selectorRegex);
      if (matches && matches.length > 0) {
        text = matches.map(m => m.replace(/<[^>]+>/g, ' ').trim()).join(' ');
      }
    }

    const result: ScrapedContent = {
      url,
      title,
      text,
      html: options.includeImages || options.includeLinks ? html : undefined,
      timestamp: new Date().toISOString(),
    };

    // Extract links if requested
    if (options.includeLinks) {
      const linkMatches = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi);
      if (linkMatches) {
        result.links = linkMatches
          .map(link => {
            const hrefMatch = link.match(/href=["']([^"']+)["']/i);
            if (hrefMatch) {
              const href = hrefMatch[1];
              // Convert relative URLs to absolute
              if (href.startsWith('http')) return href;
              if (href.startsWith('/')) {
                const urlObj = new URL(url);
                return `${urlObj.origin}${href}`;
              }
              return new URL(href, url).href;
            }
            return null;
          })
          .filter((link): link is string => link !== null && link.startsWith('http'));
      }
    }

    // Extract images if requested
    if (options.includeImages) {
      const imgMatches = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
      if (imgMatches) {
        result.images = imgMatches
          .map(img => {
            const srcMatch = img.match(/src=["']([^"']+)["']/i);
            if (srcMatch) {
              const src = srcMatch[1];
              // Convert relative URLs to absolute
              if (src.startsWith('http')) return src;
              if (src.startsWith('/')) {
                const urlObj = new URL(url);
                return `${urlObj.origin}${src}`;
              }
              return new URL(src, url).href;
            }
            return null;
          })
          .filter((img): img is string => img !== null);
      }
    }

    return result;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

/**
 * Find all links on a page that belong to the same domain
 */
function extractInternalLinks(html: string, baseUrl: string): string[] {
  const urlObj = new URL(baseUrl);
  const domain = urlObj.origin;
  
  const linkMatches = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi);
  if (!linkMatches) return [];

  const links = new Set<string>();
  
  for (const link of linkMatches) {
    const hrefMatch = link.match(/href=["']([^"']+)["']/i);
    if (hrefMatch) {
      const href = hrefMatch[1];
      let absoluteUrl: string;
      
      if (href.startsWith('http')) {
        absoluteUrl = href;
      } else if (href.startsWith('/')) {
        absoluteUrl = `${domain}${href}`;
      } else {
        absoluteUrl = new URL(href, baseUrl).href;
      }
      
      // Only include links from the same domain
      if (absoluteUrl.startsWith(domain)) {
        links.add(absoluteUrl);
      }
    }
  }
  
  return Array.from(links);
}

/**
 * Scrape entire website (crawl multiple pages)
 */
async function scrapeWebsite(
  startUrl: string,
  options: ScrapeRequest
): Promise<ScrapedContent[]> {
  const maxPages = options.maxPages || 10;
  const visited = new Set<string>();
  const toVisit = [startUrl];
  const results: ScrapedContent[] = [];

  while (toVisit.length > 0 && results.length < maxPages) {
    const url = toVisit.shift()!;
    
    if (visited.has(url)) continue;
    visited.add(url);

    const content = await scrapePage(url, options);
    if (content) {
      results.push(content);
      
      // If we want to crawl, extract links from this page
      if (options.includeLinks && content.html) {
        const internalLinks = extractInternalLinks(content.html, url);
        for (const link of internalLinks) {
          if (!visited.has(link) && !toVisit.includes(link)) {
            toVisit.push(link);
          }
        }
      }
    }

    // Be respectful - add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: ScrapeRequest = await req.json();
    const { url, maxPages = 10, includeImages = false, includeLinks = false, selector } = body;

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting scrape of: ${url}`);
    
    // Scrape the website
    const results = await scrapeWebsite(url, {
      url,
      maxPages,
      includeImages,
      includeLinks,
      selector,
    });

    return new Response(
      JSON.stringify({
        success: true,
        pagesScraped: results.length,
        content: results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Scrape error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

