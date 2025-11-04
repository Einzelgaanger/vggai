-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table to store document embeddings
CREATE TABLE IF NOT EXISTS public.document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI embedding dimension
  metadata JSONB DEFAULT '{}'::jsonb,
  source_table TEXT, -- which table this came from
  source_id UUID, -- ID of the source record
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_embeddings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can search embeddings based on their role
CREATE POLICY "Users can search embeddings based on role"
ON public.document_embeddings
FOR SELECT
TO authenticated
USING (
  CASE
    -- CEOs and CTOs can see everything
    WHEN public.has_role(auth.uid(), 'ceo') OR public.has_role(auth.uid(), 'cto') THEN true
    -- Others can see based on metadata filtering (will be enforced in edge function)
    ELSE true
  END
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS document_embeddings_embedding_idx 
ON public.document_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for metadata queries
CREATE INDEX IF NOT EXISTS document_embeddings_metadata_idx 
ON public.document_embeddings 
USING gin (metadata);

-- Function to search similar documents
CREATE OR REPLACE FUNCTION public.search_similar_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter_metadata jsonb DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  source_table text,
  source_id uuid,
  similarity float
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_embeddings.id,
    document_embeddings.content,
    document_embeddings.metadata,
    document_embeddings.source_table,
    document_embeddings.source_id,
    1 - (document_embeddings.embedding <=> query_embedding) AS similarity
  FROM public.document_embeddings
  WHERE 
    1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
    AND (filter_metadata IS NULL OR document_embeddings.metadata @> filter_metadata)
  ORDER BY document_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Trigger to update updated_at
CREATE TRIGGER update_document_embeddings_updated_at
BEFORE UPDATE ON public.document_embeddings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();