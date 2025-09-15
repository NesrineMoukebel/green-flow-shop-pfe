import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Trophy, Settings2, SlidersHorizontal, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";
import Navbar from "@/components/Navbar";

// Data types
interface ParetoPoint {
  makespan: number;
  tec: number;
  isPareto: boolean;
  executionTime: number;
}

interface MOQLVariant {
  name: string;
  description: string;
  color: string;
  data: ParetoPoint[];
}

interface MetricsData {
  No_Jobs: number;
  No_of_machines: number;
  Instance: number;
  IGD: Record<string, number>;
  SNS: Record<string, number>;
  NPS: Record<string, number>;
  "Exec_Time": Record<string, number>;
}

// Data loading functions
// const loadCSVData = async (filePath: string): Promise<ParetoPoint[]> => {
//   try {
//     const response = await fetch(filePath);
//     const csvText = await response.text();
//     const lines = csvText.split('\n');
//     const data: ParetoPoint[] = [];
    
//     for (let i = 1; i < lines.length; i++) {
//       const line = lines[i].trim();
//       if (line) {
//         const [makespan, tec, pareto, executionTime] = line.split(',');
//         data.push({
//           makespan: parseFloat(makespan),
//           tec: parseFloat(tec),
//           isPareto: pareto.toLowerCase() === 'true', // Fix here
//           executionTime: parseFloat(executionTime)
//         });
//       }
//     }
//     return data;
//   } catch (error) {
//     console.error(`Error loading CSV data from ${filePath}:`, error);
//     return [];
//   }
// };

const loadCSVData = async (filePath: string): Promise<ParetoPoint[]> => {
  try {
    const response = await fetch(filePath);
    const csvText = await response.text();
    const lines = csvText.split('\n');
    const data: ParetoPoint[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const values = line.split(',');
        
        // Skip if we don't have enough values
        if (values.length < 4) continue;
        
        const makespan = parseFloat(values[0]);
        const tec = parseFloat(values[1]);
        const pareto = values[2] ? values[2].toLowerCase() : 'false';
        const executionTime = parseFloat(values[3]);
        
        // Skip if we have invalid numeric values
        if (isNaN(makespan) || isNaN(tec) || isNaN(executionTime)) continue;
        
        data.push({
          makespan: makespan,
          tec: tec,
          isPareto: pareto === 'true',
          executionTime: executionTime
        });
      }
    }
    return data;
  } catch (error) {
    console.error(`Error loading CSV data from ${filePath}:`, error);
    return [];
  }
};

const loadJSONData = async (filePath: string): Promise<any> => {
  try {
    const response = await fetch(filePath);
    const data = await response.json();
    
    // Convert comma-formatted numbers to proper JavaScript numbers
    const convertNumbers = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(convertNumbers);
      } else if (obj !== null && typeof obj === 'object') {
        const result: any = {};
        for (const key in obj) {
          result[key] = convertNumbers(obj[key]);
        }
        return result;
      } else if (typeof obj === 'string' && /^-?\d+,\d+$/.test(obj)) {
        // Convert comma decimal to dot decimal
        return parseFloat(obj.replace(',', '.'));
      } else if (typeof obj === 'string' && !isNaN(Number(obj)) && obj !== '') {
        // Convert regular numeric strings
        return Number(obj);
      }
      return obj;
    };
    
    return convertNumbers(data);
  } catch (error) {
    console.error(`Error loading JSON data from ${filePath}:`, error);
    return [];
  }
};

// Pareto dominance functions
const isDominated = (point1: ParetoPoint, point2: ParetoPoint): boolean => {
  return point2.makespan <= point1.makespan && point2.tec <= point1.tec && 
         (point2.makespan < point1.makespan || point2.tec < point1.tec);
};

const getParetoFront = (points: ParetoPoint[]): ParetoPoint[] => {
  const paretoFront: ParetoPoint[] = [];
  
  for (const point of points) {
    let isDominatedByAny = false;
    
    for (const other of points) {
      if (isDominated(point, other)) {
        isDominatedByAny = true;
        break;
      }
    }
    
    if (!isDominatedByAny) {
      paretoFront.push(point);
    }
  }
  
  return paretoFront.sort((a, b) => a.makespan - b.makespan);
};

// Constants
const metaheuristics = [
  { label: "HNSGA-II", value: "HNSGA-II" },
  { label: "HMOGVNS", value: "HMOGVNS" },
  { label: "HMOSA", value: "HMOSA" },
];

const moqlApproaches = [
  {
    name: "QL1",
    fullName: "Adaptive Q-Learning-Based Operator Selection (AQL-OS)",
    color: "#3B82F6"
  },
  {
    name: "QL2", 
    fullName: "Normalized Multi-Objective Q-Learning (NMO-QL)",
    color: "#10B981"
  },
  {
    name: "QL3",
    fullName: "Scalarized Multi-Objective Q-Learning (SMO-QL)",
    color: "#F59E0B"
  },
  {
    name: "QL",
    fullName: "Pareto Optimal Pareto Q-Learning (PO-PQL)",
    color: "#8B5CF6"
  }
];

const colors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"];

// QL counts data (provided)
const operators = [
  "Insertion",
  "Cost-Aware Insertion",
  "Swap",
  "Cost-Aware Swap",
  "Cost-Aware Machine Sequence Swap",
];

const countsData = {
  "HNSGA-II": {
    ql: [140.2, 140.6, 138.4, 145.7, 135.9],
    noql: [43.2, 0, 20.6, 8.6, 28.6],
  },
  "HMOGVNS": {
    ql: [145.4, 127.6, 126.8, 157.0, 660.4],
    noql: [70.8, 0, 42.6, 8.8, 67.6],
  },
  "HMOSA": {
    ql: [851.33, 811.66, 825.0, 805.0, 689.0],
    noql: [38.0, 10.0, 30.0, 8.3, 3.3],
  },
} as const;

function buildBarData(values: readonly number[]) {
  return operators.map((op, i) => ({ operator: op, count: values[i] }));
}

// Actions tests sequences
const actionOps = operators;
const operatorColors: Record<string, string> = {
  "Swap": "bg-purple-100/30 text-purple-700", 
  "Cost-aware swap": "bg-pink-100/30 text-pink-700",
  "Insertion": "bg-blue-100/30 text-blue-700",
  "Cost-aware insertion": "bg-green-100/30 text-green-700",
  "Cost-aware machine sequence swap": "bg-yellow-100/30 text-yellow-700",
};

const possibleOrders: string[][] = [
  ["Cost-aware machine sequence swap", "Insertion", "Swap", "Cost-aware swap", "Cost-aware insertion"],
  ["Insertion", "Cost-aware machine sequence swap", "Swap", "Cost-aware swap", "Cost-aware insertion"],
  ["Cost-aware machine sequence swap", "Insertion", "Swap", "Cost-aware swap", "Cost-aware insertion"],
  ["Swap", "Insertion", "Cost-aware machine sequence swap", "Cost-aware swap", "Cost-aware insertion"],
  ["Insertion", "Cost-aware insertion", "Swap", "Cost-aware swap", "Cost-aware machine sequence swap"],
  ["Cost-aware machine sequence swap", "Swap", "Insertion", "Cost-aware swap", "Cost-aware insertion"],
  ["Cost-aware machine sequence swap", "Insertion", "Cost-aware swap", "Swap", "Cost-aware insertion"],
  ["Cost-aware machine sequence swap", "Cost-aware swap", "Insertion", "Swap", "Cost-aware insertion"],
  ["Swap", "Cost-aware swap", "Insertion", "Cost-aware insertion", "Cost-aware machine sequence swap"],
];

// Pareto Chart Component
const ParetoChart = ({ variants }: { variants: MOQLVariant[] }) => {
  const allPoints = variants.flatMap(variant => variant.data.filter(p => p.isPareto));
  const minMakespan = allPoints.length ? Math.min(...allPoints.map(p => p.makespan)) : 0;
  const maxMakespan = allPoints.length ? Math.max(...allPoints.map(p => p.makespan)) : 1;
  const minTec = allPoints.length ? Math.min(...allPoints.map(p => p.tec)) : 0;
  const maxTec = allPoints.length ? Math.max(...allPoints.map(p => p.tec)) : 1;

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="makespan" name="Makespan" type="number" domain={[minMakespan, maxMakespan]} tick={{ fontSize: 12 }} />
          <YAxis dataKey="tec" name="TEC" type="number" domain={[minTec, maxTec]} tick={{ fontSize: 12 }} />
          <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const point = payload[0].payload;
                    return (
                      <div className="bg-white p-2 border rounded shadow">
                        <p>Makespan: {point.makespan.toFixed(2)}</p>
                        <p>TEC: {point.tec.toFixed(2)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />

          <Legend />
          {variants.map((variant, idx) => {
            const paretoPoints = variant.data.filter(p => p.isPareto);
            return (
              <Scatter 
                key={variant.name} 
                name={variant.name} 
                data={paretoPoints} 
                fill={variant.color} 
                shape="circle" 
              />
            );
          })}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

const MORLPage = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<string>("main");
  const [selectedMH, setSelectedMH] = useState<string>("HNSGA-II");
  const [selectedTest, setSelectedTest] = useState<string>("po-pql-params");
  
  // Data states
  const [moqlVariants, setMoqlVariants] = useState<MOQLVariant[]>([]);
  const [moqlMetrics, setMoqlMetrics] = useState<MetricsData[]>([]);
  const [popqlParamVariants, setPopqlParamVariants] = useState<MOQLVariant[]>([]);
  const [popqlParamMetrics, setPopqlParamMetrics] = useState<MetricsData[]>([]);
  const [popqlResultVariants, setPopqlResultVariants] = useState<MOQLVariant[]>([]);
  const [popqlResultMetrics, setPopqlResultMetrics] = useState<MetricsData[]>([]);
  const [actionsVariants, setActionsVariants] = useState<MOQLVariant[]>([]);
  const [actionsMetrics, setActionsMetrics] = useState<MetricsData[]>([]);
  const [rewardsVariants, setRewardsVariants] = useState<MOQLVariant[]>([]);
  const [rewardsMetrics, setRewardsMetrics] = useState<MetricsData[]>([]);

  
  const [isLoading, setIsLoading] = useState(false);

  // Load MOQL data
  useEffect(() => {
    const loadMOQLData = async () => {
      if (currentPage === "moql") {
        setIsLoading(true);
        try {
          const [ql1Data, ql2Data, ql3Data, qlData, metricsData] = await Promise.all([
            loadCSVData(`./DATA/MORL_page_tests/MOQL_tests/QL1-${selectedMH}.csv`),
            loadCSVData(`./DATA/MORL_page_tests/MOQL_tests/QL2-${selectedMH}.csv`),
            loadCSVData(`./DATA/MORL_page_tests/MOQL_tests/QL3-${selectedMH}.csv`),
            loadCSVData(`./DATA/MORL_page_tests/MOQL_tests/QL-${selectedMH}.csv`),
            loadJSONData(`./DATA/MORL_page_tests/MOQL_tests/moqlapproaches_${selectedMH}.json`)
          ]);

          const variants: MOQLVariant[] = [
            { name: "QL1", description: moqlApproaches[0].fullName, color: moqlApproaches[0].color, data: ql1Data },
            { name: "QL2", description: moqlApproaches[1].fullName, color: moqlApproaches[1].color, data: ql2Data },
            { name: "QL3", description: moqlApproaches[2].fullName, color: moqlApproaches[2].color, data: ql3Data },
            { name: "QL", description: moqlApproaches[3].fullName, color: moqlApproaches[3].color, data: qlData }
          ];

          setMoqlVariants(variants);
          setMoqlMetrics(metricsData);
        } catch (error) {
          console.error('Error loading MOQL data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadMOQLData();
  }, [currentPage, selectedMH]);

  // Load PO-PQL Parameters data
  useEffect(() => {
    const loadPOPQLParamData = async () => {
      if (currentPage === "popql" && selectedTest === "po-pql-params") {
        setIsLoading(true);
        try {
          const [ql1Data, ql2Data, qlData, metricsData] = await Promise.all([
            loadCSVData(`./DATA/MORL_page_tests/POPQL_tests/param_tests/QL1-${selectedMH}.csv`),
            loadCSVData(`./DATA/MORL_page_tests/POPQL_tests/param_tests/QL2-${selectedMH}.csv`),
            loadCSVData(`./DATA/MORL_page_tests/POPQL_tests/param_tests/QL-${selectedMH}.csv`),
            loadJSONData(`./DATA/MORL_page_tests/POPQL_tests/param_tests/${selectedMH}_popql_param.json`)
          ]);

          const variants: MOQLVariant[] = [
            { name: `QL1-${selectedMH}`, description: "Epsilon: 0.1", color: "#3B82F6", data: ql1Data },
            { name: `QL2-${selectedMH}`, description: "Epsilon: 0.3", color: "#10B981", data: ql2Data },
            { name: `QL-${selectedMH}`, description: "Epsilon: 0.5", color: "#8B5CF6", data: qlData },
          ];
          

          setPopqlParamVariants(variants);
          setPopqlParamMetrics(metricsData);
        } catch (error) {
          console.error('Error loading PO-PQL param data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPOPQLParamData();
  }, [currentPage, selectedTest, selectedMH]);

  // Load PO-PQL Results data
  useEffect(() => {
    const loadPOPQLResultData = async () => {
      if (currentPage === "popql" && selectedTest === "po-pql-results") {
        setIsLoading(true);
        try {
          const [qlData, mhData, metricsData] = await Promise.all([
            loadCSVData(`./DATA/MORL_page_tests/POPQL_tests/POPQL/QL-${selectedMH}.csv`),
            loadCSVData(`./DATA/MORL_page_tests/POPQL_tests/POPQL/${selectedMH}.csv`),
            loadJSONData(`./DATA/MORL_page_tests/POPQL_tests/POPQL/popql_${selectedMH}.json`)
          ]);

          const variants: MOQLVariant[] = [
            { name: `QL-${selectedMH}`, description: "PO-PQL inside M-VND", color: "#F59E0B", data: qlData },
            { name: selectedMH, description: "Original Metaheuristic", color: "#8B5CF6", data: mhData }
          ];

          setPopqlResultVariants(variants);
          setPopqlResultMetrics(metricsData);
        } catch (error) {
          console.error('Error loading PO-PQL result data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPOPQLResultData();
  }, [currentPage, selectedTest, selectedMH]);

  // Load Actions Tests data
useEffect(() => {
  const loadActionsData = async () => {
    if (currentPage === "popql" && selectedTest === "actions-tests") {
      setIsLoading(true);
      try {
        const [qlData, ql2Data, metricsData] = await Promise.all([
          loadCSVData(`./DATA/MORL_page_tests/POPQL_tests/Actions/QL-HMOGVNS.csv`),
          loadCSVData(`./DATA/MORL_page_tests/POPQL_tests/Actions/QL2-HMOGVNS.csv`),
          loadJSONData(`./DATA/MORL_page_tests/POPQL_tests/Actions/Actions.json`)
        ]);

        const variants: MOQLVariant[] = [
          { name: `QL-HMOGVNS`, description: "Original QL", color: "#3B82F6", data: qlData },
          { name: `QL2-HMOGVNS`, description: "Alternative QL", color: "#10B981", data: ql2Data },
        ];

        setActionsVariants(variants);
        setActionsMetrics(metricsData);
      } catch (error) {
        console.error('Error loading Actions data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  loadActionsData();
}, [currentPage, selectedTest, selectedMH]);

  // Load Rewards Tests data
  useEffect(() => {
    const loadRewardsData = async () => {
      if (currentPage === "popql" && selectedTest === "rewards-tests") {
        setIsLoading(true);
        try {
          const [ql1Data, ql2Data, qlData, metricsData] = await Promise.all([
            loadCSVData(`./DATA/MORL_page_tests/POPQL_tests/Rewards/QL1-HMOGVNS.csv`),
            loadCSVData(`./DATA/MORL_page_tests/POPQL_tests/Rewards/QL2-HMOGVNS.csv`),
            loadCSVData(`./DATA/MORL_page_tests/POPQL_tests/Rewards/QL-${selectedMH}.csv`),
            loadJSONData(`./DATA/MORL_page_tests/POPQL_tests/Rewards/Rewards.json`)
          ]);

          const variants: MOQLVariant[] = [
            { name: `QL1-HMOGVNS`, description: "Reward Variant 1", color: "#3B82F6", data: ql1Data },
            { name: `QL2-HMOGVNS`, description: "Reward Variant 2", color: "#10B981", data: ql2Data },
            { name: `QL-HMOGVNS`, description: "Original QL", color: "#8B5CF6", data: qlData },
          ];

          setRewardsVariants(variants);
          setRewardsMetrics(metricsData);
        } catch (error) {
          console.error('Error loading Rewards data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadRewardsData();
  }, [currentPage, selectedTest, selectedMH]);


  // Determine example text based on scenario and selected MH
  const getParetoExampleText = (scenario: string, mh: string) => {
    if (scenario === "moql") {
      if (mh === "HNSGA-II") return "Pareto fronts example - Instance 1, 60 jobs, 20 machines";
      if (mh === "HMOGVNS") return "Pareto fronts example - Instance 4, 200 jobs, 20 machines";
      if (mh === "HMOSA") return "Pareto fronts example - Instance 8, 30 jobs, 10 machines";

    } else if (scenario === "po-pql-params") {
      if (mh === "HNSGA-II") return "Pareto fronts example - Instance 1, 400 jobs, 20 machines";
      if (mh === "HMOGVNS") return "Pareto fronts example - Instance 9, 100 jobs, 20 machines";
      if (mh === "HMOSA") return "Pareto fronts example - Instance 7, 300 jobs, 60 machines";
    }
    else if (scenario === "po-pql-results") {
      if (mh === "HNSGA-II") return "Pareto fronts example - Instance 7, 30 jobs, 20 machines";
      if (mh === "HMOGVNS") return "Pareto fronts example - Instance 9, 200 jobs, 40 machines";
      if (mh === "HMOSA") return "Pareto fronts example - Instance 8, 300 jobs, 40 machines";
    }
    else if (scenario === "rewards-tests") {
      
      if (mh === "HMOGVNS") return "Pareto fronts example - Instance 9, 100 jobs, 20 machines";
      
    }
    else if (scenario === "actions-tests") {
     
      if (mh === "HMOGVNS") return "Pareto fronts example - Instance 7, 300 jobs, 60 machines";
     
    }
    
    return "Pareto fronts example"; // default fallback
  };
  // Main page with two cards
  if (currentPage === "main") {
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
            <CardTitle className="text-lg">Multi-objective Q-learning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground leading-relaxed">
              <p className="mb-3">
                Tests and experiments with Multi-Objective Q-Learning
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
              <div className="font-medium text-accent">MOQL approaches</div>
              <div className="text-muted-foreground">Comparison between different single -and multi policy approaches</div>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium text-accent">PO-PQL Tests</div>
              <div className="text-muted-foreground">Tests of PO-PQL on metaheuristics</div>
            </div>
            
                       
          </CardContent>
        </Card>
      </div>
     
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/multi-objective")}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Menu
              </Button>
              
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">

        <div className="px-8 py-6 flex flex-col items-center text-center">
                <h1 className="text-3xl font-bold text-gray-900">Multi-objective RL Dashboard</h1>
                <p className="text-gray-600 mt-1">Multi-objective reinforcement learning comparisons and analysis</p>
              </div>
          {/* Main Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* MOQL Comparison Card */}
            
                     
         
          <Card className="group cursor-pointer border-purple-300/40 hover:border-purple-400 hover:shadow-[0_8px_30px_rgb(127,90,240,0.25)] transition-all duration-300 transform hover:scale-[1.02]">
            <CardContent className="p-8 text-center space-y-6 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-300">MOQL Comparison</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Compare different Multi-Objective Q-Learning approaches across metaheuristics</p>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setCurrentPage("moql")}>
                Explore
              </Button>
            </CardContent>
          </Card>

          <Card className="group cursor-pointer border-purple-300/40 hover:border-purple-400 hover:shadow-[0_8px_30px_rgb(127,90,240,0.25)] transition-all duration-300 transform hover:scale-[1.02]">
            <CardContent className="p-8 text-center space-y-6 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-300">PO-PQL Tests</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Test Pareto Optimal Pareto Q-Learning parameters and results</p>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setCurrentPage("popql")}>
                Explore
              </Button>
            </CardContent>
          </Card>
        </div>

          </div>
        </div>
      </div>
    );
     }

  // MOQL Comparison Page
  if (currentPage === "moql") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
        {/* Sidebar */}
        <div className="w-80 h-screen bg-white border-r border-gray-200 p-6 overflow-y-auto sticky top-0">
        <img 
          src="./DATA/images/LOGO.png" 
          alt="Bi-Optima Logo" 
          className="px-auto h-20 w-auto hover:scale-105 transition-transform duration-200 cursor-pointer mb-6" 
          onClick={() => navigate("/")}
        />
          <Card className="mt-6 shadow-card">
          
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings2 className="w-5 h-5 text-primary" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Metaheuristic</label>
                <Select value={selectedMH} onValueChange={setSelectedMH}>
                <SelectTrigger>
                    <SelectValue placeholder="Select metaheuristic" />
                </SelectTrigger>
                <SelectContent>
                    {metaheuristics.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            </CardContent>
          </Card>

          {/* Logo Section */}
        
        
        
       

          {/* MOQL Approaches Description */}
          <Card className="mt-6 shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">MOQL Approaches</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {moqlApproaches.map((approach, idx) => (
                <div key={approach.name} className="p-3 bg-muted rounded-md">
                  <div className="font-medium text-accent" style={{ color: approach.color }}>
                    {approach.name}
                  </div>
                  <div className="text-muted-foreground">{approach.fullName}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="px-8 py-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage("main")}
                  className="hover:bg-gray-100"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Main
                </Button>
              <div>
                  <h1 className="text-3xl font-bold text-gray-900">MOQL Approaches Comparison</h1>
                  <p className="text-gray-600 mt-1">Multi-Objective Q-Learning approaches with {selectedMH}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Pareto Fronts */}
            <Card>
              <CardHeader>
                <CardTitle>Pareto Fronts Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-96 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <div className="text-muted-foreground">Loading data...</div>
                    </div>
                  </div>
                ) : moqlVariants.length > 0 ? (
                  <ParetoChart variants={moqlVariants.map(v => ({
                    ...v,
                    name: `${v.name}-${selectedMH}`, // mhName is your variable for the method name
                  }))}/>
                ) : (
                  <div className="h-96 flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Metrics Table */}
            {moqlMetrics.length > 0 && (
             <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Trophy className="w-5 h-5 text-primary" />
                 Performance Metrics
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="border rounded-lg overflow-x-auto">
                 <Table>
                   <TableHeader>
                     <TableRow className="bg-muted/50">
                       <TableHead rowSpan={2} className="font-semibold align-middle border-r">Instance</TableHead>
                       <TableHead rowSpan={2} className="font-semibold align-middle border-r">Jobs</TableHead>
                       <TableHead rowSpan={2} className="font-semibold align-middle border-r">Machines</TableHead>
                       <TableHead colSpan={moqlApproaches.length} className="text-center font-semibold border-b border-l">IGD</TableHead>
                       <TableHead colSpan={moqlApproaches.length} className="text-center font-semibold border-b border-l">SNS</TableHead>
                       <TableHead colSpan={moqlApproaches.length} className="text-center font-semibold border-b border-l">NPS</TableHead>
                       <TableHead colSpan={moqlApproaches.length} className="text-center font-semibold border-b border-l">Exec Time (s)</TableHead>
                     </TableRow>
                     <TableRow className="bg-muted/30">
                       {["IGD", "SNS", "NPS", "Exec_Time"].flatMap(metric =>
                         moqlApproaches.map((approach, i) => (
                           <TableHead
                             key={`${metric}-${approach.name}`}
                             className={`text-center ${i === 0 ? "border-l border-border" : ""}`}
                           >
                             {approach.name}-{selectedMH}
                           </TableHead>
                         ))
                       )}
                     </TableRow>
                   </TableHeader>
           
                   <TableBody>
                     {moqlMetrics.map((row, idx) => {
                       // compute best values per metric row
                       const bestValues: Record<string, number> = {};
           
                       ["IGD", "SNS", "NPS", "Exec_Time"].forEach(metric => {
                         let values = moqlApproaches
                           .map(a => row[metric][`${a.name}-${selectedMH}`])
                           .filter(v => typeof v === "number");
           
                         if (values.length > 0) {
                           // IGD, Exec_Time → minimize | SNS, NPS → maximize
                           bestValues[metric] =
                             metric === "IGD" || metric === "Exec_Time"
                               ? Math.min(...values)
                               : Math.max(...values);
                         }
                       });
           
                       return (
                         <TableRow key={idx} className="hover:bg-muted/30">
                           <TableCell className="border-r font-medium">{row.Instance}</TableCell>
                           <TableCell className="border-r">{row.No_Jobs}</TableCell>
                           <TableCell className="border-r">{row.No_of_machines}</TableCell>
           
                           {["IGD", "SNS", "NPS", "Exec_Time"].flatMap(metric =>
                             moqlApproaches.map((approach, i) => {
                               const value = row[metric][`${approach.name}-${selectedMH}`];
                               const formatted =
                                 typeof value === "number"
                                   ? metric === "Exec_Time"
                                     ? value.toFixed(3)
                                     : value.toFixed(4)
                                   : "N/A";
           
                               const isBest =
                                 typeof value === "number" &&
                                 value === bestValues[metric];
           
                               return (
                                 <TableCell
                                   key={`${metric}-${idx}-${approach.name}`}
                                   className={`text-center ${isBest ? "bg-primary/10 font-bold text-primary" : ""} ${i === 0 ? "border-l border-border" : ""}`}
                                 >
                                   {formatted}
                                   {isBest && (
                                     <Trophy className="w-3 h-3 inline ml-1 text-primary" />
                                   )}
                                 </TableCell>
                               );
                             })
                           )}
                         </TableRow>
                       );
                     })}
                   </TableBody>
                 </Table>
               </div>
           
               {/* Optional metric legend like inspo card */}
               <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                 <div className="text-sm">
                   <div className="font-medium mb-2">Metric Descriptions:</div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                     <div><strong>IGD (Inverted Generational Distance):</strong> Lower values indicate better convergence to true Pareto front</div>
                     <div><strong>SNS (Spread of Non-Dominated Solutions):</strong> Higher values indicate better distribution of solutions</div>
                     <div><strong>NPS (Number of Pareto Solutions):</strong> Higher values indicate more non-dominated solutions found</div>
                     <div><strong>Exec Time (Execution Time):</strong> Lower values indicate faster algorithm performance</div>
                   </div>
                 </div>
               </div>
             </CardContent>
           </Card>
           
              
            )}
          </div>
        </div>
        </div>
  
    );
  }     

  // PO-PQL Tests Page
  if (currentPage === "popql") {
    return (
      <div className="min-h-screen bg-background">
   
        <div className="flex">
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Test</label>
                <Select value={selectedTest} onValueChange={setSelectedTest}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select test" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="po-pql-params">PO-PQL Parameters</SelectItem>
                    <SelectItem value="po-pql-results">Results of PO-PQL on metaheuristics</SelectItem>
                    <SelectItem value="ql-counts">QL counts</SelectItem>
                    <SelectItem value="rewards-tests">Rewards tests</SelectItem>
                    <SelectItem value="actions-tests">Actions tests</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedTest !== "rewards-tests" && selectedTest !== "actions-tests" && selectedTest !== "ql-counts" && (
                  <div className="space-y-2">
                  <label className="text-sm font-medium">Metaheuristic</label>
                  <Select value={selectedMH} onValueChange={setSelectedMH}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select metaheuristic" />
                    </SelectTrigger>
                    <SelectContent>
                      {metaheuristics.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  </div>                
              )}
             
            </CardContent>
          </Card>

          {/* PO-PQL Description */}
          <Card className="mt-6 shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">PO-PQL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-muted rounded-md">
                <div className="font-medium text-accent">PO-PQL</div>
                <div className="text-muted-foreground">Pareto Optimal Pareto Q-Learning</div>
              </div>
              {selectedTest === "po-pql-params" && (
                <div className="p-3 bg-muted rounded-md">
                  <div className="font-medium text-accent">Epsilon Values</div>
                  <div className="text-muted-foreground">
                    - QL-HMOGVNS adopts the epsilon decay<br/>
                  </div>
                  <div className="text-muted-foreground">
                    - QL-HMOSA adopts the epislon decay<br/>
                  </div>
                  <div className="text-muted-foreground">
                    - QL-HNSGA-II adopts the value epsilon = 0.25<br/>
                  </div>
                </div>
              )}
              {selectedTest === "po-pql-results" && (
                <div className="p-3 bg-muted rounded-md">
                  <div className="font-medium text-accent">PO-PQL inside M-VND</div>
                  <div className="text-muted-foreground">Pareto Optimal Pareto Q-Learning integrated with Multi-Variable Neighborhood Descent</div>
                </div>
              )}
              {selectedTest === "rewards-tests" && (
                <div className="flex flex-col gap-4">
                  
                <div className="p-3 bg-muted rounded-md">
                  <div className="font-medium text-accent">QL-HMOGVNS</div>
                  <div className="text-muted-foreground">Uses the Normalized Relative Improvement Reward</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="font-medium text-accent">QL1-HMOGVNS</div>
                  <div className="text-muted-foreground">Uses Direct Improvement Reward</div>
                  </div>

                  <div className="p-3 bg-muted rounded-md">
                  <div className="font-medium text-accent">QL2-HMOGVNS</div>
                  <div className="text-muted-foreground">Uses Inverse Normalized Reward</div>
                  </div>
                </div>

              )}
              {selectedTest === "actions-tests" && (
                <div className="flex flex-col gap-4">
                  
                <div className="p-3 bg-muted rounded-md">
                  <div className="font-medium text-accent">QL-HMOGVNS</div>
                  <div className="text-muted-foreground">The action is to choose one operator from the set of operators within M-VND</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="font-medium text-accent">QL2-HMOGVNS</div>
                  <div className="text-muted-foreground">The action is to choose a sequence of operators within M-VND</div>
                  </div>
                </div>

              )}
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
                  <h1 className="text-2xl font-bold text-foreground">PO-PQL Tests</h1>
                  <p className="text-muted-foreground">
                    {selectedTest === "po-pql-params" && "PO-PQL Parameters testing with " + selectedMH}
                    {selectedTest === "po-pql-results" && "PO-PQL Results on " + selectedMH}
                    {selectedTest === "ql-counts" && "QL Counts Analysis"}
                    {selectedTest === "rewards-tests" && "Rewards Tests"}
                    {selectedTest === "actions-tests" && "Actions Tests"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* PO-PQL Parameters */}
            {selectedTest === "po-pql-params" && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>{getParetoExampleText(selectedTest, selectedMH)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="h-96 flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                          <div className="text-muted-foreground">Loading data...</div>
                        </div>
                      </div>
                    ) : popqlParamVariants.length > 0 ? (
                      <ParetoChart variants={popqlParamVariants} />
                    ) : (
                      <div className="h-96 flex items-center justify-center text-muted-foreground">
                        No data available
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Algorithm Variants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {/* NFS */}
                    <Card className="p-2 text-center transition-transform duration-300 hover:scale-105 hover:shadow-md">
                      <CardTitle className="text-sm mb-1 text-purple-600">QL1-{selectedMH}</CardTitle>
                      <p className="text-xs text-gray-600">
                        {selectedMH === "HNSGA-II"
                          ? "Epsilon value: 0.2"
                          : "Epsilon value: 0.2"}
                      </p>
                    </Card>

                    {/* NEH */}
                    <Card className="p-2 text-center transition-transform duration-300 hover:scale-105 hover:shadow-md">
                      <CardTitle className="text-sm mb-1 text-purple-600">QL2-{selectedMH}</CardTitle>
                      <p className="text-xs text-gray-600">
                        {selectedMH === "HNSGA-II"
                          ? "Epsilon value: decay"
                          : "Epsilon value: 0.3"}
                      </p>
                    </Card>

                    {/* WNEH */}
                    <Card className="p-2 text-center transition-transform duration-300 hover:scale-105 hover:shadow-md">
                      <CardTitle className="text-sm mb-1 text-purple-600">QL-{selectedMH}</CardTitle>
                      <p className="text-xs text-gray-600">
                        {selectedMH === "HNSGA-II"
                          ? "Epsilon value: 0.25"
                          : "Epsilon value: decay"}
                      </p>
                    </Card>

                  </div>
                </CardContent>
              </Card>
                {/* Metrics Table */}
                {popqlParamMetrics.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-primary" />
                        Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead rowSpan={2} className="font-semibold align-middle border-r">Instance</TableHead>
                              <TableHead rowSpan={2} className="font-semibold align-middle border-r">Jobs</TableHead>
                              <TableHead rowSpan={2} className="font-semibold align-middle border-r">Machines</TableHead>
                              <TableHead colSpan={3} className="text-center font-semibold border-b border-l">IGD</TableHead>
                              <TableHead colSpan={3} className="text-center font-semibold border-b border-l">SNS</TableHead>
                              <TableHead colSpan={3} className="text-center font-semibold border-b border-l">NPS</TableHead>
                              <TableHead colSpan={3} className="text-center font-semibold border-b border-l">Exec Time (s)</TableHead>
                            </TableRow>
                            <TableRow className="bg-muted/30">
                              <TableHead className="text-center border-l border-border">QL1-{selectedMH}</TableHead>
                              <TableHead className="text-center">QL2-{selectedMH}</TableHead>
                              <TableHead className="text-center">QL-{selectedMH}</TableHead>
                              <TableHead className="text-center border-l border-border">QL1-{selectedMH}</TableHead>
                              <TableHead className="text-center">QL2-{selectedMH}</TableHead>
                              <TableHead className="text-center">QL-{selectedMH}</TableHead>
                              <TableHead className="text-center border-l border-border">QL1-{selectedMH}</TableHead>
                              <TableHead className="text-center">QL2-{selectedMH}</TableHead>
                              <TableHead className="text-center">QL-{selectedMH}</TableHead>
                              <TableHead className="text-center border-l border-border">QL1-{selectedMH}</TableHead>
                              <TableHead className="text-center">QL2-{selectedMH}</TableHead>
                              <TableHead className="text-center">QL-{selectedMH}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {popqlParamMetrics.map((row, idx) => {
                              // Compute best values per metric row
                              const approaches = [`QL1-${selectedMH}`, `QL2-${selectedMH}`, `QL-${selectedMH}`];
                              const bestValues: Record<string, number> = {};
                              
                              ["IGD", "SNS", "NPS", "Exec_Time"].forEach(metric => {
                                let values = approaches
                                  .map(approach => row[metric][approach])
                                  .filter(v => typeof v === "number");
                                
                                if (values.length > 0) {
                                  // IGD, Exec_Time → minimize | SNS, NPS → maximize
                                  bestValues[metric] =
                                    metric === "IGD" || metric === "Exec_Time"
                                      ? Math.min(...values)
                                      : Math.max(...values);
                                }
                              });
                              
                              return (
                                <TableRow key={idx} className="hover:bg-muted/30">
                                  <TableCell className="border-r font-medium">{row.Instance}</TableCell>
                                  <TableCell className="border-r">{row.No_Jobs}</TableCell>
                                  <TableCell className="border-r">{row.No_of_machines}</TableCell>
                                  
                                  {/* IGD */}
                                  {approaches.map((approach, i) => {
                                    const value = row.IGD[approach];
                                    const formatted = typeof value === "number" ? value.toFixed(4) : "N/A";
                                    const isBest = typeof value === "number" && value === bestValues["IGD"];
                                    
                                    return (
                                      <TableCell
                                        key={`igd-${i}`}
                                        className={`text-center ${isBest ? "bg-primary/10 font-bold text-primary" : ""} ${i === 0 ? "border-l border-border" : ""}`}
                                      >
                                        {formatted}
                                        {isBest && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                                      </TableCell>
                                    );
                                  })}
                                  
                                  {/* SNS */}
                                  {approaches.map((approach, i) => {
                                    const value = row.SNS[approach];
                                    const formatted = typeof value === "number" ? value.toFixed(4) : "N/A";
                                    const isBest = typeof value === "number" && value === bestValues["SNS"];
                                    
                                    return (
                                      <TableCell
                                        key={`sns-${i}`}
                                        className={`text-center ${isBest ? "bg-primary/10 font-bold text-primary" : ""} ${i === 0 ? "border-l border-border" : ""}`}
                                      >
                                        {formatted}
                                        {isBest && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                                      </TableCell>
                                    );
                                  })}
                                  
                                  {/* NPS */}
                                  {approaches.map((approach, i) => {
                                    const value = row.NPS[approach];
                                    const formatted = value || "N/A";
                                    const isBest = typeof value === "number" && value === bestValues["NPS"];
                                    
                                    return (
                                      <TableCell
                                        key={`nps-${i}`}
                                        className={`text-center ${isBest ? "bg-primary/10 font-bold text-primary" : ""} ${i === 0 ? "border-l border-border" : ""}`}
                                      >
                                        {formatted}
                                        {isBest && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                                      </TableCell>
                                    );
                                  })}
                                  
                                  {/* Exec Time */}
                                  {approaches.map((approach, i) => {
                                    const value = row["Exec_Time"][approach];
                                    const formatted = typeof value === "number" ? value.toFixed(3) : "N/A";
                                    const isBest = typeof value === "number" && value === bestValues["Exec_Time"];
                                    
                                    return (
                                      <TableCell
                                        key={`exec-${i}`}
                                        className={`text-center ${isBest ? "bg-primary/10 font-bold text-primary" : ""} ${i === 0 ? "border-l border-border" : ""}`}
                                      >
                                        {formatted}
                                        {isBest && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                      
                      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                        <div className="text-sm">
                          <div className="font-medium mb-2">Metric Descriptions:</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div><strong>IGD (Inverted Generational Distance):</strong> Lower values indicate better convergence to true Pareto front</div>
                            <div><strong>SNS (Spread of Non-Dominated Solutions):</strong> Higher values indicate better distribution of solutions</div>
                            <div><strong>NPS (Number of Pareto Solutions):</strong> Higher values indicate more non-dominated solutions found</div>
                            <div><strong>Exec Time (Execution Time):</strong> Lower values indicate faster algorithm performance</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* PO-PQL Results */}
            {selectedTest === "po-pql-results" && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>{getParetoExampleText(selectedTest, selectedMH)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="h-96 flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                          <div className="text-muted-foreground">Loading data...</div>
                        </div>
                      </div>
                    ) : popqlResultVariants.length > 0 ? (
                      <ParetoChart variants={popqlResultVariants} />
                    ) : (
                      <div className="h-96 flex items-center justify-center text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Metrics Table */}
                {popqlResultMetrics.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-primary" />
                        Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg overflow-x-auto">
                        <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead rowSpan={2} className="font-semibold align-middle border-r">Jobs</TableHead>
                            <TableHead colSpan={2} className="text-center font-semibold border-b border-l">IGD</TableHead>
                            <TableHead colSpan={2} className="text-center font-semibold border-b border-l">SNS</TableHead>
                            <TableHead colSpan={2} className="text-center font-semibold border-b border-l">NPS</TableHead>
                            <TableHead colSpan={2} className="text-center font-semibold border-b border-l">Exec Time (s)</TableHead>
                          </TableRow>
                          <TableRow className="bg-muted/30">
                            <TableHead className="text-center border-l border-border">QL-{selectedMH}</TableHead>
                            <TableHead className="text-center">{selectedMH}</TableHead>
                            <TableHead className="text-center border-l border-border">QL-{selectedMH}</TableHead>
                            <TableHead className="text-center">{selectedMH}</TableHead>
                            <TableHead className="text-center border-l border-border">QL-{selectedMH}</TableHead>
                            <TableHead className="text-center">{selectedMH}</TableHead>
                            <TableHead className="text-center border-l border-border">QL-{selectedMH}</TableHead>
                            <TableHead className="text-center">{selectedMH}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {popqlResultMetrics.map((row, idx) => {
                            const approaches = [`QL-${selectedMH}`, selectedMH];
                            const bestValues: Record<string, number> = {};

                            ["IGD", "SNS", "NPS", "Exec_Time"].forEach(metric => {
                              const values = approaches
                                .map(approach => row[metric][approach])
                                .filter(v => typeof v === "number");

                              if (values.length > 0) {
                                bestValues[metric] =
                                  metric === "IGD" || metric === "Exec_Time"
                                    ? Math.min(...values)
                                    : Math.max(...values);
                              }
                            });

                            return (
                              <TableRow key={idx} className="hover:bg-muted/30">
                                {/* Jobs */}
                                <TableCell className="border-r font-medium">{row.No_Jobs}</TableCell>

                                {/* IGD */}
                                {approaches.map((approach, i) => {
                                  const value = row.IGD[approach];
                                  const formatted = typeof value === "number" ? value.toFixed(4) : "N/A";
                                  const isBest = typeof value === "number" && value === bestValues["IGD"];

                                  return (
                                    <TableCell
                                      key={`igd-${i}`}
                                      className={`text-center ${isBest ? "bg-primary/10 font-bold text-primary" : ""} ${i === 0 ? "border-l border-border" : ""}`}
                                    >
                                      {formatted}
                                      {isBest && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                                    </TableCell>
                                  );
                                })}

                                {/* SNS */}
                                {approaches.map((approach, i) => {
                                  const value = row.SNS[approach];
                                  const formatted = typeof value === "number" ? value.toFixed(4) : "N/A";
                                  const isBest = typeof value === "number" && value === bestValues["SNS"];

                                  return (
                                    <TableCell
                                      key={`sns-${i}`}
                                      className={`text-center ${isBest ? "bg-primary/10 font-bold text-primary" : ""} ${i === 0 ? "border-l border-border" : ""}`}
                                    >
                                      {formatted}
                                      {isBest && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                                    </TableCell>
                                  );
                                })}

                                {/* NPS */}
                                {approaches.map((approach, i) => {
                                  const value = row.NPS[approach];
                                  const formatted = value || "N/A";
                                  const isBest = typeof value === "number" && value === bestValues["NPS"];

                                  return (
                                    <TableCell
                                      key={`nps-${i}`}
                                      className={`text-center ${isBest ? "bg-primary/10 font-bold text-primary" : ""} ${i === 0 ? "border-l border-border" : ""}`}
                                    >
                                      {formatted}
                                      {isBest && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                                    </TableCell>
                                  );
                                })}

                                {/* Exec Time */}
                                {approaches.map((approach, i) => {
                                  const value = row["Exec_Time"][approach];
                                  const formatted = typeof value === "number" ? value.toFixed(3) : "N/A";
                                  const isBest = typeof value === "number" && value === bestValues["Exec_Time"];

                                  return (
                                    <TableCell
                                      key={`exec-${i}`}
                                      className={`text-center ${isBest ? "bg-primary/10 font-bold text-primary" : ""} ${i === 0 ? "border-l border-border" : ""}`}
                                    >
                                      {formatted}
                                      {isBest && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>

                      </div>
                      
                      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                        <div className="text-sm">
                          <div className="font-medium mb-2">Metric Descriptions:</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div><strong>IGD (Inverted Generational Distance):</strong> Lower values indicate better convergence to true Pareto front</div>
                            <div><strong>SNS (Spread of Non-Dominated Solutions):</strong> Higher values indicate better distribution of solutions</div>
                            <div><strong>NPS (Number of Pareto Solutions):</strong> Higher values indicate more non-dominated solutions found</div>
                            <div><strong>Exec Time (Execution Time):</strong> Lower values indicate faster algorithm performance</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

        {/* QL Counts */}
            {selectedTest === "ql-counts" && (
          <>
          {/* Insight card */}
          <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20">
            <CardHeader>
              <CardTitle className="text-blue-800 dark:text-blue-200 text-base">
                Operator Efficiency Insight (No QL)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                For the <strong>No QL</strong> approach, the best indicator of operator
                efficiency was <strong>the number of times each operator improved the solution</strong>, 
                highlighting the importance of tracking improvement frequency as a performance measure. 
                The tests were conducted on 30 instances of the VRF benchmark.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>QL Counts per Operator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {metaheuristics.map((mhItem) => (
                <div key={mhItem.value} className="space-y-4">
                  <div className="text-lg font-semibold">{mhItem.label}</div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* QL Chart */}
                    <div className="h-80 border rounded-lg p-4 bg-muted/30 shadow-sm">
                      <div className="text-sm font-medium mb-2">Count (QL)</div>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={buildBarData(
                            countsData[mhItem.value as keyof typeof countsData].ql
                          )}
                          margin={{ top: 10, right: 20, left: 10, bottom: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="operator"
                            tick={{ fontSize: 10 }}
                            interval={0}
                            angle={-20}
                            textAnchor="end"
                          />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="count"
                            fill="#22c55e"
                            name="QL"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
        
                    {/* No QL Chart */}
                    <div className="h-80 border rounded-lg p-4 bg-muted/30 shadow-sm">
                      <div className="text-sm font-medium mb-2">Count (no QL)</div>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={buildBarData(
                            countsData[mhItem.value as keyof typeof countsData].noql
                          )}
                          margin={{ top: 10, right: 20, left: 10, bottom: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="operator"
                            tick={{ fontSize: 10 }}
                            interval={0}
                            angle={-20}
                            textAnchor="end"
                          />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="count"
                            fill="#8D70FF"
                            name="No QL"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
              </>
            )}

            {/* Rewards Tests */}
            
            {selectedTest === "rewards-tests" && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>{getParetoExampleText(selectedTest, "HMOGVNS")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="h-96 flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                          <div className="text-muted-foreground">Loading data...</div>
                        </div>
                      </div>
                    ) : rewardsVariants.length > 0 ? (
                      <ParetoChart variants={rewardsVariants} />
                    ) : (
                      <div className="h-96 flex items-center justify-center text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Metrics Table */}
                {rewardsMetrics.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-primary" />
                        Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead rowSpan={2} className="font-semibold align-middle border-r">Instance</TableHead>
                              <TableHead rowSpan={2} className="font-semibold align-middle border-r">Jobs</TableHead>
                              <TableHead rowSpan={2} className="font-semibold align-middle border-r">Machines</TableHead>
                              <TableHead colSpan={3} className="text-center font-semibold border-b border-l">IGD</TableHead>
                              <TableHead colSpan={3} className="text-center font-semibold border-b border-l">SNS</TableHead>
                              <TableHead colSpan={3} className="text-center font-semibold border-b border-l">NPS</TableHead>
                              <TableHead colSpan={3} className="text-center font-semibold border-b border-l">Exec Time (s)</TableHead>
                            </TableRow>
                            <TableRow className="bg-muted/30">
                              <TableHead className="text-center border-l border-border">QL1-HMOGVNS</TableHead>
                              <TableHead className="text-center">QL2-HMOGVNS</TableHead>
                              <TableHead className="text-center">QL-HMOGVNS</TableHead>
                              <TableHead className="text-center border-l border-border">QL1-HMOGVNS</TableHead>
                              <TableHead className="text-center">QL2-HMOGVNS</TableHead>
                              <TableHead className="text-center">QL-HMOGVNS</TableHead>
                              <TableHead className="text-center border-l border-border">QL1-HMOGVNS</TableHead>
                              <TableHead className="text-center">QL2-HMOGVNS</TableHead>
                              <TableHead className="text-center">QL-HMOGVNS</TableHead>
                              <TableHead className="text-center border-l border-border">QL1-HMOGVNS</TableHead>
                              <TableHead className="text-center">QL2-HMOGVNS</TableHead>
                              <TableHead className="text-center">QL-HMOGVNS</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {rewardsMetrics.map((row, idx) => {
                              // Compute best values per metric row
                              const approaches = ["QL1-HMOGVNS", "QL2-HMOGVNS", "QL-HMOGVNS"];
                              const bestValues: Record<string, number> = {};
                              
                              ["IGD", "SNS", "NPS", "Exec_Time"].forEach(metric => {
                                let values = approaches
                                  .map(approach => row[metric][approach])
                                  .filter(v => typeof v === "number");
                                
                                if (values.length > 0) {
                                  // IGD, Exec_Time → minimize | SNS, NPS → maximize
                                  bestValues[metric] =
                                    metric === "IGD" || metric === "Exec_Time"
                                      ? Math.min(...values)
                                      : Math.max(...values);
                                }
                              });
                              
                              return (
                                <TableRow key={idx} className="hover:bg-muted/30">
                                  <TableCell className="border-r font-medium">{row.Instance}</TableCell>
                                  <TableCell className="border-r">{row.No_Jobs}</TableCell>
                                  <TableCell className="border-r">{row.No_of_machines}</TableCell>
                                  
                                  {/* IGD */}
                                  {approaches.map((approach, i) => {
                                    const value = row.IGD[approach];
                                    const formatted = typeof value === "number" ? value.toFixed(4) : "N/A";
                                    const isBest = typeof value === "number" && value === bestValues["IGD"];
                                    
                                    return (
                                      <TableCell
                                        key={`igd-${i}`}
                                        className={`text-center ${isBest ? "bg-primary/10 font-bold text-primary" : ""} ${i === 0 ? "border-l border-border" : ""}`}
                                      >
                                        {formatted}
                                        {isBest && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                                      </TableCell>
                                    );
                                  })}
                                  
                                  {/* SNS */}
                                  {approaches.map((approach, i) => {
                                    const value = row.SNS[approach];
                                    const formatted = typeof value === "number" ? value.toFixed(4) : "N/A";
                                    const isBest = typeof value === "number" && value === bestValues["SNS"];
                                    
                                    return (
                                      <TableCell
                                        key={`sns-${i}`}
                                        className={`text-center ${isBest ? "bg-primary/10 font-bold text-primary" : ""} ${i === 0 ? "border-l border-border" : ""}`}
                                      >
                                        {formatted}
                                        {isBest && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                                      </TableCell>
                                    );
                                  })}
                                  
                                  {/* NPS */}
                                  {approaches.map((approach, i) => {
                                    const value = row.NPS[approach];
                                    const formatted = value || "N/A";
                                    const isBest = typeof value === "number" && value === bestValues["NPS"];
                                    
                                    return (
                                      <TableCell
                                        key={`nps-${i}`}
                                        className={`text-center ${isBest ? "bg-primary/10 font-bold text-primary" : ""} ${i === 0 ? "border-l border-border" : ""}`}
                                      >
                                        {formatted}
                                        {isBest && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                                      </TableCell>
                                    );
                                  })}
                                  
                                  {/* Exec Time */}
                                  {approaches.map((approach, i) => {
                                    const value = row["Exec_Time"][approach];
                                    const formatted = typeof value === "number" ? value.toFixed(3) : "N/A";
                                    const isBest = typeof value === "number" && value === bestValues["Exec_Time"];
                                    
                                    return (
                                      <TableCell
                                        key={`exec-${i}`}
                                        className={`text-center ${isBest ? "bg-primary/10 font-bold text-primary" : ""} ${i === 0 ? "border-l border-border" : ""}`}
                                      >
                                        {formatted}
                                        {isBest && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>  
                      </div>
                      
                      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                        <div className="text-sm">
                          <div className="font-medium mb-2">Metric Descriptions:</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div><strong>IGD (Inverted Generational Distance):</strong> Lower values indicate better convergence to true Pareto front</div>
                            <div><strong>SNS (Spread of Non-Dominated Solutions):</strong> Higher values indicate better distribution of solutions</div>
                            <div><strong>NPS (Number of Pareto Solutions):</strong> Higher values indicate more non-dominated solutions found</div>
                            <div><strong>Exec Time (Execution Time):</strong> Lower values indicate faster algorithm performance</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Actions Tests */}
            
            {selectedTest === "actions-tests" && (
              <>
              {/* Random Operator Sequences */}
              <Card>
                  <CardHeader>
                    <CardTitle>Operator Sequences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2 text-sm">
                      {possibleOrders.map((seq, i) => (
                        <div key={i} className="flex flex-wrap items-center gap-2 font-mono">
                          <span className="text-gray-500">Order {i + 1}:</span>
                          {seq.map((op, j) => (
                            <span
                            key={j}
                            className={`inline-block px-3 py-1 rounded-xl text-xs font-semibold border transform transition-transform duration-200 hover:scale-105 ${operatorColors[op]}`}
                          >
                            {op}
                          </span>
                          
                          
                            
                          ))}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>{getParetoExampleText(selectedTest, "HMOGVNS")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="h-96 flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                          <div className="text-muted-foreground">Loading data...</div>
                        </div>
                      </div>
                    ) : actionsVariants.length > 0 ? (
                      <ParetoChart variants={actionsVariants} />
                    ) : (
                      <div className="h-96 flex items-center justify-center text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                
                {/* Metrics Table */}
                {actionsMetrics.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-primary" />
                        Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead rowSpan={2} className="font-semibold align-middle border-r">Instance</TableHead>
                              <TableHead rowSpan={2} className="font-semibold align-middle border-r">Jobs</TableHead>
                              <TableHead rowSpan={2} className="font-semibold align-middle border-r">Machines</TableHead>
                              <TableHead colSpan={2} className="text-center font-semibold border-b border-l">IGD</TableHead>
                              <TableHead colSpan={2} className="text-center font-semibold border-b border-l">SNS</TableHead>
                              <TableHead colSpan={2} className="text-center font-semibold border-b border-l">NPS</TableHead>
                              <TableHead colSpan={2} className="text-center font-semibold border-b border-l">Exec Time (s)</TableHead>
                            </TableRow>
                            <TableRow className="bg-muted/30">
                              <TableHead className="text-center border-l border-border">QL-HMOGVNS</TableHead>
                              <TableHead className="text-center">QL2-HMOGVNS</TableHead>
                              <TableHead className="text-center border-l border-border">QL-HMOGVNS</TableHead>
                              <TableHead className="text-center">QL2-HMOGVNS</TableHead>
                              <TableHead className="text-center border-l border-border">QL-HMOGVNS</TableHead>
                              <TableHead className="text-center">QL2-HMOGVNS</TableHead>
                              <TableHead className="text-center border-l border-border">QL-HMOGVNS</TableHead>
                              <TableHead className="text-center">QL2-HMOGVNS</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {actionsMetrics.map((row, idx) => {
                              // Compute best values per metric row
                              const approaches = ["QL-HMOGVNS", "QL2-HMOGVNS"];
                              const bestValues: Record<string, number> = {};
                              
                              ["IGD", "SNS", "NPS", "Exec_Time"].forEach(metric => {
                                let values = approaches
                                  .map(approach => row[metric][approach])
                                  .filter(v => typeof v === "number");
                                
                                if (values.length > 0) {
                                  // IGD, Exec_Time → minimize | SNS, NPS → maximize
                                  bestValues[metric] =
                                    metric === "IGD" || metric === "Exec_Time"
                                      ? Math.min(...values)
                                      : Math.max(...values);
                                }
                              });
                              
                              return (
                                <TableRow key={idx} className="hover:bg-muted/30">
                                  <TableCell className="border-r font-medium">{row.Instance}</TableCell>
                                  <TableCell className="border-r">{row.No_Jobs}</TableCell>
                                  <TableCell className="border-r">{row.No_of_machines}</TableCell>
                                  
                                  {/* IGD */}
                                  {approaches.map((approach, i) => {
                                    const value = row.IGD[approach];
                                    const formatted = typeof value === "number" ? value.toFixed(4) : "N/A";
                                    const isBest = typeof value === "number" && value === bestValues["IGD"];
                                    
                                    return (
                                      <TableCell
                                        key={`igd-${i}`}
                                        className={`text-center ${isBest ? "bg-primary/10 font-bold text-primary" : ""} ${i === 0 ? "border-l border-border" : ""}`}
                                      >
                                        {formatted}
                                        {isBest && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                                      </TableCell>
                                    );
                                  })}
                                  
                                  {/* SNS */}
                                  {approaches.map((approach, i) => {
                                    const value = row.SNS[approach];
                                    const formatted = typeof value === "number" ? value.toFixed(4) : "N/A";
                                    const isBest = typeof value === "number" && value === bestValues["SNS"];
                                    
                                    return (
                                      <TableCell
                                        key={`sns-${i}`}
                                        className={`text-center ${isBest ? "bg-primary/10 font-bold text-primary" : ""} ${i === 0 ? "border-l border-border" : ""}`}
                                      >
                                        {formatted}
                                        {isBest && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                                      </TableCell>
                                    );
                                  })}
                                  
                                  {/* NPS */}
                                  {approaches.map((approach, i) => {
                                    const value = row.NPS[approach];
                                    const formatted = value || "N/A";
                                    const isBest = typeof value === "number" && value === bestValues["NPS"];
                                    
                                    return (
                                      <TableCell
                                        key={`nps-${i}`}
                                        className={`text-center ${isBest ? "bg-primary/10 font-bold text-primary" : ""} ${i === 0 ? "border-l border-border" : ""}`}
                                      >
                                        {formatted}
                                        {isBest && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                                      </TableCell>
                                    );
                                  })}
                                  
                                  {/* Exec Time */}
                                  {approaches.map((approach, i) => {
                                    const value = row["Exec_Time"][approach];
                                    const formatted = typeof value === "number" ? value.toFixed(3) : "N/A";
                                    const isBest = typeof value === "number" && value === bestValues["Exec_Time"];
                                    
                                    return (
                                      <TableCell
                                        key={`exec-${i}`}
                                        className={`text-center ${isBest ? "bg-primary/10 font-bold text-primary" : ""} ${i === 0 ? "border-l border-border" : ""}`}
                                      >
                                        {formatted}
                                        {isBest && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                      
                      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                        <div className="text-sm">
                          <div className="font-medium mb-2">Metric Descriptions:</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div><strong>IGD (Inverted Generational Distance):</strong> Lower values indicate better convergence to true Pareto front</div>
                            <div><strong>SNS (Spread of Non-Dominated Solutions):</strong> Higher values indicate better distribution of solutions</div>
                            <div><strong>NPS (Number of Pareto Solutions):</strong> Higher values indicate more non-dominated solutions found</div>
                            <div><strong>Exec Time (Execution Time):</strong> Lower values indicate faster algorithm performance</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  }

  return null;
};

export default MORLPage;
