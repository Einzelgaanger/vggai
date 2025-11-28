# 🌐 Website Scraping Guide

## Overview

This guide explains how to use the website scraping feature to extract content from informational websites.

## Features

✅ **Single Page Scraping** - Extract content from a single URL  
✅ **Multi-Page Crawling** - Automatically crawl and scrape multiple pages from the same domain  
✅ **Content Extraction** - Extract text, links, and images  
✅ **CSS Selector Support** - Target specific content areas using CSS selectors  
✅ **Export Options** - Export scraped content as JSON or plain text  
✅ **Respectful Scraping** - Built-in delays to avoid overwhelming servers  

## How to Use

### 1. Access the Scraper

1. Login to your dashboard
2. Navigate to **Integrations** tab (CEO/CTO only)
3. Scroll down to find the **Website Scraper** section

### 2. Basic Scraping

1. **Enter URL**: Type the website URL you want to scrape
   - Example: `https://example.com`
   - Example: `https://docs.example.com/getting-started`

2. **Configure Options**:
   - **Max Pages**: How many pages to scrape (1-50, default: 10)
   - **CSS Selector** (optional): Target specific content
     - Example: `.content` - Scrapes only elements with class "content"
     - Example: `#main` - Scrapes only the element with id "main"
     - Example: `article` - Scrapes all article elements

3. **Check Options**:
   - ☑ **Include links**: Enables crawling - will follow links on the same domain
   - ☑ **Include images**: Extracts image URLs from pages

4. **Click "Start Scraping"**

### 3. View Results

After scraping completes:
- **Extracted Text**: All text content from scraped pages
- **Pages Scraped**: List of all pages with metadata
- **Export Options**: Download as JSON or plain text

## Examples

### Example 1: Scrape a Documentation Site

```
URL: https://docs.example.com
Max Pages: 20
Include Links: ✅ (to crawl the site)
CSS Selector: .doc-content
```

This will:
- Start at the docs homepage
- Follow internal links
- Extract only content from `.doc-content` elements
- Scrape up to 20 pages

### Example 2: Scrape a Blog Article

```
URL: https://blog.example.com/article
Max Pages: 1
Include Links: ❌
CSS Selector: article
```

This will:
- Scrape only the single article page
- Extract content from `<article>` elements
- Not follow any links

### Example 3: Scrape with Images

```
URL: https://example.com/gallery
Max Pages: 5
Include Images: ✅
Include Links: ✅
```

This will:
- Scrape the gallery and related pages
- Extract all image URLs
- Follow internal links

## Technical Details

### Architecture

1. **Frontend**: `src/components/dashboard/WebsiteScraper.tsx`
   - User interface for scraping
   - Displays results and export options

2. **Service**: `src/lib/web-scraper-service.ts`
   - Client-side service for calling the scraper
   - Helper functions for text extraction and export

3. **Backend**: `supabase/functions/scrape-website/index.ts`
   - Supabase Edge Function (Deno runtime)
   - Handles HTTP requests and HTML parsing
   - Implements crawling logic

### How It Works

1. User submits URL and options
2. Frontend calls Supabase Edge Function
3. Edge Function:
   - Fetches the webpage with proper headers
   - Parses HTML content
   - Extracts text, links, and images
   - If crawling enabled, follows internal links
   - Returns structured data
4. Frontend displays results
5. User can export content

### Rate Limiting

- **1 second delay** between page requests
- Prevents overwhelming target servers
- Respects website resources

### Supported Content

- ✅ HTML text content
- ✅ Page titles
- ✅ Internal links (same domain)
- ✅ Image URLs
- ✅ Custom CSS selector targeting

### Limitations

- ❌ JavaScript-rendered content (SPA sites may not work)
- ❌ Authentication-protected pages
- ❌ Sites with aggressive bot protection
- ❌ Complex CSS selectors (basic selectors only)

## Best Practices

### ✅ Do:

- **Respect robots.txt** - Check if the site allows scraping
- **Use reasonable limits** - Don't set maxPages too high
- **Target specific content** - Use CSS selectors to get only what you need
- **Check terms of service** - Ensure scraping is allowed
- **Use for informational sites** - Best for documentation, blogs, articles

### ❌ Don't:

- Scrape personal data or private information
- Overwhelm servers with too many requests
- Scrape copyrighted content without permission
- Use for commercial purposes without authorization
- Scrape sites that explicitly prohibit it

## Legal Considerations

⚠️ **Important**: Always ensure you have permission to scrape a website:

1. **Check robots.txt**: `https://example.com/robots.txt`
2. **Read Terms of Service**: Many sites prohibit scraping
3. **Respect Copyright**: Scraped content may be copyrighted
4. **Get Permission**: When in doubt, ask the website owner

## Troubleshooting

### "Failed to scrape website"

**Possible causes:**
- Website requires authentication
- Website blocks bots
- Invalid URL format
- Network connectivity issues
- Website is down

**Solutions:**
- Verify the URL is correct and accessible
- Try a different URL
- Check if the site requires login
- Some sites block automated requests

### "No content extracted"

**Possible causes:**
- CSS selector doesn't match any elements
- Content is loaded via JavaScript
- Page structure is different than expected

**Solutions:**
- Remove CSS selector to scrape entire page
- Try different selectors
- Check page source to verify structure

### "Only 1 page scraped when expecting more"

**Possible causes:**
- No internal links found
- Links point to external domains
- Links require JavaScript to work

**Solutions:**
- Verify the site has internal links
- Check if links are dynamically generated
- Increase maxPages if needed

## API Usage

You can also use the scraper programmatically:

```typescript
import { scrapeWebsite } from '@/lib/web-scraper-service';

const result = await scrapeWebsite('https://example.com', {
  maxPages: 5,
  includeLinks: true,
  includeImages: false,
  selector: '.content'
});

console.log(`Scraped ${result.pagesScraped} pages`);
console.log(result.content);
```

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Supabase Edge Function is deployed
3. Check Supabase function logs
4. Ensure environment variables are set correctly

