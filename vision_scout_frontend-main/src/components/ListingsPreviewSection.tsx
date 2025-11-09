import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, Home, Zap, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const listings = {
  cars: [
    { id: 1, title: "2022 Tesla Model 3", price: "$35,999", condition: 95, image: "🚗", location: "Dallas, TX" },
    { id: 2, title: "2021 Honda Accord", price: "$24,500", condition: 88, image: "🚙", location: "Austin, TX" },
    { id: 3, title: "2023 Toyota Camry", price: "$28,900", condition: 92, image: "🚘", location: "Houston, TX" },
  ],
  properties: [
    { id: 4, title: "Modern Downtown Loft", price: "$450,000", condition: 91, image: "🏢", location: "Dallas, TX" },
    { id: 5, title: "Suburban Family Home", price: "$385,000", condition: 87, image: "🏡", location: "Frisco, TX" },
    { id: 6, title: "Luxury Condo", price: "$525,000", condition: 94, image: "🏘️", location: "Plano, TX" },
  ],
};

export const ListingsPreviewSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeTab, setActiveTab] = useState<"cars" | "properties">("cars");
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const currentListings = listings[activeTab];

  return (
    <section ref={ref} className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Explore Listings</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Browse AI-verified properties and vehicles with full condition reports
          </p>

          {/* Toggle */}
          <div className="inline-flex bg-muted rounded-full p-1 gap-1">
            <button
              onClick={() => setActiveTab("cars")}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === "cars"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Car className="inline-block w-5 h-5 mr-2" />
              Cars
            </button>
            <button
              onClick={() => setActiveTab("properties")}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === "properties"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Home className="inline-block w-5 h-5 mr-2" />
              Properties
            </button>
          </div>
        </motion.div>

        {/* Listings Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {currentListings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-primary overflow-hidden">
                  <CardContent className="p-0">
                    {/* Image placeholder */}
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-8xl">
                      {listing.image}
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                            {listing.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{listing.location}</p>
                        </div>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          <Zap className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      </div>

                      {/* Condition bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Condition Score</span>
                          <span className="font-semibold text-primary">{listing.condition}/100</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-primary"
                            initial={{ width: 0 }}
                            animate={isInView ? { width: `${listing.condition}%` } : {}}
                            transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">{listing.price}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setSelectedListing(listing);
                            setDialogOpen(true);
                          }}
                        >
                          View Details →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <Link to="/listings">
            <Button variant="outline" size="lg">
              View All Listings
            </Button>
          </Link>
        </motion.div>

        {/* Details dialog */}
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setSelectedListing(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedListing?.title}</DialogTitle>
              <DialogDescription>
                {selectedListing?.location}
              </DialogDescription>
            </DialogHeader>

              <div className="grid gap-4">
              {/* Emoji display */}
              <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-8xl rounded-md">
                {selectedListing?.image}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-primary">{selectedListing?.price}</div>
                <div className="text-sm text-muted-foreground">ID: {selectedListing?.id}</div>
              </div>

              <div className="grid gap-4 text-sm text-muted-foreground">
                <div>
                  <div className="font-semibold mb-1">Location</div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {selectedListing?.location}
                  </div>
                </div>
                <div>
                  <div className="font-semibold mb-1">Condition Score</div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span>{selectedListing?.condition}/100</span>
                      <span className="text-primary font-medium">
                        {selectedListing?.condition >= 90 ? "Excellent" :
                         selectedListing?.condition >= 80 ? "Very Good" :
                         selectedListing?.condition >= 70 ? "Good" :
                         "Fair"}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary"
                        style={{ width: `${selectedListing?.condition ?? 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Type-specific details */}
              {activeTab === "properties" ? (
                <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground border-t pt-4">
                  <div>
                    <div className="font-semibold">Type</div>
                    <div>Residential</div>
                  </div>
                  <div>
                    <div className="font-semibold">Status</div>
                    <div>Available</div>
                  </div>
                  <div>
                    <div className="font-semibold">Listed</div>
                    <div>Recent</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground border-t pt-4">
                  <div>
                    <div className="font-semibold">Type</div>
                    <div>Vehicle</div>
                  </div>
                  <div>
                    <div className="font-semibold">Status</div>
                    <div>Available</div>
                  </div>
                  <div>
                    <div className="font-semibold">Listed</div>
                    <div>Recent</div>
                  </div>
                  <div>
                    <div className="font-semibold">Verification</div>
                    <div>AI Verified</div>
                  </div>
                </div>
              )}              <DialogFooter>
                <Button onClick={() => setDialogOpen(false)} className="w-full">Close</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};
