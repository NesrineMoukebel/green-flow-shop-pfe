import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MultiObjectiveSidebar = () => {
  const navigate = useNavigate();

  const analysisOptions = [
    {
      title: "Problem Data",
      description: "Description of the scheduling instances (jobs, machines, energy profiles)"
    },
    {
      title: "Solution Representation",
      description: "Visualize a schedule's Gantt chart and its data representations"
    },
    {
      title: "Metaheuristics Components",
      description: "Constructive heuristics, M-VND, TEC reducer, and HMOSA & HNSGA-II tests"
    },
    {
      title: "ILP Model Tests",
      description: "Compare proposed algorithms against ILP model results and literature"
    },
    {
      title: "MORL",
      description: "Multi-objective reinforcement learning comparisons and results"
    },
    {
      title: "Hybrid MHs Comparison",
      description: "Compare hybrid metaheuristics performance metrics and Pareto front analysis"
    }
  ];

  return (
    <div className="w-80 h-screen bg-card border-r border-border p-6 overflow-y-auto sticky top-0">
      {/* Logo Section */}
      <img 
              src="/DATA/images/LOGO.png" 
              alt="Bi-Optima Logo" 
              className=" px-auto h-20 w-auto hover:scale-105 transition-transform duration-200" 
            />
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            
            
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p className="mb-3">
              This section provides comprehensive analysis tools for multi-objective optimization 
              of the non-permutation flow shop scheduling problem.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Options - Styled exactly like Algorithms section */}
      <Card className="mt-6 shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Analysis Modules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {analysisOptions.map((option, index) => (
            <div 
              key={index}
              className="p-3 bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors duration-200"
              onClick={() => navigate(getRouteFromTitle(option.title))}
            >
              <div className="font-medium text-accent">{option.title}</div>
              <div className="text-muted-foreground">{option.description}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to get route from title
const getRouteFromTitle = (title: string): string => {
  const routeMap: { [key: string]: string } = {
    "Problem Data": "/multi-objective/data",
    "Constructive Heuristics": "/multi-objective/constructive-heuristics",
    "Solution Representation": "/multi-objective/solution-representation",
    "Metaheuristics Components": "/multi-objective/meta",
    "ILP Model Tests": "/multi-objective/ilp",
    "MORL": "/multi-objective/morl",
    "Hybrid MHs Comparison": "/multi-objective/comparison"
  };
  return routeMap[title] || "#";
};

export default MultiObjectiveSidebar;
