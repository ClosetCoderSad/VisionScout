import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Sparkles, Target, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: Sparkles,
    title: "AI-Powered",
    description: "Advanced computer vision analyzes every detail automatically",
  },
  {
    icon: Shield,
    title: "Condition Verified",
    description: "No hidden damage—see the real condition before you buy",
  },
  {
    icon: Target,
    title: "No Hidden Damage",
    description: "Complete transparency with AI-detected issues highlighted",
  },
  {
    icon: Zap,
    title: "Smart Pricing",
    description: "Fair market values based on actual verified condition",
  },
];

export const WhyVisionScoutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Why VisionScout?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trust and transparency powered by cutting-edge AI technology
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg h-full">
                <CardContent className="pt-6 text-center">
                  <motion.div
                    className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <benefit.icon className="w-8 h-8 text-primary-foreground" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Comparison infographic */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* Traditional Way */}
            <div className="bg-destructive/10 border-2 border-destructive/30 rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">❌</span>
                </div>
                <h3 className="text-2xl font-bold text-destructive">Traditional Listing</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-destructive mt-1">×</span>
                  <span className="text-muted-foreground">Sellers upload random photos</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive mt-1">×</span>
                  <span className="text-muted-foreground">Hidden damage and issues</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive mt-1">×</span>
                  <span className="text-muted-foreground">Uncertain pricing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive mt-1">×</span>
                  <span className="text-muted-foreground">Buyer assumes all risk</span>
                </li>
              </ul>
            </div>

            {/* VisionScout Way */}
            <div className="bg-primary/10 border-2 border-primary rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">✓</span>
                </div>
                <h3 className="text-2xl font-bold text-primary">VisionScout Listing</h3>
              </div>
              <ul className="space-y-3">
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.7 }}
                  className="flex items-start gap-3"
                >
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-foreground font-medium">AI-verified scan & analysis</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  className="flex items-start gap-3"
                >
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-foreground font-medium">Complete condition report</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.9 }}
                  className="flex items-start gap-3"
                >
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-foreground font-medium">Verified fair pricing</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 1.0 }}
                  className="flex items-start gap-3"
                >
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-foreground font-medium">Buy with confidence</span>
                </motion.li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
