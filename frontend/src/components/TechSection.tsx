import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

const techStack = [
  { name: "Wearable Capture", description: "Smart glasses with multi-sensor array" },
  { name: "Frame Sampling", description: "High-speed image processing at 60fps" },
  { name: "YOLOv8", description: "Real-time object detection" },
  { name: "SegFormer", description: "Semantic segmentation for damage analysis" },
  { name: "OCR Engine", description: "Text extraction from VINs and documents" },
  { name: "Database", description: "Secure cloud storage & retrieval" },
  { name: "Report UI", description: "Interactive condition dashboards" },
];

export const TechSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">The Tech Behind VisionScout</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Cutting-edge AI models working together to verify every listing
          </p>
        </motion.div>

        {/* Tech flow diagram */}
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Connecting lines */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary opacity-30 -translate-y-1/2"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {techStack.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="bg-card border-2 border-border rounded-2xl p-6 hover:border-primary transition-all duration-300 hover:shadow-lg h-full relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      {index < techStack.length - 1 && (
                        <ArrowRight
                          className="hidden lg:block w-5 h-5 text-primary absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                          style={{ left: "calc(100% + 0.75rem)" }}
                        />
                      )}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{tech.name}</h3>
                    <p className="text-sm text-muted-foreground">{tech.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional tech details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-wrap justify-center gap-4">
            {["Computer Vision", "Deep Learning", "Cloud Infrastructure", "Real-time Processing"].map(
              (tag, index) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
                  className="px-6 py-3 bg-primary/10 border border-primary/30 rounded-full text-sm font-semibold text-primary"
                >
                  {tag}
                </motion.span>
              )
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
