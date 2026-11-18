import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Lightbulb, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">
              About <span className="bg-gradient-primary bg-clip-text text-transparent">VisionScout</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're revolutionizing how people discover and decide on properties and cars through the power of AI
            </p>
          </div>

          {/* Mission Statement */}
          <Card className="mb-12 border-2">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-bold mb-4 text-center">Our Mission</h2>
              <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto leading-relaxed">
                At VisionScout, we believe that finding the perfect property or car shouldn't be overwhelming. 
                Our AI-powered platform simplifies the search process by understanding your unique preferences 
                and matching you with options that truly fit your needs and lifestyle.
              </p>
            </CardContent>
          </Card>

          {/* Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 hover:border-primary transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                    <Target className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Precision</h3>
                  <p className="text-muted-foreground">
                    We use advanced AI algorithms to ensure every recommendation is tailored precisely to your requirements, 
                    saving you time and helping you make confident decisions.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="w-14 h-14 bg-gradient-accent rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-7 h-7 text-accent-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">User-Centric</h3>
                  <p className="text-muted-foreground">
                    Your needs drive everything we do. We've designed our platform to be intuitive, accessible, 
                    and focused on delivering value at every step of your journey.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                    <Lightbulb className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Innovation</h3>
                  <p className="text-muted-foreground">
                    We continuously evolve our AI technology to stay ahead of the curve, bringing you the latest 
                    innovations in property and automotive discovery.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="w-14 h-14 bg-gradient-accent rounded-xl flex items-center justify-center mb-4">
                    <Award className="w-7 h-7 text-accent-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Excellence</h3>
                  <p className="text-muted-foreground">
                    We're committed to maintaining the highest standards in data accuracy, AI performance, 
                    and customer service to ensure your experience exceeds expectations.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Story */}
          <Card className="bg-gradient-hero text-primary-foreground">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
              <div className="space-y-4 text-lg max-w-3xl mx-auto opacity-95">
                <p>
                  VisionScout was born from a simple observation: finding the right property or car 
                  involves countless hours of research, comparison, and uncertainty. We knew there had to be a better way.
                </p>
                <p>
                  By combining cutting-edge artificial intelligence with deep market knowledge, we created 
                  a platform that understands not just what you say you want, but what will truly make you happy. 
                  Our AI considers factors you might not even think of, from neighborhood trends to vehicle reliability scores.
                </p>
                <p>
                  Today, we're proud to help thousands of people make confident, informed decisions about 
                  some of life's biggest purchases. And we're just getting started.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-muted-foreground">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50,000+</div>
              <div className="text-muted-foreground">Listings Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
