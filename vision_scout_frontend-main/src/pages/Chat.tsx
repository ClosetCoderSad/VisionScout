import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sparkles,
  Send,
  MapPin,
  Gauge,
  Bed,
  Bath,
  Home,
  Ruler,
  Car,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  listings?: any[];
  content: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your VisionScout AI assistant. I'm here to help you find the perfect property or car based on your preferences. What are you looking for today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });

      const data = await response.json();

      // always take top 3 listings for cleaner layout
      if (data.listings && data.listings.length > 0) {
        const listingsMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "",
          listings: data.listings.slice(0, 3),
        };
        setMessages((prev) => [...prev, listingsMessage]);
      } else {
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply || "I couldn’t find any matching listings.",
        };
        setMessages((prev) => [...prev, fallbackMessage]);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to connect to the AI backend.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "I'm looking for a family home under $500k",
    "Show me electric cars with long range",
    "Find luxury apartments in downtown areas",
    "Compare SUVs for outdoor adventures",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <div className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-primary px-4 py-2 rounded-full mb-4">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
              <span className="text-primary-foreground font-semibold">
                AI Assistant
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-3">
              Your Personal{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Discovery
              </span>{" "}
              Agent
            </h1>
            <p className="text-muted-foreground">
              Share your preferences and let AI find the perfect match for you
            </p>
          </div>

          {/* Chat Container */}
          <Card className="mb-6 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto pr-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-gradient-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {message.listings ? (
                        <div className="space-y-6">
                          {message.listings.map((item, i) => {
                            const isCar =
                              item.make ||
                              item.bodyType ||
                              item.source === "Cars.com";

                            return (
                              <div
                                key={i}
                                className="p-3 rounded-lg bg-background shadow-sm border"
                              >
                                <div className="font-semibold text-lg mb-1">
                                  {item.address ||
                                    item.title ||
                                    `${item.year || ""} ${item.make || ""}`}
                                </div>

                                {/* Property Listing Layout */}
                                {!isCar ? (
                                  <div className="space-y-1 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-primary" />
                                      <span>
                                        {item.city
                                          ? `${item.city}, ${item.region || ""}`
                                          : "—"}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <Gauge className="h-4 w-4 text-primary" />
                                      <span>
                                        Score: {item.trust_score ?? "—"}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className="text-primary font-medium">
                                        $
                                        {item.price
                                          ? item.price.toLocaleString()
                                          : "—"}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        /month
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-1">
                                        <Bed className="h-4 w-4" />
                                        <span>{item.beds || "—"} bed</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Bath className="h-4 w-4" />
                                        <span>{item.baths || "—"} bath</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <Ruler className="h-4 w-4" />
                                      <span>
                                        {item.sqft
                                          ? `${item.sqft.toLocaleString()} sq ft`
                                          : "—"}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <Home className="h-4 w-4" />
                                      <span className="capitalize">
                                        {item.type || "—"}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  /* Car Listing Layout */
                                  <div className="space-y-1 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-primary" />
                                      <span>{item.year || "—"}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <Gauge className="h-4 w-4 text-primary" />
                                      <span>
                                        {item.mileage
                                          ? `${item.mileage.toLocaleString()} miles`
                                          : "—"}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <Car className="h-4 w-4 text-primary" />
                                      <span>{item.make || "—"}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <Gauge className="h-4 w-4 text-primary" />
                                      <span>
                                        Score:{" "}
                                        {item.final_score?.toFixed(2) ?? "—"}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {item.image_url && (
                                  <img
                                    src={item.image_url}
                                    alt={item.address || item.title || "Image"}
                                    className="w-full h-48 object-cover rounded-md mt-3 shadow-md"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Prompts */}
              {messages.length === 1 && (
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    Try asking:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {quickPrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="text-left justify-start h-auto py-3 px-4"
                        onClick={() => setInput(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe what you're looking for..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  variant="default"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                💡 <strong>Tip:</strong> The more details you provide about your
                preferences, budget, and requirements, the better
                recommendations you'll receive!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Chat;
