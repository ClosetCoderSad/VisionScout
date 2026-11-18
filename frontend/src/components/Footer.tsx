import { Link } from "react-router-dom";
import { Search, Mail, Github, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle waitlist signup
    console.log("Waitlist signup:", email);
    setEmail("");
  };

  return (
    <footer className="relative bg-muted border-t border-border mt-20">
      {/* Gradient divider line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                VisionScout
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-4">
              AI-powered property and car discovery platform
            </p>
            
            {/* Social media icons */}
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group"
              >
                <Github className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group"
              >
                <Twitter className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group"
              >
                <Linkedin className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Home
              </Link>
              <Link to="/listings" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Listings
              </Link>
              <Link to="/chat" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                AI Assistant
              </Link>
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                About
              </Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Services</h3>
            <div className="flex flex-col gap-2">
              <span className="text-muted-foreground text-sm">Property Search</span>
              <span className="text-muted-foreground text-sm">Car Discovery</span>
              <span className="text-muted-foreground text-sm">AI Recommendations</span>
              <span className="text-muted-foreground text-sm">Market Analysis</span>
            </div>
          </div>

          {/* Join Waitlist */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Join Waitlist</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Be the first to experience the future of verified listings
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-card border-border"
              />
              <Button type="submit" variant="hero" size="sm" className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 VisionScout. All rights reserved. • Made with ❤️ at HackUTD
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
