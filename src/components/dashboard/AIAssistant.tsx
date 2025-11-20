import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send, Brain, Copy, Check, Sparkles, X, Loader2, Bot, User, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

interface AIAssistantProps {
  role: string | null;
  userEmail: string;
  selectedCompanyId?: string | null;
}

const QUICK_ACTIONS = [
  "Show me key metrics for this month",
  "What are the latest trends?",
  "Explain my role-specific data",
  "Help me understand the dashboard",
];

const AIAssistant = ({ role, userEmail, selectedCompanyId }: AIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
        timestamp: new Date(),
      },
    ]);
  }, [role]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      setMessages(prev => [...prev, { role: "assistant", content: "", timestamp: new Date() }]);

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
                  timestamp: newMessages[newMessages.length - 1]?.timestamp || new Date(),
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

      setIsLoading(false);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to communicate with AI assistant");
      setIsLoading(false);
    }
  };

  const handleSend = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageContent) {
      setInput("");
      resetTextarea();
    }
    setIsLoading(true);

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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
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

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success("Message copied to clipboard");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      toast.error("Failed to copy message");
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  const formatMessage = (content: string) => {
    // Simple text formatting - preserve line breaks and basic formatting
    return content;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b shadow-sm">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-accent flex items-center justify-center shadow-lg ring-2 ring-primary/20">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse" />
                  <Brain className="h-5 w-5 text-primary-foreground relative z-10" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-accent rounded-full border-2 border-background shadow-md flex items-center justify-center">
                  <Zap className="h-2 w-2 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h2 className="font-semibold text-base text-foreground">VGG AI Assistant</h2>
                <p className="text-xs text-muted-foreground">Role-specific insights and guidance</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-3 h-3 mr-1.5" />
              AI Powered
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth chat-scrollbar"
      >
        <div className="container max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-4 animate-slide-up",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-accent flex items-center justify-center shadow-lg ring-2 ring-primary/20">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse" />
                    <Brain className="h-5 w-5 text-primary-foreground relative z-10" />
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full border-2 border-background shadow-sm" />
                </div>
              )}
              
              <div className={cn(
                "flex flex-col gap-1.5 max-w-[80%] sm:max-w-[75%]",
                message.role === "user" ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "rounded-2xl px-4 py-3 shadow-lg transition-all hover:shadow-xl group",
                  message.role === "user"
                    ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground"
                    : "bg-card border-2 border-border/50 text-foreground"
                )}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words m-0">
                    {message.content}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 px-1 group/meta">
                  {message.timestamp && (
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </span>
                  )}
                  {message.role === "assistant" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover/meta:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(message.content, index)}
                    >
                      {copiedIndex === index ? (
                        <Check className="h-3 w-3 text-success" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {message.role === "user" && (
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-md">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4 justify-start animate-slide-up">
              <div className="flex-shrink-0 relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-accent flex items-center justify-center shadow-lg ring-2 ring-primary/20 animate-pulse">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 animate-ping opacity-75" />
                  <Brain className="h-5 w-5 text-primary-foreground relative z-10" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full border-2 border-background shadow-sm animate-pulse" />
              </div>
              <div className="bg-card border-2 border-border/50 rounded-2xl px-4 py-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5 items-end h-5">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full typing-dot" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full typing-dot" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full typing-dot" />
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && !isLoading && (
        <div className="px-4 sm:px-6 pb-4 animate-slide-up">
          <div className="container max-w-4xl mx-auto">
            <p className="text-xs text-muted-foreground mb-3 px-1">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSend(action)}
                  className="text-xs h-8 rounded-full border-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t shadow-lg">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <Card className="border-2 shadow-lg">
            <div className="flex items-end gap-3 p-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  placeholder="Ask me anything about your role and data..."
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyPress}
                  disabled={isLoading}
                  rows={1}
                  className="w-full bg-transparent border-0 resize-none focus-visible:outline-none min-h-[2.5rem] max-h-[120px] py-2 px-3 text-sm placeholder:text-muted-foreground [scrollbar-width:thin]"
                />
                {input.length > 0 && (
                  <div className="absolute bottom-1 right-2 text-xs text-muted-foreground">
                    {input.length}
                  </div>
                )}
              </div>
              <Button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="h-10 w-10 rounded-xl flex-shrink-0 shadow-md hover:shadow-lg transition-all"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="px-3 pb-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Shift + Enter</kbd> for new line
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
