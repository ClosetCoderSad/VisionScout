import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Camera, Brain, FileCheck } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Capture",
    description: "Scan properties and vehicles with our AI-powered wearable glasses",
    color: "from-primary to-primary-light",
  },
  {
    icon: Brain,
    title: "Analyze",
    description: "Advanced AI processes every detail to detect condition, damage, and authenticity",
    color: "from-accent to-accent-light",
  },
  {
    icon: FileCheck,
    title: "Deliver",
    description: "Get instant verified reports with condition scores and pricing confidence",
    color: "from-primary-light to-primary",
  },
];

export const HowItWorksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to verify condition and trust pricing
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/3 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary opacity-30"></div>

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              <div className="bg-card border-2 border-border rounded-2xl p-8 hover:border-primary transition-all duration-300 hover:shadow-lg h-full">
                {/* Step number */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <motion.div
                  className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-6 mx-auto`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <step.icon className="w-10 h-10 text-white" />
                </motion.div>

                <h3 className="text-2xl font-bold mb-3 text-center">{step.title}</h3>
                <p className="text-muted-foreground text-center">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
