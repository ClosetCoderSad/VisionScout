import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const partners = [
  { name: "Toyota", logo: "🚗" },
  { name: "Honda", logo: "🏎️" },
  { name: "Ford", logo: "🚙" },
  { name: "CBRE", logo: "🏢" },
  { name: "Zillow", logo: "🏡" },
  { name: "Redfin", logo: "🏘️" },
];

export const PartnersSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-2">Trusted By Industry Leaders</h2>
          <p className="text-muted-foreground">Partnering with the best in automotive and real estate</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center items-center gap-12"
        >
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.1, y: -5 }}
              className="grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="text-6xl">{partner.logo}</div>
                <span className="text-sm font-semibold text-muted-foreground">{partner.name}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
