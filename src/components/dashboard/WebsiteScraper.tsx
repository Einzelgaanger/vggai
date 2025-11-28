import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Download, Globe, FileText } from "lucide-react";
import { scrapeWebsite, extractAllText, exportAsJSON, exportAsText, type ScrapedContent } from "@/lib/web-scraper-service";
import { toast } from "sonner";

export function WebsiteScraper() {
  const [url, setUrl] = useState("");
  const [maxPages, setMaxPages] = useState(10);
  const [includeImages, setIncludeImages] = useState(false);
  const [includeLinks, setIncludeLinks] = useState(false);
  const [selector, setSelector] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedContent, setScrapedContent] = useState<ScrapedContent[]>([]);
  const [extractedText, setExtractedText] = useState("");

  const handleScrape = async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    setIsScraping(true);
    setScrapedContent([]);
    setExtractedText("");

    try {
      const result = await scrapeWebsite(url, {
        maxPages,
        includeImages,
        includeLinks,
        selector: selector || undefined,
      });

      setScrapedContent(result.content);
      const allText = extractAllText(result.content);
      setExtractedText(allText);

      toast.success(`Successfully scraped ${result.pagesScraped} page(s)`);
    } catch (error) {
      console.error("Scraping error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to scrape website");
    } finally {
      setIsScraping(false);
    }
  };

  const handleExportJSON = () => {
    if (scrapedContent.length === 0) {
      toast.error("No content to export");
      return;
    }

    const json = exportAsJSON(scrapedContent);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scraped-content-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Content exported as JSON");
  };

  const handleExportText = () => {
    if (extractedText.length === 0) {
      toast.error("No content to export");
      return;
    }

    const text = exportAsText(scrapedContent);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scraped-content-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Content exported as text");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Website Scraper
          </CardTitle>
          <CardDescription>
            Scrape content from informational websites. Enter a URL and configure options below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isScraping}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxPages">Max Pages</Label>
              <Input
                id="maxPages"
                type="number"
                min="1"
                max="50"
                value={maxPages}
                onChange={(e) => setMaxPages(parseInt(e.target.value) || 10)}
                disabled={isScraping}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="selector">CSS Selector (optional)</Label>
              <Input
                id="selector"
                type="text"
                placeholder=".content, #main, article"
                value={selector}
                onChange={(e) => setSelector(e.target.value)}
                disabled={isScraping}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeLinks"
                checked={includeLinks}
                onCheckedChange={(checked) => setIncludeLinks(checked === true)}
                disabled={isScraping}
              />
              <Label htmlFor="includeLinks" className="cursor-pointer">
                Include links (crawl site)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeImages"
                checked={includeImages}
                onCheckedChange={(checked) => setIncludeImages(checked === true)}
                disabled={isScraping}
              />
              <Label htmlFor="includeImages" className="cursor-pointer">
                Include images
              </Label>
            </div>
          </div>

          <Button
            onClick={handleScrape}
            disabled={isScraping || !url.trim()}
            className="w-full"
          >
            {isScraping ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <Globe className="mr-2 h-4 w-4" />
                Start Scraping
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {scrapedContent.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Scraped Content</CardTitle>
                <CardDescription>
                  {scrapedContent.length} page(s) scraped successfully
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportJSON}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportText}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Export Text
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Extracted Text ({extractedText.length} characters)</Label>
              <Textarea
                value={extractedText}
                readOnly
                className="min-h-[400px] font-mono text-sm"
                placeholder="Scraped content will appear here..."
              />
            </div>

            <div className="space-y-2">
              <Label>Pages Scraped</Label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {scrapedContent.map((page, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg bg-muted/50"
                  >
                    <div className="font-semibold text-sm">{page.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {page.url}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {page.text.length} characters
                      {page.links && ` • ${page.links.length} links`}
                      {page.images && ` • ${page.images.length} images`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

