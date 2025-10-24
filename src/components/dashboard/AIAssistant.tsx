import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare } from "lucide-react";
import { useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantProps {
  role: string | null;
  userEmail: string;
}

const AIAssistant = ({ role, userEmail }: AIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
    const welcomeMessage = `Hello! I'm your AI assistant specialized for ${roleName}. I have access to your role-specific data and can help you with analytics, insights, and answering questions about your dashboard. What would you like to know?`;
    
    setMessages([
      {
        role: "assistant",
        content: welcomeMessage,
      },
    ]);
  }, [role]);

  const streamChat = async (userMessage: Message) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to use the AI assistant");
        return;
      }

      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
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

      setIsLoading(false);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to communicate with AI assistant");
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
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
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const getUserInitials = () => {
    if (!userEmail) return "U";
    return userEmail.charAt(0).toUpperCase();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Sticky AI Assistant Sub-header */}
      <div className="sticky top-16 z-10 bg-primary-light border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">AI Assistant</h2>
            <p className="text-xs text-muted-foreground">Role-specific insights and guidance</p>
          </div>
        </div>
      </div>

      {/* Scrollable chat messages area */}
      <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
        <div className="py-6 space-y-6 max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div
                className={`rounded-xl px-4 py-3 max-w-[75%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-card text-foreground shadow-soft border border-border"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-muted-foreground">{getUserInitials()}</span>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="rounded-xl px-4 py-3 bg-card border border-border shadow-soft">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Sticky pill input bar at bottom */}
      <div className="sticky bottom-0 bg-background border-t border-border p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2 bg-card rounded-full border border-input px-4 py-2 shadow-soft">
            <Textarea
              ref={textareaRef}
              placeholder="Ask me anything about your role and data..."
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              rows={1}
              className="flex-1 bg-transparent border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[2.5rem] max-h-[12rem] py-2"
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
    </div>
  );
};

export default AIAssistant;
