import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Settings2, Factory, Cog, BarChart3, GanttChart, BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MultiObjectiveSidebar from "@/components/MultiObjectiveSidebar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";


const gapData = [
  { instanceLabel: "10_5_1", gap: 0.42 },
  { instanceLabel: "10_5_2", gap: 0.85 },
  { instanceLabel: "10_5_3", gap: 2.68 },
  { instanceLabel: "10_5_4", gap: 2.69 },
  { instanceLabel: "10_5_5", gap: 4.84 },
  { instanceLabel: "10_5_6", gap: 5.20 },
  { instanceLabel: "10_5_7", gap: 3.33 },
  { instanceLabel: "10_5_8", gap: 7.47 },
  { instanceLabel: "10_5_9", gap: 6.97 },
  { instanceLabel: "10_5_10", gap: 2.34 },
  { instanceLabel: "20_10_1", gap: 6.33 },
  { instanceLabel: "20_10_2", gap: 48.43 },
  { instanceLabel: "20_10_3", gap: 8.18 },
  { instanceLabel: "20_10_4", gap: 50.82 },
  { instanceLabel: "20_10_5", gap: 5.87 },
  { instanceLabel: "20_10_6", gap: 9.33 },
  { instanceLabel: "20_10_7", gap: 4.04 },
  { instanceLabel: "20_10_8", gap: 6.38 },
  { instanceLabel: "20_10_9", gap: 5.47 },
  { instanceLabel: "20_10_10", gap: 6.28 },
  { instanceLabel: "30_15_1", gap: 7.09 },
  { instanceLabel: "30_15_2", gap: 45.16 },
  { instanceLabel: "30_15_3", gap: 8.88 },
  { instanceLabel: "30_15_4", gap: 46.85 },
  { instanceLabel: "30_15_5", gap: 46.02 },
  { instanceLabel: "30_15_6", gap: 13.15 },
  { instanceLabel: "30_15_7", gap: 7.56 },
  { instanceLabel: "30_15_8", gap: 51.07 },
  { instanceLabel: "30_15_9", gap: 10.44 },
  { instanceLabel: "30_15_10", gap: 48.52 },
  { instanceLabel: "100_20_1", gap: 4.84 },
  { instanceLabel: "100_20_2", gap: 3.89 },
  { instanceLabel: "100_20_3", gap: 5.17 },
  { instanceLabel: "100_20_4", gap: 4.76 },
  { instanceLabel: "100_20_5", gap: 5.92 },
  { instanceLabel: "100_20_6", gap: 3.25 },
  { instanceLabel: "100_20_7", gap: 4.06 },
  { instanceLabel: "100_20_8", gap: 6.33 },
  { instanceLabel: "100_20_9", gap: 5.23 },
  { instanceLabel: "100_20_10", gap: 4.87 },
  { instanceLabel: "200_40_1", gap: 4.49 },
  { instanceLabel: "200_40_2", gap: 2.96 },
  { instanceLabel: "200_40_3", gap: 5.04 },
  { instanceLabel: "200_40_4", gap: 3.81 },
  { instanceLabel: "200_40_5", gap: 6.16 },
  { instanceLabel: "200_40_6", gap: 2.86 },
  { instanceLabel: "200_40_7", gap: 2.81 },
  { instanceLabel: "200_40_8", gap: 3.27 },
  { instanceLabel: "200_40_9", gap: 2.90 },
  { instanceLabel: "200_40_10", gap: 4.26 },
];


const improv_data = [
  {
    jobs: 10,
    machines: 5,
    crossoverQLGA: 9018.4,
    crossoverGA: 4135.7,
    mutationQLGA: 4165.2,
    mutationGA: 2783.3,
    tecImprovedQLGA: 7.80,
    tecImprovedGA: 6.10,
  },
  {
    jobs: 20,
    machines: 10,
    crossoverQLGA: 8968.4,
    crossoverGA: 8352.7,
    mutationQLGA: 4009.4,
    mutationGA: 5573.1,
    tecImprovedQLGA: 20.50,
    tecImprovedGA: 11.40,
  },
  {
    jobs: 30,
    machines: 15,
    crossoverQLGA: 8801.5,
    crossoverGA: 7798.8,
    mutationQLGA: 4277.8,
    mutationGA: 5169,
    tecImprovedQLGA: 22.20,
    tecImprovedGA: 15.16,
  },
  {
    jobs: 100,
    machines: 20,
    crossoverQLGA: 8908.1,
    crossoverGA: 8759.9,
    mutationQLGA: 4392.0,
    mutationGA: 5828.3,
    tecImprovedQLGA: 26.40,
    tecImprovedGA: 16.44,
  },
  {
    jobs: 200,
    machines: 40,
    crossoverQLGA: 8979.3,
    crossoverGA: 9003.8,
    mutationQLGA: 4148.1,
    mutationGA: 6001.9,
    tecImprovedQLGA: 28.10,
    tecImprovedGA: 19.70,
  },
];

const SingleObjectivePage = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<string>("main");

  // Main page with two cards
  if (currentPage === "main") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
        <MultiObjectiveSidebar />

        <div className="flex-1 overflow-auto">
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
              
            </div>
          </div>
        </div>
        
        <div className="p-12 text-center">
                <h1 className="text-3xl font-bold text-foreground">
                  Single objective optimization in flow shop for TEC minimization under Time-of-use tariffs
                </h1>
                <p className="text-muted-foreground">Compare different flow shop approaches for TEC optimization</p>
              </div>
              
        <div className="p-6 space-y-8">
          {/* Main Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Non-Permutation Flow Shop Card */}
            <Card
              className="cursor-pointer border border-transparent hover:border-purple-500 hover:shadow-xl hover:scale-[1.03] transition-all duration-300 ease-in-out"
              onClick={() => setCurrentPage("non-permutation")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-purple-600 group-hover:text-purple-700 transition-colors" />
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
            className="cursor-pointer border border-transparent hover:border-purple-500 hover:shadow-xl hover:scale-[1.03] transition-all duration-300 ease-in-out"
            onClick={() => setCurrentPage("permutation")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600 group-hover:text-purple-700 transition-colors" />
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

          
          <div className="p-6 flex flex-col justify-center items-center gap-8 w-full">
            <Card className="mt-6 shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Q-learning for paramter control: Crossover and Mutation rates
                  </CardTitle>
                  <p className="text-blue-600 text-sm mt-1">
                    At each iteration, the Q-learning agent chooses the crossover and mutation rates based on the current state of the population: best TEC value, and population diversity.
                  </p>
                </CardHeader>
              </Card>
            <Card className="shadow-card w-full max-w-5xl">
              <CardHeader>
                <CardTitle>Gap (%) by Instance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gapData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="instanceLabel"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis
                        label={{
                          value: "Gap (%)",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip
                        formatter={(value: any) => [`${value}%`, "Gap"]}
                        labelFormatter={(label: any) => `Instance: ${label}`}
                      />
                      <Bar dataKey="gap" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="mx-auto w-full max-w-5xl">
              <CardHeader>
                <CardTitle>TEC Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-muted/50">
                      <tr>
                        <th rowSpan={2} className="p-2 border-r">Jobs</th>
                        <th rowSpan={2} className="p-2 border-r">Machines</th>
                        <th colSpan={2} className="p-2 border-r text-center">Crossover Count</th>
                        <th colSpan={2} className="p-2 border-r text-center">Mutation Count</th>
                        <th colSpan={2} className="p-2 text-center">TEC Improved (%)</th>
                      </tr>
                      <tr>
                        <th className="p-2 border-r">QL-GA</th>
                        <th className="p-2 border-r">GA</th>
                        <th className="p-2 border-r">QL-GA</th>
                        <th className="p-2 border-r">GA</th>
                        <th className="p-2 border-r">QL-GA</th>
                        <th className="p-2">GA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {improv_data.map((row, idx) => (
                        <tr key={idx} className="hover:bg-muted/30 border-t">
                          <td className="p-2 border-r">{row.jobs}</td>
                          <td className="p-2 border-r">{row.machines}</td>
                          <td className="p-2 border-r">{row.crossoverQLGA}</td>
                          <td className="p-2 border-r">{row.crossoverGA}</td>
                          <td className="p-2 border-r">{row.mutationQLGA}</td>
                          <td className="p-2 border-r">{row.mutationGA}</td>
                          <td className="p-2 border-r">{row.tecImprovedQLGA}</td>
                          <td className="p-2">{row.tecImprovedGA}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
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
        const response = await fetch('./DATA/Conf_papers/non_permu_conf.json');
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
        const response = await fetch('./DATA/Conf_papers/permu_conf.json');
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
        <div className="border rounded-lg max-h-96 overflow-y-auto overflow-x-auto">
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
                  <td className="p-3 text-center border-r">
                    {parseFloat(row["QL-GA"]).toFixed(2)}
                  </td>
                  <td className="p-3 text-center border-r">
                    {parseFloat(row.GA).toFixed(2)}
                  </td>
                  <td className="p-3 text-center border-r">
                    {parseFloat(row["QL-GA_Exec_Time"]).toFixed(3)}
                  </td>
                  <td className="p-3 text-center">
                    {parseFloat(row.GA_Exec_Time).toFixed(3)}
                  </td>
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
