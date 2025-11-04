import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Database, RefreshCw } from "lucide-react";

interface EmbeddingsManagerProps {
  role: string | null;
}

const EmbeddingsManager = ({ role }: EmbeddingsManagerProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Only show for CEOs and CTOs
  if (!role || !['ceo', 'cto'].includes(role)) {
    return null;
  }

  const handleGenerateEmbeddings = async () => {
    setIsGenerating(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Not authenticated");
        return;
      }

      toast.info("Generating embeddings... This may take a minute.");

      const { data, error } = await supabase.functions.invoke('generate-embeddings', {
        body: {},
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error generating embeddings:', error);
        toast.error(`Failed to generate embeddings: ${error.message}`);
        return;
      }

      toast.success(`Successfully generated ${data.embeddings_created} embeddings!`);
      console.log('Embeddings result:', data);
    } catch (error) {
      console.error('Generate embeddings error:', error);
      toast.error("Failed to generate embeddings");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <CardTitle>AI Knowledge Base</CardTitle>
        </div>
        <CardDescription>
          Manage the semantic search database for VGG Assistant
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">
            Generate embeddings to enable AI-powered semantic search across:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>User profiles and contact information</li>
            <li>Department details and structure</li>
            <li>Role assignments and permissions</li>
          </ul>
          <p className="mt-3 text-xs">
            Run this whenever company data is updated to keep the AI knowledge base current.
          </p>
        </div>

        <Button
          onClick={handleGenerateEmbeddings}
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Embeddings...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate Embeddings
            </>
          )}
        </Button>

        {isGenerating && (
          <div className="text-xs text-center text-muted-foreground">
            This process may take 30-60 seconds depending on data volume
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmbeddingsManager;
