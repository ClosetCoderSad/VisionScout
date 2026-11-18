import { useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Car, MapPin, Gauge, Bed, Bath, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type ListingType = "property" | "car";

const Listings = () => {
  const [activeType, setActiveType] = useState<ListingType>("property");
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const propertyListings = [
    {
      id: 1,
      title: "Modern Downtown Condo",
      location: "San Francisco, CA",
      price: "$850,000",
      bedrooms: 2,
      bathrooms: 2,
      sqft: "1,200 sq ft",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop",
    },
    {
      id: 2,
      title: "Suburban Family Home",
      location: "Austin, TX",
      price: "$625,000",
      bedrooms: 4,
      bathrooms: 3,
      sqft: "2,500 sq ft",
      image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop",
    },
    {
      id: 3,
      title: "Luxury Waterfront Villa",
      location: "Miami, FL",
      price: "$2,400,000",
      bedrooms: 5,
      bathrooms: 4,
      sqft: "4,200 sq ft",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop",
    },
    {
      id: 4,
      title: "Cozy Studio Apartment",
      location: "New York, NY",
      price: "$425,000",
      bedrooms: 1,
      bathrooms: 1,
      sqft: "650 sq ft",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop",
    },
    {
      id: 5,
      title: "Mountain View Estate",
      location: "Denver, CO",
      price: "$1,200,000",
      bedrooms: 4,
      bathrooms: 3,
      sqft: "3,500 sq ft",
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop",
    },
    {
      id: 6,
      title: "Beach House Paradise",
      location: "San Diego, CA",
      price: "$1,800,000",
      bedrooms: 3,
      bathrooms: 3,
      sqft: "2,800 sq ft",
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop",
    },
  ];

  const carListings = [
    {
      id: 1,
      title: "2024 Tesla Model S",
      details: "Electric • Autopilot",
      price: "$89,990",
      mileage: "5,000 miles",
      year: "2024",
      image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&h=400&fit=crop",
    },
    {
      id: 2,
      title: "2023 BMW X5",
      details: "SUV • Premium Package",
      price: "$67,500",
      mileage: "12,000 miles",
      year: "2023",
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=400&fit=crop",
    },
    {
      id: 3,
      title: "2024 Porsche 911",
      details: "Sports Car • Turbo",
      price: "$145,000",
      mileage: "2,500 miles",
      year: "2024",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop",
    },
    {
      id: 4,
      title: "2023 Honda Accord",
      details: "Sedan • Hybrid",
      price: "$32,900",
      mileage: "18,000 miles",
      year: "2023",
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop",
    },
    {
      id: 5,
      title: "2024 Range Rover Sport",
      details: "Luxury SUV • Off-road",
      price: "$98,500",
      mileage: "8,000 miles",
      year: "2024",
      image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&h=400&fit=crop",
    },
    {
      id: 6,
      title: "2023 Toyota RAV4",
      details: "SUV • Adventure Package",
      price: "$35,800",
      mileage: "22,000 miles",
      year: "2023",
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&h=400&fit=crop",
    },
  ];

  const currentListings = activeType === "property" ? propertyListings : carListings;

  const [query, setQuery] = useState("");

  const filteredListings = useMemo(() => {
    if (!query.trim()) return currentListings;
    const q = query.trim().toLowerCase();
    return currentListings.filter((listing: any) => {
      // common fields
      if (listing.title?.toLowerCase().includes(q)) return true;
      if (listing.price?.toLowerCase().includes(q)) return true;

      // property specific
      if (activeType === "property") {
        if (listing.location?.toLowerCase().includes(q)) return true;
        if (listing.sqft?.toLowerCase().includes(q)) return true;
      }

      // car specific
      if (activeType === "car") {
        if (listing.details?.toLowerCase().includes(q)) return true;
        if (String(listing.year)?.toLowerCase().includes(q)) return true;
        if (listing.mileage?.toLowerCase().includes(q)) return true;
      }

      return false;
    });
  }, [currentListings, query, activeType]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              Browse <span className="bg-gradient-primary bg-clip-text text-transparent">Listings</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore our curated collection of properties and vehicles
            </p>
          </div>

          {/* Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-xl bg-muted p-1 shadow-sm">
              <Button
                variant={activeType === "property" ? "default" : "ghost"}
                onClick={() => setActiveType("property")}
                className="rounded-lg"
              >
                <Home className="mr-2 h-4 w-4" />
                Properties
              </Button>
              <Button
                variant={activeType === "car" ? "default" : "ghost"}
                onClick={() => setActiveType("car")}
                className="rounded-lg"
              >
                <Car className="mr-2 h-4 w-4" />
                Cars
              </Button>
            </div>
          </div>

          {/* Search + Listings Grid */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center gap-2 p-1 bg-muted rounded-lg shadow-sm">
              <div className="px-3 text-muted-foreground">
                <Search className="h-5 w-5" />
              </div>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={activeType === "property" ? "Search properties by title, location, price..." : "Search cars by model, details, year..."}
                className="bg-transparent border-0 shadow-none"
              />
              {query ? (
                <Button variant="ghost" size="icon" onClick={() => setQuery("") } aria-label="Clear search">
                  <X className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">
                    Featured
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{listing.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {activeType === "property" ? (listing as any).location : (listing as any).details}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-2xl font-bold text-primary mb-4">
                    {listing.price}
                  </div>
                  {activeType === "property" ? (
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        {(listing as any).bedrooms} bed
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        {(listing as any).bathrooms} bath
                      </div>
                      <div className="flex items-center gap-1">
                        <Home className="h-4 w-4" />
                        {(listing as any).sqft}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Gauge className="h-4 w-4" />
                        {(listing as any).mileage}
                      </div>
                      <div className="flex items-center gap-1">
                        <Car className="h-4 w-4" />
                        {(listing as any).year}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      setSelectedListing(listing);
                      setDialogOpen(true);
                    }}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {/* Details dialog */}
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setSelectedListing(null); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedListing?.title}</DialogTitle>
                <DialogDescription>
                  {activeType === "property" ? (selectedListing as any)?.location : (selectedListing as any)?.details}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                {/* Image section */}
                <div className="h-56 w-full overflow-hidden rounded-md">
                  {selectedListing?.image?.startsWith('http') ? (
                    <img src={selectedListing.image} alt={selectedListing.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-8xl">
                      {selectedListing?.image ?? '🏠'}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-primary">{selectedListing?.price}</div>
                  <div className="text-sm text-muted-foreground">ID: {selectedListing?.id}</div>
                </div>

                {/* Condition Score - synced from preview */}
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
                        <span>{selectedListing?.condition ?? 85}/100</span>
                        <span className="text-primary font-medium">
                          {(selectedListing?.condition ?? 85) >= 90 ? "Excellent" :
                           (selectedListing?.condition ?? 85) >= 80 ? "Very Good" :
                           (selectedListing?.condition ?? 85) >= 70 ? "Good" :
                           "Fair"}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-primary"
                          style={{ width: `${selectedListing?.condition ?? 85}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Type-specific details */}
                {activeType === "property" ? (
                  <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground border-t pt-4">
                    <div>
                      <div className="font-semibold">Bedrooms</div>
                      <div>{(selectedListing as any)?.bedrooms ?? "—"}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Bathrooms</div>
                      <div>{(selectedListing as any)?.bathrooms ?? "—"}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Area</div>
                      <div>{(selectedListing as any)?.sqft ?? "—"}</div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground border-t pt-4">
                    <div>
                      <div className="font-semibold">Year</div>
                      <div>{(selectedListing as any)?.year ?? "—"}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Mileage</div>
                      <div>{(selectedListing as any)?.mileage ?? "—"}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Details</div>
                      <div className="col-span-2">{(selectedListing as any)?.details ?? "—"}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Colour</div>
                      <div>{(selectedListing as any)?.color ?? "—"}</div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <div className="w-full">
                  <Button onClick={() => setDialogOpen(false)} className="w-full">Close</Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Listings;
