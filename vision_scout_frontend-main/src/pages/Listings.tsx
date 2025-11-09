import { useState, useEffect, useMemo } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import demoCarImg from "@/assets/IMG_6728.jpg";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Car,
  MapPin,
  Gauge,
  Bed,
  Bath,
  Search,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type ListingType = "property" | "car";

type PropertyListing = {
  id: string | number;
  title: string;
  location: string;
  price: string;
  bedrooms: number | string;
  bathrooms: number | string;
  sqft: string;
  image: string;
  condition: number;
};

type CarListing = {
  id: string | number;
  title: string;
  details: string;
  price: string;
  mileage: string;
  year: string;
  image: string;
  condition: number;
  color?: string;
  make?: string;
  bodyType?: string;
};

const ITEMS_PER_PAGE = 9;
const FETCH_DEBOUNCE_MS = 500;

const Listings = () => {
  const [activeType, setActiveType] = useState<ListingType>("property");
  const [propertyListings, setPropertyListings] = useState<PropertyListing[]>(
    []
  );
  const [carListings, setCarListings] = useState<CarListing[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ---- Property Filters ----
  const [filters, setFilters] = useState({
    city: "Richardson",
    propertyType: "Apartment,Single Family,Condo",
    bedrooms: "",
    bathrooms: "",
    sqftMin: "",
    sqftMax: "",
  });

  // ---- Car Filters ----
  const [carFilters, setCarFilters] = useState({
    color: "",
    bodyType: "",
    make: "",
  });

  // Fetch properties + cars
  useEffect(() => {
    let cancel = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        // --------- RentCast (Properties) ----------
        const RENTCAST_API_KEY = import.meta.env.VITE_RENT_CAST_API_KEY;
        const { city, propertyType, bedrooms, bathrooms, sqftMin, sqftMax } =
          filters;

        let rentcastURL = `https://api.rentcast.io/v1/listings/sale?city=${encodeURIComponent(
          city
        )}&state=TX&status=Active&limit=24&propertyType=${encodeURIComponent(
          propertyType
        )}`;

        if (bedrooms)
          rentcastURL += `&minBedrooms=${encodeURIComponent(bedrooms)}`;
        if (bathrooms)
          rentcastURL += `&minBathrooms=${encodeURIComponent(bathrooms)}`;
        if (sqftMin)
          rentcastURL += `&minSquareFootage=${encodeURIComponent(sqftMin)}`;
        if (sqftMax)
          rentcastURL += `&maxSquareFootage=${encodeURIComponent(sqftMax)}`;

        const rentRes = await fetch(rentcastURL, {
          headers: {
            Accept: "application/json",
            "X-Api-Key": RENTCAST_API_KEY,
          },
        });

        let rentData: any[] = [];
        if (rentRes.ok) rentData = await rentRes.json();

        const propertyImages = [
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop",
        ];

        const transformedProperties: PropertyListing[] = rentData.map(
          (p: any, i: number) => ({
            id: p.id || `${i}-${p.addressLine1 || "addr"}`,
            title: p.propertyType
              ? `${p.propertyType}${
                  p.addressLine1
                    ? " on " + p.addressLine1.split(" ")[0] + " St"
                    : ""
                }`
              : `Property in ${p.city}`,
            location: `${p.city || filters.city}, ${p.state || "TX"}`,
            price: p.price ? `$${Number(p.price).toLocaleString()}` : "N/A",
            bedrooms: p.bedrooms ?? "—",
            bathrooms: p.bathrooms ?? "—",
            sqft: p.squareFootage
              ? `${Number(p.squareFootage).toLocaleString()} sq ft`
              : "N/A",
            image: propertyImages[i % propertyImages.length],
            condition: Math.floor(Math.random() * 26) + 70,
          })
        );

        if (!cancel) setPropertyListings(transformedProperties);

        // --------- MarketCheck (Cars) ----------
        const MARKETCHECK_API_KEY = import.meta.env.VITE_MARKETCHECK_API_KEY;

        // Build dynamic query safely
        const url = new URL("https://api.marketcheck.com/v2/search/car/active");
        url.searchParams.set("api_key", MARKETCHECK_API_KEY);
        url.searchParams.set("rows", "24");
        url.searchParams.set("zip", "75080");
        url.searchParams.set("radius", "50");
        url.searchParams.set("car_type", "used");

        const { color, bodyType, make } = carFilters;

        // Apply filters only if selected
        if (make) url.searchParams.set("make", make);
        if (bodyType) url.searchParams.set("body_type", bodyType);
        if (color) url.searchParams.set("exterior_color", color);

        console.log("🚗 MarketCheck query:", url.toString());

        const carRes = await fetch(url.toString(), {
          headers: { Accept: "application/json" },
        });
        let carData: any[] = [];
        if (carRes.ok) {
          const json = await carRes.json();
          carData = json.listings || [];
        }

        const carImages = [
          "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&h=400&fit=crop",
        ];

        const transformedCars: CarListing[] = carData.map((c, i) => {
          const make = c.build?.make || c.make || "Unknown";
          const model = c.build?.model || c.model || "Model";
          const year = c.build?.year || c.year || "N/A";
          const trim = c.build?.trim || c.trim || "";
          const price = c.price ? `$${Number(c.price).toLocaleString()}` : "";
          const miles = c.miles
            ? `${Number(c.miles).toLocaleString()} miles`
            : "N/A";
          const bodyType = c.build?.body_type || c.body_type || "";
          const transmission = c.build?.transmission || c.transmission || "";
          const color = c.exterior_color || c.color || "";
          const image =
            c.media?.photo_links?.[0] || carImages[i % carImages.length];

          return {
            id: c.id || `car-${i}`,
            title: `${year} ${make} ${model}`,
            details: `${bodyType}${transmission ? " • " + transmission : ""}${
              trim ? " • " + trim : ""
            }`,
            price,
            mileage: miles,
            year: String(year),
            image,
            condition: Math.floor(Math.random() * 26) + 70,
            color,
            make,
            bodyType,
          };
        });

        // ➕ Add demo car
        const demoCar: CarListing = {
          id: "demo-volkswagen-2014",
          title: "2014 Volkswagen SUV",
          details: "SUV • Automatic • Comfortline Trim",
          price: "",
          mileage: "124,000 miles",
          year: "2014",
          image: demoCarImg,
          condition: 82,
          color: "Black",
          make: "Volkswagen",
          bodyType: "SUV",
        };

        transformedCars.unshift(demoCar);

        if (!cancel) setCarListings(transformedCars);
      } catch (err) {
        console.error("Error fetching listings:", err);
      } finally {
        if (!cancel) setLoading(false);
      }
    }, FETCH_DEBOUNCE_MS);

    return () => {
      cancel = true;
      clearTimeout(timer);
    };
  }, [filters, carFilters]); // dependencies

  const currentListings =
    activeType === "property" ? propertyListings : carListings;

  const filteredListings = useMemo(() => {
    if (!query.trim()) return currentListings;
    const q = query.toLowerCase();
    return currentListings.filter((listing: any) => {
      if (
        String(listing.title || "")
          .toLowerCase()
          .includes(q)
      )
        return true;
      if (
        String(listing.price || "")
          .toLowerCase()
          .includes(q)
      )
        return true;

      if (activeType === "property") {
        return (
          String((listing as PropertyListing).location || "")
            .toLowerCase()
            .includes(q) ||
          String((listing as PropertyListing).sqft || "")
            .toLowerCase()
            .includes(q)
        );
      } else {
        return (
          String((listing as CarListing).details || "")
            .toLowerCase()
            .includes(q) ||
          String((listing as CarListing).year || "")
            .toLowerCase()
            .includes(q) ||
          String((listing as CarListing).mileage || "")
            .toLowerCase()
            .includes(q)
        );
      }
    });
  }, [currentListings, query, activeType]);

  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedListings = filteredListings.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeType, filters, carFilters]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold mb-4">
              Browse{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Listings
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore our curated collection of properties and vehicles
            </p>
          </div>

          {/* Toggle */}
          <div className="flex justify-center mb-8">
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

          {/* Property Filters */}
          {activeType === "property" && (
            <div className="max-w-5xl mx-auto mb-8">
              <div className="grid md:grid-cols-6 gap-3">
                <select
                  value={filters.propertyType}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, propertyType: e.target.value }))
                  }
                  className="p-2 border rounded-md bg-background text-sm"
                >
                  <option value="Apartment,Single Family,Condo">
                    All (Apt, SF, Condo)
                  </option>
                  <option value="Apartment">Apartment</option>
                  <option value="Single Family">Single Family</option>
                  <option value="Multi-Family">Multi Family</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Condo">Condo</option>
                  <option value="Manufactured">Manufactured</option>
                </select>

                <select
                  value={filters.bedrooms}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, bedrooms: e.target.value }))
                  }
                  className="p-2 border rounded-md bg-background text-sm"
                >
                  <option value="">Bedrooms</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}+
                    </option>
                  ))}
                </select>

                <select
                  value={filters.bathrooms}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, bathrooms: e.target.value }))
                  }
                  className="p-2 border rounded-md bg-background text-sm"
                >
                  <option value="">Bathrooms</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}+
                    </option>
                  ))}
                </select>

                <Input
                  type="number"
                  placeholder="Min SqFt"
                  value={filters.sqftMin}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, sqftMin: e.target.value }))
                  }
                  className="text-sm"
                />

                <Input
                  type="number"
                  placeholder="Max SqFt"
                  value={filters.sqftMax}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, sqftMax: e.target.value }))
                  }
                  className="text-sm"
                />

                <Input
                  type="text"
                  placeholder="City"
                  value={filters.city}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, city: e.target.value }))
                  }
                  className="text-sm"
                />
              </div>
            </div>
          )}

          {/* Car Filters */}
          {activeType === "car" && (
            <div className="max-w-5xl mx-auto mb-8">
              <div className="grid md:grid-cols-3 gap-3">
                {/* Color */}
                <select
                  value={carFilters.color}
                  onChange={(e) =>
                    setCarFilters((f) => ({ ...f, color: e.target.value }))
                  }
                  className="p-2 border rounded-md bg-background text-sm"
                >
                  <option value="">All Colors</option>
                  <option value="Black">Black</option>
                  <option value="White">White</option>
                  <option value="Blue">Blue</option>
                  <option value="Gray">Gray</option>
                  <option value="Red">Red</option>
                  <option value="Silver">Silver</option>
                </select>

                {/* Body Type */}
                <select
                  value={carFilters.bodyType}
                  onChange={(e) =>
                    setCarFilters((f) => ({ ...f, bodyType: e.target.value }))
                  }
                  className="p-2 border rounded-md bg-background text-sm"
                >
                  <option value="">All Body Types</option>
                  <option value="SUV">SUV</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Truck">Truck</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Convertible">Convertible</option>
                </select>

                {/* Make */}
                <select
                  value={carFilters.make}
                  onChange={(e) =>
                    setCarFilters((f) => ({ ...f, make: e.target.value }))
                  }
                  className="p-2 border rounded-md bg-background text-sm"
                >
                  <option value="">All Makes</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Honda">Honda</option>
                  <option value="Ford">Ford</option>
                  <option value="Tesla">Tesla</option>
                  <option value="BMW">BMW</option>
                </select>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center gap-2 p-1 bg-muted rounded-lg shadow-sm">
              <div className="px-3 text-muted-foreground">
                <Search className="h-5 w-5" />
              </div>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  activeType === "property"
                    ? "Search properties by title, location, price…"
                    : "Search cars by model, details, year…"
                }
                className="bg-transparent border-0 shadow-none"
              />
              {query ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">
                Loading {activeType === "property" ? "properties" : "cars"}...
              </span>
            </div>
          ) : (
            <>
              {/* Listings Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedListings.map((listing: any) => (
                  <Card
                    key={listing.id}
                    className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary"
                  >
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
                        {activeType === "property"
                          ? listing.location
                          : listing.details}
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
                            {listing.bedrooms} bed
                          </div>
                          <div className="flex items-center gap-1">
                            <Bath className="h-4 w-4" />
                            {listing.bathrooms} bath
                          </div>
                          <div className="flex items-center gap-1">
                            <Home className="h-4 w-4" />
                            {listing.sqft}
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Gauge className="h-4 w-4" />
                            {listing.mileage}
                          </div>
                          <div className="flex items-center gap-1">
                            <Car className="h-4 w-4" />
                            {listing.year}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => handlePageChange(page)}
                          className="w-10 h-10"
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Details Dialog */}
              <Dialog
                open={dialogOpen}
                onOpenChange={(o) => {
                  setDialogOpen(o);
                  if (!o) setSelectedListing(null);
                }}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{selectedListing?.title}</DialogTitle>
                    <DialogDescription>
                      {activeType === "property"
                        ? selectedListing?.location
                        : selectedListing?.details}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4">
                    <div className="h-56 w-full overflow-hidden rounded-md">
                      {selectedListing?.image?.startsWith("http") ? (
                        <img
                          src={selectedListing.image}
                          alt={selectedListing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-8xl">
                          {activeType === "property" ? "🏠" : "🚗"}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary">
                        {selectedListing?.price}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ID: {selectedListing?.id}
                      </div>
                    </div>

                    <div className="grid gap-2 text-sm text-muted-foreground">
                      <div className="font-semibold">Condition Score</div>
                      <div className="flex justify-between">
                        <span>{selectedListing?.condition ?? 85}/100</span>
                        <span className="text-primary font-medium">
                          {(selectedListing?.condition ?? 85) >= 90
                            ? "Excellent"
                            : (selectedListing?.condition ?? 85) >= 80
                            ? "Very Good"
                            : "Good"}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-primary"
                          style={{
                            width: `${selectedListing?.condition ?? 85}%`,
                          }}
                        />
                      </div>
                    </div>

                    {activeType === "property" ? (
                      <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground border-t pt-4">
                        <div>
                          <div className="font-semibold">Bedrooms</div>
                          <div>{selectedListing?.bedrooms ?? "—"}</div>
                        </div>
                        <div>
                          <div className="font-semibold">Bathrooms</div>
                          <div>{selectedListing?.bathrooms ?? "—"}</div>
                        </div>
                        <div>
                          <div className="font-semibold">Area</div>
                          <div>{selectedListing?.sqft ?? "—"}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground border-t pt-4">
                        <div>
                          <div className="font-semibold">Year</div>
                          <div>{selectedListing?.year ?? "—"}</div>
                        </div>
                        <div>
                          <div className="font-semibold">Mileage</div>
                          <div>{selectedListing?.mileage ?? "—"}</div>
                        </div>
                        <div>
                          <div className="font-semibold">Make</div>
                          <div>{selectedListing?.make ?? "—"}</div>
                        </div>
                        <div>
                          <div className="font-semibold">Color</div>
                          <div>{selectedListing?.color ?? "—"}</div>
                        </div>
                        <div className="col-span-2">
                          <div className="font-semibold">Details</div>
                          <div>{selectedListing?.details ?? "—"}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button
                      onClick={() => setDialogOpen(false)}
                      className="w-full"
                    >
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Listings;
