-- Create conversations table to group chat messages
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  user_email TEXT,
  user_role TEXT,
  selected_company_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat_messages table to store individual messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Admins (CEO, CTO) can do everything on conversations
CREATE POLICY "Admins can manage all conversations"
ON public.conversations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('ceo', 'cto')
  )
);

-- Users can view and create their own conversations
CREATE POLICY "Users can view own conversations"
ON public.conversations
FOR SELECT
USING (user_id = auth.uid() OR session_id = current_setting('request.headers', true)::json->>'x-session-id');

CREATE POLICY "Users can create own conversations"
ON public.conversations
FOR INSERT
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Admins can manage all chat messages
CREATE POLICY "Admins can manage all messages"
ON public.chat_messages
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('ceo', 'cto')
  )
);

-- Users can view messages from their conversations
CREATE POLICY "Users can view own messages"
ON public.chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = chat_messages.conversation_id
    AND (c.user_id = auth.uid() OR c.session_id = current_setting('request.headers', true)::json->>'x-session-id')
  )
);

-- Users can create messages in their conversations
CREATE POLICY "Users can create messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.user_id = auth.uid() OR c.user_id IS NULL)
  )
);

-- Create indexes for better performance
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_session_id ON public.conversations(session_id);
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Trigger to update conversations.updated_at
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();