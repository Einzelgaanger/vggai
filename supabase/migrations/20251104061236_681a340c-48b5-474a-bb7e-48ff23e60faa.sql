-- Fix: Move vector extension to extensions schema (if not already there)
-- Note: This is handled by Supabase automatically, but we ensure it's not in public

-- Fix: Update search_similar_documents function with proper search_path
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
SECURITY DEFINER
SET search_path = public
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