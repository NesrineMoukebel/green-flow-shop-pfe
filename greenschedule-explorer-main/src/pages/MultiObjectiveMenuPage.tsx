import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BarChart3, Settings, TrendingUp } from "lucide-react";

const MultiObjectiveMenuPage = () => {
  const navigate = useNavigate();

  const analysisOptions = [
    {
      title: "Problem Data",
      description: "Benchmark, energy considerations, parameters and datasets",
      icon: Settings,
      route: "/multi-objective/data"
    },
    {
      title: "Solution Representation",
      description: "Visualize a schedule's Gantt chart and its data representation",
      icon: BarChart3,
      route: "/multi-objective/solution-representation"
    },
    {
      title: "Metaheuristics Components",
      description: "Constructives, M-VND, TEC reducer, HMOSA & HNSGA-II tests",
      icon: TrendingUp,
      route: "/multi-objective/meta"
    },
    {
      title: "ILP Model Tests",
      description: "Compare ILP model results vs proposed algorithms and literature",
      icon: BarChart3,
      route: "/multi-objective/ilp"
    },
    {
      title: "MORL",
      description: "Multi-objective reinforcement learning comparisons and results",
      icon: BarChart3,
      route: "/multi-objective/morl"
    },
    {
      title: "Hybrid MHs Comparison",
      description: "Compare hybrid metaheuristics in terms of performance metrics",
      icon: BarChart3,
      route: "/multi-objective/comparison"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-secondary flex items-center justify-center p-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="hover:bg-muted mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground max-w-4xl mx-auto leading-tight">
              Multi-objective optimization for the non-permutation flow shop scheduling problem
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose an analysis type to explore different aspects of the optimization problem
            </p>
          </div>
        </div>

        {/* Analysis Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {analysisOptions.map((option, index) => (
            <Card 
              key={index}
              className="group cursor-pointer hover:shadow-elevated transition-all duration-300 transform hover:scale-105"
            >
              <CardContent className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <option.icon className="w-10 h-10 text-white" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-card-foreground">
                    {option.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {option.description}
                  </p>
                </div>
                <Button 
                  variant="hero" 
                  size="lg"
                  className="w-full"
                  onClick={() => navigate(option.route)}
                >
                  Explore
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MultiObjectiveMenuPage;