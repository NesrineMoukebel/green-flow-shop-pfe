import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Factory, BarChart3 } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-secondary flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        {/* Hero Title */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            Green Flow Shop
          </h1>
          <h2 className="text-4xl md:text-5xl font-light text-muted-foreground">
            Scheduling Problem
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Optimize manufacturing schedules with environmental considerations using advanced algorithms
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-8 mt-16">
          {/* Single-objective Card */}
          <Card className="group cursor-pointer hover:shadow-elevated transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <Factory className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-card-foreground">
                  Single-objective Flow Shop
                </h3>
                <p className="text-muted-foreground">
                  Optimize for a single objective such as makespan or energy consumption
                </p>
              </div>
              <Button 
                variant="outline" 
                size="lg"
                className="w-full"
                onClick={() => navigate("/single-objective")}
              >
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Multi-objective Card */}
          <Card className="group cursor-pointer hover:shadow-elevated transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-card-foreground">
                  Multi-objective Flow Shop
                </h3>
                <p className="text-muted-foreground">
                  Balance multiple objectives including makespan, energy, and sustainability
                </p>
              </div>
              <Button 
                variant="hero" 
                size="lg"
                className="w-full"
                onClick={() => navigate("/multi-objective")}
              >
                Explore Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;