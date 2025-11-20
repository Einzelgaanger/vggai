import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import vggBackground from "@/assets/vgg-background.png";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantProps {
  role: string | null;
  userEmail: string;
  selectedCompanyId?: string | null;
}

const AIAssistant = ({ role, userEmail, selectedCompanyId }: AIAssistantProps) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Markdown renderer component
  const MarkdownContent = ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed text-foreground/90">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
          ul: ({ children }) => <ul className="mb-4 ml-6 space-y-2 list-disc marker:text-primary/70">{children}</ul>,
          ol: ({ children }) => <ol className="mb-4 ml-6 space-y-2 list-decimal marker:text-primary/70">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed text-foreground/90 pl-2">{children}</li>,
          h1: ({ children }) => <h1 className="text-xl font-bold mb-4 mt-6 first:mt-0 text-foreground">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold mb-3 mt-5 first:mt-0 text-foreground">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold mb-2.5 mt-4 first:mt-0 text-foreground">{children}</h3>,
          code: ({ className, children }) => {
            const isInline = !className;
            return isInline ? (
              <code className="px-1.5 py-0.5 rounded-md bg-muted text-sm font-mono text-foreground border border-border">{children}</code>
            ) : (
              <code className="block p-4 rounded-lg bg-muted/50 text-sm font-mono overflow-x-auto my-4 border border-border">{children}</code>
            );
          },
          pre: ({ children }) => <pre className="my-4">{children}</pre>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/40 pl-4 my-4 italic text-muted-foreground bg-muted/30 py-2 rounded-r">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a href={href} className="text-primary hover:text-primary/80 underline underline-offset-2 font-medium transition-colors" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          hr: () => <hr className="my-6 border-border" />,
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto">
              <table className="min-w-full border border-border rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-muted/30 transition-colors">{children}</tr>,
          th: ({ children }) => <th className="px-4 py-2 text-left font-semibold text-foreground border-r border-border last:border-r-0">{children}</th>,
          td: ({ children }) => <td className="px-4 py-2 text-foreground/90 border-r border-border last:border-r-0">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  // Generate session ID for demo users
  const getSessionId = () => {
    let sessionId = localStorage.getItem('vgg-session-id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('vgg-session-id', sessionId);
    }
    return sessionId;
  };

  // Load conversation history on mount or when context changes
  useEffect(() => {
    loadConversationHistory();
  }, [role, userEmail, selectedCompanyId]);

  const loadConversationHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const sessionId = getSessionId();

      // Try to find existing conversation for this session and context
      const { data: existingConversation, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_email', userEmail)
        .eq('user_role', role || 'guest')
        .eq('selected_company_id', selectedCompanyId || 'none')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (convError) {
        console.error('Error loading conversation:', convError);
        initializeWelcomeMessage();
        return;
      }

      if (existingConversation) {
        setConversationId(existingConversation.id);

        // Load messages for this conversation
        const { data: chatMessages, error: msgError } = await supabase
          .from('chat_messages')
          .select('role, content, created_at')
          .eq('conversation_id', existingConversation.id)
          .order('created_at', { ascending: true });

        if (msgError) {
          console.error('Error loading messages:', msgError);
          initializeWelcomeMessage();
          return;
        }

        if (chatMessages && chatMessages.length > 0) {
          const loadedMessages = chatMessages
            .filter(msg => msg.role !== 'system')
            .map(msg => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
            }));
          
          setMessages(loadedMessages);
        } else {
          initializeWelcomeMessage();
        }
      } else {
        initializeWelcomeMessage();
      }
    } catch (error) {
      console.error('Error in loadConversationHistory:', error);
      initializeWelcomeMessage();
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const initializeWelcomeMessage = () => {
    const roleNames: Record<string, string> = {
      ceo: "CEO",
      cto: "CTO",
      cfo: "CFO",
      hr_manager: "HR Manager",
      hr_coordinator: "HR Coordinator",
      engineering_manager: "Engineering Manager",
      senior_developer: "Senior Developer",
      junior_developer: "Junior Developer",
      product_manager: "Product Manager",
      sales_manager: "Sales Manager",
      sales_representative: "Sales Representative",
      marketing_manager: "Marketing Manager",
      marketing_specialist: "Marketing Specialist",
      finance_manager: "Finance Manager",
      accountant: "Accountant",
      operations_manager: "Operations Manager",
      support_manager: "Support Manager",
      support_agent: "Support Agent",
      data_analyst: "Data Analyst",
      it_administrator: "IT Administrator",
    };

    const roleName = role ? roleNames[role] || role : "your role";
    const welcomeMessage = `Hello! I'm VGG Assistant, your AI assistant specialized for ${roleName}. I have access to your role-specific data and can help you with analytics, insights, and answering questions about your dashboard. What would you like to know?`;
    
    setMessages([
      {
        role: "assistant",
        content: welcomeMessage,
      },
    ]);
  };

  const saveMessageToDb = async (msgRole: string, content: string) => {
    try {
      const sessionId = getSessionId();
      
      // Create conversation if it doesn't exist
      if (!conversationId) {
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            session_id: sessionId,
            user_email: userEmail,
            user_role: role || 'guest',
            selected_company_id: selectedCompanyId || 'none',
          })
          .select('id')
          .single();

        if (convError) {
          console.error('Error creating conversation:', convError);
          return;
        }

        if (newConversation) {
          setConversationId(newConversation.id);

          // Save the message
          await supabase.from('chat_messages').insert({
            conversation_id: newConversation.id,
            role: msgRole,
            content,
          });
        }
      } else {
        // Save message to existing conversation
        await supabase.from('chat_messages').insert({
          conversation_id: conversationId,
          role: msgRole,
          content,
        });
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const streamChat = async (userMessage: Message) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: [...messages, userMessage],
          role,
          userEmail,
          selectedCompanyId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Failed to get response");
        setIsLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let textBuffer = "";

      if (!reader) {
        throw new Error("No reader available");
      }

      // Add empty assistant message that we'll update
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
              // Update the last message
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantMessage,
                };
                return newMessages;
              });
            }
          } catch (e) {
            // Incomplete JSON, put it back
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save complete assistant message to database
      if (assistantMessage) {
        await saveMessageToDb("assistant", assistantMessage);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to communicate with AI assistant");
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || isLoadingHistory) return;

    const userMessage: Message = { role: "user", content: input };
    const userInput = input;
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    resetTextarea();
    setIsLoading(true);

    // Save user message to database
    await saveMessageToDb("user", userInput);

    await streamChat(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const resetTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const getUserInitials = () => {
    if (!userEmail) return "U";
    return userEmail.charAt(0).toUpperCase();
  };

  const toggleMessageExpansion = (index: number) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div 
      className="flex flex-col h-[calc(100vh-4rem)] relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${vggBackground})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Sticky AI Assistant Sub-header */}
      <div className="sticky top-16 z-10 bg-primary/95 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-primary-foreground">VGG Assistant</h2>
            <p className="text-xs text-primary-foreground/80">Role-specific insights and guidance</p>
          </div>
        </div>
      </div>

      {/* Scrollable chat messages area - hide scrollbar */}
      <div 
        className="flex-1 px-6 overflow-y-auto"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="py-6 space-y-6 max-w-4xl mx-auto pb-32">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-64">
              <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-6 shadow-lg">
                <div className="flex items-center gap-3 text-foreground">
                  <Brain className="h-6 w-6 animate-pulse text-primary" />
                  <span className="text-lg">Loading conversation history...</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-4 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                      <Brain className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-card border border-border shadow-sm"
                    }`}
                  >
                    {message.role === "user" ? (
                      <div className="text-sm leading-relaxed text-primary-foreground">
                        {message.content}
                      </div>
                    ) : (
                      <div className="text-sm">
                        <MarkdownContent content={message.content} />
                      </div>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                      <span className="text-xs font-semibold text-primary-foreground">
                        {getUserInitials()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                    <Brain className="w-5 h-5 text-primary animate-pulse" />
                  </div>
                  <div className="max-w-[85%] rounded-2xl px-5 py-4 bg-card border border-border shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary/70 animate-bounce shadow-sm" style={{ animationDelay: "0ms" }} />
                      <div className="w-2.5 h-2.5 rounded-full bg-primary/70 animate-bounce shadow-sm" style={{ animationDelay: "150ms" }} />
                      <div className="w-2.5 h-2.5 rounded-full bg-primary/70 animate-bounce shadow-sm" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sticky pill input bar at bottom with visibility */}
      <div 
        className="fixed left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-15"
        style={{
          bottom: '20px',
        }}
      >
        <div className="flex items-end gap-2 bg-white rounded-full border border-input px-4 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
          <textarea
            ref={textareaRef}
            placeholder="Ask me anything about your role and data..."
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-transparent border-0 resize-none focus-visible:outline-none min-h-[2.5rem] py-2 px-2"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="rounded-full flex-shrink-0 h-10 w-10"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
