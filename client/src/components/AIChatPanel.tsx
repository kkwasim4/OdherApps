import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Sparkles, TrendingUp, Shield, User, Activity, Brain } from "lucide-react";
import { cn } from "@/utils/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface AIChatPanelProps {
  tokenAddress?: string;
  tokenData?: any;
}

export function AIChatPanel({ tokenAddress, tokenData }: AIChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);

  // Draggable button state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragStartedRef = useRef(false);

  // Initialize position from localStorage or default
  useEffect(() => {
    const saved = localStorage.getItem('ai-chat-button-position');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPosition(parsed);
      } catch (e) {
        // Default to bottom-right
        setPosition({ 
          x: window.innerWidth - 80, 
          y: window.innerHeight - 80 
        });
      }
    } else {
      setPosition({ 
        x: window.innerWidth - 80, 
        y: window.innerHeight - 80 
      });
    }
  }, []);

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    dragStartedRef.current = true;
    setIsDragging(true);
    
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    setDragOffset({
      x: clientX - position.x,
      y: clientY - position.y
    });
  };

  // Handle drag move - global event listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      e.preventDefault();
      
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;
      
      // Constrain within viewport
      const buttonSize = 56;
      newX = Math.max(0, Math.min(newX, window.innerWidth - buttonSize));
      newY = Math.max(0, Math.min(newY, window.innerHeight - buttonSize));
      
      setPosition({ x: newX, y: newY });
    };
    
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        // Save to localStorage
        localStorage.setItem('ai-chat-button-position', JSON.stringify(position));
        
        // Reset drag started flag after a short delay
        setTimeout(() => {
          dragStartedRef.current = false;
        }, 100);
      }
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, position]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const buttonSize = 56;
      const maxX = window.innerWidth - buttonSize;
      const maxY = window.innerHeight - buttonSize;
      
      setPosition(prev => ({
        x: Math.min(prev.x, maxX),
        y: Math.min(prev.y, maxY)
      }));
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const viewport = document.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages]);

  // Welcome message when opening chat
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: `Hi! I'm OdherApps AI Assistant. I can help you understand:\n\n• Transaction Analysis - Decode complex transactions\n• Smart Contracts - Explain contract functionality\n• Scam Detection - Identify suspicious patterns\n• Wallet Behavior - Analyze holder activities\n• Market Insights - Provide market outlook & sentiment\n• Risk Assessment - Comprehensive security analysis\n\nWhat would you like to know about ${tokenData?.metadata?.symbol || 'this token'}?`,
        timestamp: Date.now()
      }]);
    }
  }, [isOpen, messages.length, tokenData]);

  const handleSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    
    const queryText = customQuery || input.trim();
    if (!queryText || isLoading) return;

    // Rate limiting
    const now = Date.now();
    if (now - lastRequestTime < 2000) {
      return;
    }
    setLastRequestTime(now);

    const userMessage: Message = {
      role: "user",
      content: queryText,
      timestamp: now
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userMessage.content,
          tokenAddress,
          tokenData
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || "Failed to get AI response");
      }

      const data = await response.json();

      const aiMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Chat error:', error);
      const errorData = error instanceof Error ? error : { message: 'Unknown error' };
      const errorMessage: Message = {
        role: "assistant",
        content: `Sorry, I encountered an error: ${errorData.message || 'Unknown error'}. Please try again or rephrase your question.`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    { icon: Shield, text: "Is this token safe?", query: "Analyze the security and risks of this token" },
    { icon: TrendingUp, text: "Market outlook?", query: "What's your outlook on this token's market performance?" },
    { icon: Activity, text: "Explain DApp activity", query: "Explain the DApp activity and what contracts are being used" },
    { icon: User, text: "Whale behavior?", query: "Analyze whale holder behavior and potential risks" },
  ];

  // Handle button click - only open if not dragging
  const handleButtonClick = () => {
    if (!dragStartedRef.current) {
      setIsOpen(true);
    }
  };

  if (!isOpen) {
    return (
      <button
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onClick={handleButtonClick}
        className={cn(
          "fixed h-14 w-14 rounded-full shadow-lg z-50",
          "bg-primary text-primary-foreground flex items-center justify-center",
          "transition-shadow duration-200",
          isDragging ? "cursor-grabbing shadow-2xl scale-110" : "cursor-grab hover-elevate"
        )}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          touchAction: 'none'
        }}
        data-testid="button-ai-chat-open"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[400px] h-[600px] shadow-2xl z-50 flex flex-col">
      <CardHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-primary" />
            OdherApps AI
            <Badge variant="secondary" className="ml-2 text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Beta
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            data-testid="button-ai-chat-close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
                data-testid={`message-${msg.role}-${i}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-[80%] whitespace-pre-wrap",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                </div>
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {messages.length <= 1 && (
          <div className="p-4 border-t border-b bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
            <div className="grid grid-cols-2 gap-2">
              {suggestedQuestions.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="justify-start text-xs h-auto py-2 px-3 hover-elevate"
                  onClick={() => handleSubmit(undefined, q.query)}
                  disabled={isLoading}
                  data-testid={`button-suggested-${i}`}
                >
                  <q.icon className="w-3 h-3 mr-1 shrink-0" />
                  <span className="truncate">{q.text}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1"
              data-testid="input-ai-chat"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading || (Date.now() - lastRequestTime < 2000)}
              data-testid="button-ai-send"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
