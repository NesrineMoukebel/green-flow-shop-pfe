import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart3, Settings, TrendingUp, Database, Layout, Puzzle, LineChart, Brain, GitCompare} from "lucide-react";
import MultiObjectiveSidebar from "@/components/MultiObjectiveSidebar";


const MultiObjectiveMenuPage = () => {
  const navigate = useNavigate();

  const analysisOptions = [
    {
      title: "Problem Data",
      description: "Benchmark, energy considerations, parameters and datasets",
      icon: Database, // database icon fits benchmark & datasets
      route: "/multi-objective/data"
    },
    {
      title: "Solution Representation",
      description: "Visualize a schedule's Gantt chart and its data representation",
      icon: Layout, // layout/grid icon for visualization
      route: "/multi-objective/solution-representation"
    },
    {
      title: "Metaheuristics Components",
      description: "Constructive heuristics, M-VND, TEC reducer, HMOSA & HNSGA-II tests",
      icon: Puzzle, // puzzle piece for algorithm components
      route: "/multi-objective/meta"
    },
    {
      title: "ILP Model Tests",
      description: "Compare proposed algorithms vs ILP model results and literature",
      icon: LineChart, // chart for results comparison
      route: "/multi-objective/ilp"
    },
    {
      title: "MORL",
      description: "Multi-objective reinforcement learning comparisons and results",
      icon: Brain, // brain icon for RL/learning
      route: "/multi-objective/morl"
    },
    {
      title: "Hybrid MHs Comparison",
      description: "Compare hybrid metaheuristics in terms of performance metrics",
      icon: GitCompare, // compare icon for algorithm comparisons
      route: "/multi-objective/comparison"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      
      {/* Sidebar */}
      <MultiObjectiveSidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
          
            </div>
          </div>
        </div>

        {/* Analysis Options */}
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Multi-Objective Analysis Dashboard</h1>
                <p className="text-gray-600 mt-1">Choose an analysis type to explore different aspects of the optimization problem</p>                
              </div>
          
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              
            {analysisOptions.map((option, index) => (
  <Card
    key={index}
    className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden shadow-lg min-h-[370px]" // 👈 adjust height here
  >
    <CardContent className="p-8 flex flex-col h-full">
      {/* Icon */}
      <div
        className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg ${
          index === 0
            ? "bg-gradient-to-br from-purple-500 to-purple-600"
            : index === 1
            ? "bg-gradient-to-br from-purple-500 to-purple-600"
            : index === 2
            ? "bg-gradient-to-br from-purple-500 to-purple-600"
            : index === 3
            ? "bg-gradient-to-br from-purple-500 to-purple-600"
            : "bg-gradient-to-br from-purple-500 to-purple-600"
        }`}
      >
        <option.icon className="w-10 h-10 text-white" />
      </div>

      {/* Title + Description */}
      <div className="text-center space-y-3 mt-6 flex-1">
        <h3 className="text-xl font-semibold text-gray-900">
          {option.title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          {option.description}
        </p>
      </div>

      {/* Button always aligned bottom */}
      <Button
        className={`w-full text-white rounded-xl font-semibold py-3 transition-all duration-300 mt-auto ${
          index === 0
            ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            : index === 1
            ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            : index === 2
            ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            : index === 3
            ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
        }`}
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
      </div>
    </div>
  );
};

export default MultiObjectiveMenuPage;
