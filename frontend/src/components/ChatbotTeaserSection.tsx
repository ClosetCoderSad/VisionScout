import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const chatMessages = [
  { type: "user", text: "I'm looking for a sedan under $15k", delay: 0.5 },
  { type: "ai", text: "Found 3 matches near Dallas with high condition scores.", delay: 1.5 },
  { type: "user", text: "Show me homes with garages in Frisco", delay: 2.5 },
  { type: "ai", text: "Here are 5 verified properties matching your criteria.", delay: 3.5 },
];

export const ChatbotTeaserSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);

  useEffect(() => {
    if (isInView) {
      chatMessages.forEach((message, index) => {
        setTimeout(() => {
          setVisibleMessages((prev) => [...prev, index]);
        }, message.delay * 1000);
      });
    }
  }, [isInView]);

  return (
    <section ref={ref} className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Talk to VisionScout</h2>
            <p className="text-xl text-muted-foreground">
              Don't scroll listings — tell VisionScout what you want.
            </p>
          </motion.div>

          {/* Chat widget mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card border-2 border-border rounded-3xl p-8 shadow-2xl max-w-2xl mx-auto"
          >
            <div className="space-y-4 min-h-[300px]">
              {chatMessages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={
                    visibleMessages.includes(index)
                      ? { opacity: 1, y: 0, scale: 1 }
                      : { opacity: 0, y: 10, scale: 0.95 }
                  }
                  transition={{ duration: 0.4 }}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-6 py-3 rounded-2xl ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {message.type === "ai" && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                        <span className="text-xs font-semibold text-accent">VisionScout AI</span>
                      </div>
                    )}
                    <p className="text-sm">{message.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex items-center gap-3 bg-muted rounded-full px-6 py-3">
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground flex-1">Type your message...</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-center mt-8"
          >
            <Link to="/chat">
              <Button variant="hero" size="lg">
                Open the Chatbot →
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
