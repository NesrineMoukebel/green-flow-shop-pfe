import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const MetaheuristicsComponentsMenuPage = () => {
  const navigate = useNavigate();

  const options = [
    { title: "Constructive Heuristics", description: "Random, NEH, WNEH, NFS comparisons", route: "/multi-objective/constructive-heuristics" },
    { title: "M-VND Comparison", description: "M-VND analysis across MHs", route: "/multi-objective/mvnd" },
    { title: "TEC Reduction Operator", description: "Reducer behavior and shift strategies", route: "/multi-objective/tec-reduction" },
    { title: "HMOSA Components Tests", description: "Restart and weights analyses", route: "/multi-objective/sa-tests" },
    { title: "HNSGA-II Components Tests", description: "Crossover types and NFS ratio tests", route: "/multi-objective/hnsga-components" },
    { title: "HMOGVNS Tests", description: "Shaking procedures analysis and performance", route: "/multi-objective/hmogvns-tests" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      
      {/* Sidebar - Matching MultiObjectiveSidebar style */}
      <div className="w-80 h-screen bg-card border-r border-border p-6 overflow-y-auto sticky top-0">
        {/* Logo Section */}
        <img 
          src="./DATA/images/LOGO.png" 
          alt="Bi-Optima Logo" 
          className="px-auto h-20 w-auto hover:scale-105 transition-transform duration-200 cursor-pointer mb-6" 
          onClick={() => navigate("/")}
        />
        
        
        <Card className="shadow-card">
          <CardHeader className="pb-  4">
            <CardTitle className="text-lg">Metaheuristics components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground leading-relaxed">
              <p className="mb-3">
                Building blocks of the hybrid algorithms. 
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Categories - Styled exactly like Algorithms section */}
        <Card className="mt-6 shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Key information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium text-accent">Constructive Heuristics</div>
              <div className="text-muted-foreground">Constructive heuristics are used to generate initial solutions</div>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium text-accent">M-VND</div>
              <div className="text-muted-foreground">M-VND is used as a local search strategy</div>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium text-accent">TEC Reduction Operator</div>
              <div className="text-muted-foreground">TEC Reduction Operator is used to reduce the TEC of a solution based on its makespan</div>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium text-accent">HMOSA tests</div>
              <div className="text-muted-foreground">Testing components of HMOSA: Restart mechanism and weights adjustment</div>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium text-accent">HNSGA-II components tests</div>
              <div className="text-muted-foreground">Testing components of HNSGA-II: Crossover types and NFS ratio</div>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium text-accent">HMOGVNS tests</div>
              <div className="text-muted-foreground">Testing shaking procedures in HMOGVNS: Hamming distance and performance analysis</div>
            </div>
                       
          </CardContent>
        </Card>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-12 px-6 py-12">
            <div className="space-y-6">
              <Button variant="ghost" size="sm" onClick={() => navigate("/multi-objective")} className="hover:bg-muted mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Menu
              </Button>
              <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-3xl font-bold text-foreground max-w-4xl mx-auto leading-tight">
                  Metaheuristics Components
                </h1>
                <p className="text-l text-muted-foreground max-w-2xl mx-auto">
                  Explore building blocks of the hybrid algorithms
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {options.map((o, i) => (
                <Card
                key={i}
                className="group cursor-pointer hover:shadow-elevated transition-all duration-300 transform hover:scale-105"
              >
                <CardContent className="p-8 flex flex-col h-full">
                  {/* Text wrapper */}
                  <div className="flex-1 flex flex-col justify-center items-center space-y-3 text-center">
                    <h3 className="text-xl font-semibold text-card-foreground">{o.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{o.description}</p>
                  </div>
              
                  {/* Button at the bottom */}
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full mt-4"
                    onClick={() => navigate(o.route)}
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
  );
};

export default MetaheuristicsComponentsMenuPage;


