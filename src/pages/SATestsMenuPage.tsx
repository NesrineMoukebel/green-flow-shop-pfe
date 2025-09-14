import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const SATestsMenuPage = () => {
  const navigate = useNavigate();
  const options = [
    { title: "Restore Mechanism", description: "Compare HMOSA vs HMOSA- with Pareto and metrics", route: "/multi-objective/sa-tests/restart" },
    { title: "Dynamic vs. Fixed weights", description: "Dynamic weights graph and comparisons", route: "/multi-objective/sa-tests/weights" },
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
              Simulated Annealing Tests
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore restart mechanism and weight strategies
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {options.map((o, i) => (
            <Card key={i} className="group cursor-pointer border-purple-300/40 hover:border-purple-400 hover:shadow-[0_8px_30px_rgb(127,90,240,0.25)] transition-all duration-300 transform hover:scale-[1.02]">
              <CardContent className="p-8 text-center space-y-6 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-300">{o.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{o.description}</p>
                </div>
                <Button variant="default" size="lg" className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={() => navigate(o.route)}>
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

export default SATestsMenuPage;

