import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const MetaheuristicsComponentsMenuPage = () => {
  const navigate = useNavigate();

  const options = [
    { title: "Constructive Heuristics", description: "Random, NEH, WNEH, NFS comparisons", route: "/multi-objective/constructive-heuristics" },
    { title: "M-VND Comparison", description: "M-VND vs baselines across MHs", route: "/multi-objective/mvnd" },
    { title: "TEC Reduction Operator", description: "Reducer behavior and shift strategies", route: "/multi-objective/tec-reduction" },
    { title: "HMOSA Components Tests", description: "Restart and weights analyses", route: "/multi-objective/sa-tests" },
    { title: "HNSGA-II Components Tests", description: "Crossover types and NFS ratio tests", route: "/multi-objective/hnsga-components" },
  ];

  return (
    <div className="min-h-screen bg-gradient-secondary flex items-center justify-center p-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="space-y-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/multi-objective")} className="hover:bg-muted mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground max-w-4xl mx-auto leading-tight">
              Metaheuristics Components
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore building blocks and ablations of the hybrid algorithms
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {options.map((o, i) => (
            <Card key={i} className="group cursor-pointer hover:shadow-elevated transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-8 text-center space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-card-foreground">{o.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{o.description}</p>
                </div>
                <Button variant="hero" size="lg" className="w-full" onClick={() => navigate(o.route)}>
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

export default MetaheuristicsComponentsMenuPage;


