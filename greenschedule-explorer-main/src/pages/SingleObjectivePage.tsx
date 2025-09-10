import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Settings2, Factory, Cog } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SingleObjectivePage = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<string>("main");

  // Main page with two cards
  if (currentPage === "main") {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Single objective optimization in flow shop for TEC minimization under Time-of-use tariffs
                </h1>
                <p className="text-muted-foreground">Compare different flow shop approaches for TEC optimization</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Main Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Non-Permutation Flow Shop Card */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setCurrentPage("non-permutation")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="w-5 h-5 text-primary" />
                  Non-permutation flow shop
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Compare VNS and VNS-QL approaches for non-permutation flow shop scheduling
                </p>
              </CardContent>
            </Card>

            {/* Permutation Flow Shop Card */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setCurrentPage("permutation")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cog className="w-5 h-5 text-primary" />
                  Permutation flow shop
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Compare QL-GA and GA approaches for permutation flow shop scheduling
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Non-Permutation Flow Shop Page
  if (currentPage === "non-permutation") {
    return (
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <div className="w-80 h-screen bg-card border-r border-border p-6 overflow-y-auto sticky top-0">
          <Card className="shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings2 className="w-5 h-5 text-primary" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted rounded-md">
                <div className="font-medium text-accent">Non-Permutation Flow Shop</div>
                <div className="text-muted-foreground text-sm">
                  Jobs can be processed in different orders on different machines
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Algorithms Description */}
          <Card className="mt-6 shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Algorithms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-muted rounded-md">
                <div className="font-medium text-accent" style={{ color: "#3B82F6" }}>
                  VNS
                </div>
                <div className="text-muted-foreground">Variable Neighborhood Search</div>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <div className="font-medium text-accent" style={{ color: "#10B981" }}>
                  VNS-QL
                </div>
                <div className="text-muted-foreground">Variable Neighborhood Search with Q-Learning</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <div className="border-b border-border bg-card">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage("main")}
                  className="hover:bg-muted"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Main
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Non-Permutation Flow Shop</h1>
                  <p className="text-muted-foreground">VNS vs VNS-QL comparison for TEC minimization</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <NonPermutationTable />
          </div>
        </div>
      </div>
    );
  }

  // Permutation Flow Shop Page
  if (currentPage === "permutation") {
    return (
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <div className="w-80 h-screen bg-card border-r border-border p-6 overflow-y-auto sticky top-0">
          <Card className="shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings2 className="w-5 h-5 text-primary" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted rounded-md">
                <div className="font-medium text-accent">Permutation Flow Shop</div>
                <div className="text-muted-foreground text-sm">
                  Jobs must be processed in the same order on all machines
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Algorithms Description */}
          <Card className="mt-6 shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Algorithms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-muted rounded-md">
                <div className="font-medium text-accent" style={{ color: "#3B82F6" }}>
                  QL-GA
                </div>
                <div className="text-muted-foreground">Q-Learning with Genetic Algorithm</div>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <div className="font-medium text-accent" style={{ color: "#10B981" }}>
                  GA
                </div>
                <div className="text-muted-foreground">Genetic Algorithm</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <div className="border-b border-border bg-card">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage("main")}
                  className="hover:bg-muted"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Main
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Permutation Flow Shop</h1>
                  <p className="text-muted-foreground">QL-GA vs GA comparison for TEC minimization</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <PermutationTable />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Non-Permutation Table Component
const NonPermutationTable = () => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on component mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/DATA/Conf_papers/non_permu_conf.json');
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-muted-foreground">Loading data...</div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-semibold border-r">Instance</th>
                <th className="text-left p-3 font-semibold border-r">Num Jobs</th>
                <th className="text-left p-3 font-semibold border-r">Num Machines</th>
                <th className="text-center p-3 font-semibold border-r">TEC VNS</th>
                <th className="text-center p-3 font-semibold border-r">TEC VNS-QL</th>
                <th className="text-center p-3 font-semibold border-r">Exec Time VNS</th>
                <th className="text-center p-3 font-semibold">Exec Time VNS-QL</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/30 border-t">
                  <td className="p-3 font-medium border-r">{row.Instance}</td>
                  <td className="p-3 border-r">{row.Num_Jobs}</td>
                  <td className="p-3 border-r">{row.Num_Machines}</td>
                  <td className="p-3 text-center border-r">{parseFloat(row.TEC).toFixed(2)}</td>
                  <td className="p-3 text-center border-r">{parseFloat(row.TEC_plus).toFixed(2)}</td>
                  <td className="p-3 text-center border-r">{parseFloat(row.Exec_Time).toFixed(3)}</td>
                  <td className="p-3 text-center">{parseFloat(row.Exec_Time_plus).toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

// Permutation Table Component
const PermutationTable = () => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on component mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/DATA/Conf_papers/permu_conf.json');
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-muted-foreground">Loading data...</div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-semibold border-r">Instance</th>
                <th className="text-left p-3 font-semibold border-r">Num Jobs</th>
                <th className="text-left p-3 font-semibold border-r">Num Machines</th>
                <th className="text-center p-3 font-semibold border-r">TEC QL-GA</th>
                <th className="text-center p-3 font-semibold border-r">TEC GA</th>
                <th className="text-center p-3 font-semibold border-r">Exec Time QL-GA</th>
                <th className="text-center p-3 font-semibold">Exec Time GA</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/30 border-t">
                  <td className="p-3 font-medium border-r">{row.Instance}</td>
                  <td className="p-3 border-r">{row.Num_Jobs}</td>
                  <td className="p-3 border-r">{row.Num_Machines}</td>
                  <td className="p-3 text-center border-r">{parseFloat(row["QL-GA"]).toFixed(2)}</td>
                  <td className="p-3 text-center border-r">{parseFloat(row.GA).toFixed(2)}</td>
                  <td className="p-3 text-center border-r">{parseFloat(row["QL-GA_Exec_Time"]).toFixed(3)}</td>

                  <td className="p-3 text-center">{parseFloat(row.GA_Exec_Time).toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SingleObjectivePage;
