import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Info, Trophy, Settings2 } from "lucide-react";
import {
  ScatterChart,
  LineChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Legend,
  Line
} from "recharts";

type TestType = "restart" | "weights";
type ScenarioType = "scenario1" | "scenario2" | "scenario3";

interface ScatterPoint {
  makespan: number;
  tec: number;
}

interface AlgorithmSeries {
  algorithm: string;
  points: ScatterPoint[];
}

interface MetricsData {
  instance: string;
  jobs: number;
  machines: number;
  algorithms: Record<string, {
    igd: number;
    sns: number;
    nps: number;
    exec_time: number;
  }>;
}

interface WeightPoint {
  iteration: number;
  cmax: number;
  tec: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function buildWeightsSeries(scenario: ScenarioType): WeightPoint[] {
  const series: WeightPoint[] = [];
  
  // Different scenarios with different weight patterns
  const scenarios = {
    scenario1: [0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.85], // ±0.05 steps
  };
  
  const cmaxWeights = scenarios[scenario];
  
  for (let i = 1; i <= 10; i++) {
    const cmax = clamp(parseFloat(cmaxWeights[i - 1].toFixed(2)), 0.1, 0.9);
    const tec = parseFloat((1 - cmax).toFixed(2));
    series.push({ iteration: i, cmax, tec });
  }
  return series;
}

// Pareto dominance filter
const getParetoFront = (points: ScatterPoint[]) => {
  return points.filter((p, i) =>
    !points.some((q, j) =>
      j !== i &&
      q.makespan <= p.makespan &&
      q.tec <= p.tec &&
      (q.makespan < p.makespan || q.tec < p.tec)
    )
  );
};

// Transform flat metrics data to grouped format
const transformMetricsData = (flatData: any[]): MetricsData[] => {
  const grouped = flatData.reduce((acc, item) => {
    const key = `${item.jobs}-${item.machines}-${item.instance}`;
    
    if (!acc[key]) {
      acc[key] = {
        instance: item.instance.toString(),
        jobs: item.jobs,
        machines: item.machines,
        algorithms: {}
      };
    }
    
    acc[key].algorithms[item.algorithm] = {
      igd: item.igd,
      sns: item.sns,
      nps: item.nps,
      exec_time: item.exec_time
    };
    
    return acc;
  }, {} as Record<string, MetricsData>);
  
  return Object.values(grouped);
};

// Load CSV data for restart test
const loadRestartData = async () => {
  try {
    const algorithms = ['HMOSA', 'HMOSA-'];
    const paretoData: AlgorithmSeries[] = [];

    for (const algorithm of algorithms) {
      const response = await fetch(`./DATA/HMOSA_tests/Restart/${algorithm}.csv`);
      if (!response.ok) continue;
      
      const csvText = await response.text();
      const lines = csvText.trim().split('\n').slice(1); // Skip header
      
      const points: ScatterPoint[] = lines.map(line => {
        const [makespan, tec] = line.split(',').map(Number);
        return { makespan, tec };
      }).filter(p => !isNaN(p.makespan) && !isNaN(p.tec));
      
      const paretoPoints = getParetoFront(points);
      paretoData.push({ algorithm, points: paretoPoints });
    }

    const metricsResponse = await fetch('./DATA/HMOSA_tests/restart.json');
    const flatMetricsData = metricsResponse.ok ? await metricsResponse.json() : [];
    
    // Transform flat data to grouped format
    const metricsData = transformMetricsData(flatMetricsData);

    return { paretoData, metricsData };
  } catch (error) {
    console.error('Error loading restart data:', error);
    throw error;
  }
};

// Load CSV data for weights test
const loadWeightsData = async () => {
  try {
    const algorithms = ['HMOSA', 'V1-HMOSA', 'V2-HMOSA'];
    const paretoData: AlgorithmSeries[] = [];

    for (const algorithm of algorithms) {
      const response = await fetch(`./DATA/HMOSA_tests/dynamic/${algorithm}.csv`);
      if (!response.ok) continue;
      
      const csvText = await response.text();
      const lines = csvText.trim().split('\n').slice(1); // Skip header
      
      const points: ScatterPoint[] = lines.map(line => {
        const [makespan, tec] = line.split(',').map(Number);
        return { makespan, tec };
      }).filter(p => !isNaN(p.makespan) && !isNaN(p.tec));
      
      const paretoPoints = getParetoFront(points);
      paretoData.push({ algorithm, points: paretoPoints });
    }

    const metricsResponse = await fetch('./DATA/HMOSA_tests/dynamicweights.json');
    const flatMetricsData = metricsResponse.ok ? await metricsResponse.json() : [];
    
    // Transform flat data to grouped format
    const metricsData = transformMetricsData(flatMetricsData);

    return { paretoData, metricsData };
  } catch (error) {
    console.error('Error loading weights data:', error);
    throw error;
  }
};

const HMOSAComponentsPage = () => {
  const navigate = useNavigate();
  const [test, setTest] = useState<TestType>("restart");
  const [scenario, setScenario] = useState<ScenarioType>("scenario1");
  const [weightsData, setWeightsData] = useState<WeightPoint[]>([]);
  const [paretoData, setParetoData] = useState<AlgorithmSeries[]>([]);
  const [metricsData, setMetricsData] = useState<MetricsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Determine example text based on scenario and selected MH
const getParetoExampleText = (scenario: string) => {
  if (scenario === "restart") {
    return "Pareto fronts example - Instance 4, 30 jobs, 15 machines";
    
  } else if (scenario === "weights") {
     return "Pareto fronts example - Instance 6, 10 jobs, 5 machines";
    
  }
  return "Pareto fronts example"; // default fallback
};

  // Update weights data when scenario changes
  useEffect(() => {
    setWeightsData(buildWeightsSeries(scenario));
  }, [scenario]);

  useEffect(() => {
    loadData();
  }, [test]);

  // Add the missing handleRunSimulation function
  const handleRunSimulation = () => {
    setLoading(true);
    setError(null);
    
    if (test === "restart") {
      loadRestartData().then(data => {
        setParetoData(data.paretoData);
        setMetricsData(data.metricsData);
      }).catch(err => {
        console.error('Error loading restart data:', err);
        setError('Failed to load restart data');
      }).finally(() => setLoading(false));
    } else {
      loadWeightsData().then(data => {
        setParetoData(data.paretoData);
        setMetricsData(data.metricsData);
      }).catch(err => {
        console.error('Error loading weights data:', err);
        setError('Failed to load weights data');
      }).finally(() => setLoading(false));
    }
  };

  // Add the loadData function
  const loadData = () => {
    setLoading(true);
    setError(null);
    
    if (test === "restart") {
      loadRestartData().then(data => {
        setParetoData(data.paretoData);
        setMetricsData(data.metricsData);
      }).catch(err => {
        console.error('Error loading restart data:', err);
        setError('Failed to load restart data');
      }).finally(() => setLoading(false));
    } else {
      loadWeightsData().then(data => {
        setParetoData(data.paretoData);
        setMetricsData(data.metricsData);
      }).catch(err => {
        console.error('Error loading weights data:', err);
        setError('Failed to load weights data');
      }).finally(() => setLoading(false));
    }
    
    // Initialize weights data
    setWeightsData(buildWeightsSeries(scenario));
  };

  const getBestIndices = (values: number[], metric: string) => {
    if (!values || values.length === 0) return [];
    const validValues = values.filter(v => !isNaN(v) && v !== undefined);
    if (validValues.length === 0) return [];
    
    const best = (metric === 'igd' || metric === 'exec_time') 
      ? Math.min(...validValues) 
      : Math.max(...validValues);
    
    return values.map((v, i) => (v === best ? i : -1)).filter(i => i !== -1);
  };

  // Calculate min/max for chart domains
  const allPoints = paretoData.flatMap(series => series.points);
  const minMakespan = allPoints.length > 0 ? Math.min(...allPoints.map(p => p.makespan)) * 0.95 : 0;
  const maxMakespan = allPoints.length > 0 ? Math.max(...allPoints.map(p => p.makespan)) * 1.05 : 100;
  const minTec = allPoints.length > 0 ? Math.min(...allPoints.map(p => p.tec)) * 0.95 : 0;
  const maxTec = allPoints.length > 0 ? Math.max(...allPoints.map(p => p.tec)) * 1.05 : 100;

  const colorMap = {
    "HMOSA": "#3b82f6",
    "HMOSA-": "#a855f7",
    "V1-HMOSA": "#22c55e",
    "V2-HMOSA": "#ef4444"
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-80 h-screen bg-card border-r border-border p-6 overflow-y-auto sticky top-0">
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings2 className="w-5 h-5 text-primary" /> Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Test Type</label>
              <Select value={test} onValueChange={(value) => setTest(value as TestType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restart">Restart Mechanism</SelectItem>
                  <SelectItem value="weights">Dynamic Weights</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Scenario selector - only show for weights test */}
            {/* {test === "weights" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Weight Scenario</label>
                <Select value={scenario} onValueChange={(value) => setScenario(value as ScenarioType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scenario1">Scenario 1 (±0.05 steps)</SelectItem>
                    <SelectItem value="scenario2">Scenario 2 (±0.08 steps)</SelectItem>
                    <SelectItem value="scenario3">Scenario 3 (±0.03 steps)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )} */}
            
            <Button 
              variant="hero" 
              className="w-full" 
              onClick={handleRunSimulation}
              disabled={loading}
            >
              {loading ? "Loading..." : "Run Simulation"}
            </Button>
          </CardContent>
        </Card>

        {/* Test Descriptions */}
        <Card className="mt-6 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" /> 
              {test === "restart" ? "Restart Mechanism" : "Dynamic Weights"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {test === "restart" ? (
              <div className="p-3 bg-muted rounded-md">
                <div className="font-medium text-accent">Restart Mechanism</div>
                <div className="text-muted-foreground">
                A restart mechanism resets the search from a random non-dominated solution after RstIter number of consecutive iterations without improvement, boosting diversification and avoiding premature convergence.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-md">
                  <div className="font-medium text-accent">Dynamic Weights</div>
                  <div className="text-muted-foreground">
                  Dynamic weights gradually adjust the focus between Cmax and TEC over iterations, while fixed weights keep the balance constant.
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="font-medium text-accent">Weight Scenarios</div>
                  <div className="text-muted-foreground">
                    Different patterns of weight adjustment during the simulated annealing process.
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header with Back to Components Button */}
        <div className="border-b border-border bg-card">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/multi-objective/meta")}
                className="hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Components
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">HMOSA Components Tests</h1>
                <p className="text-muted-foreground">
                  {test === 'restart' 
                    ? 'Compare HMOSA vs HMOSA- using Pareto fronts and metrics.' 
                    : 'Dynamic vs fixed-like variants and their Pareto/metrics.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {loading && <div className="text-muted-foreground">Loading data...</div>}

          {/* Dynamic Weights Chart - Only show for weights test */}
          {test === "weights" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle>Dynamic weights in SA</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Scenario: +0.05 steps</span>
                    
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightsData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="iteration" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0.1, 0.9]} tick={{ fontSize: 12 }} />
                      <RTooltip formatter={(value: any, name: any) => [
                        typeof value === 'number' ? value.toFixed(2) : value,
                        name === 'cmax' ? 'Cmax weight' : 'TEC weight',
                      ]} />
                      <Legend />
                      <Line type="monotone" dataKey="cmax" name="Cmax weight" stroke="#a855f7" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="tec" name="TEC weight" stroke="#22c55e" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Algorithm Comparison - Pareto Fronts */}
          <Card>
            <CardHeader>
              <CardTitle>{getParetoExampleText(test)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="makespan" 
                      name="Makespan" 
                      type="number" 
                      domain={[minMakespan, maxMakespan]} 
                      tick={{ fontSize: 12 }} 
                    />
                    <YAxis 
                      dataKey="tec" 
                      name="TEC" 
                      type="number" 
                      domain={[minTec, maxTec]} 
                      tick={{ fontSize: 12 }} 
                    />
                    <RTooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;

                        // Get the first payload object
                        const point = payload[0].payload;

                        return (
                          <div className="bg-white p-2 border rounded shadow">
                            <div>Makespan: {point.makespan.toFixed(2)}</div>
                            <div>TEC: {point.tec.toFixed(2)}</div>
                          </div>
                        );
                      }}
                    />

                    <Legend />
                    {paretoData.map(series => (
                      <Scatter 
                        key={series.algorithm} 
                        name={series.algorithm} 
                        data={series.points} 
                        fill={colorMap[series.algorithm as keyof typeof colorMap]} 
                        shape="circle" 
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
  <CardHeader>
    <CardTitle>Algorithm Variants</CardTitle>
  </CardHeader>
  <CardContent>
    <div
      className={`grid grid-cols-1 md:grid-cols-${test === "weights" ? "3" : "2"} gap-4 justify-center`}
    >
      {test === "weights" ? (
        <>
          <Card className="p-4 text-center transition-transform duration-300 hover:scale-105 hover:shadow-md">
            <CardTitle className="text-base mb-2 text-purple-600">HMOSA</CardTitle>
            <p className="text-sm text-gray-600">Dynamic weights</p>
          </Card>

          <Card className="p-4 text-center transition-transform duration-300 hover:scale-105 hover:shadow-md">
            <CardTitle className="text-base mb-2 text-purple-600">V1-HMOSA</CardTitle>
            <p className="text-sm text-gray-600">0.5 for Cmax, 0.5 for TEC</p>
          </Card>

          <Card className="p-4 text-center transition-transform duration-300 hover:scale-105 hover:shadow-md">
            <CardTitle className="text-base mb-2 text-purple-600">V2-HMOSA</CardTitle>
            <p className="text-sm text-gray-600">0.3 for Cmax, 0.7 for TEC</p>
          </Card>
        </>
      ) : test === "restart" ? (
        <>
          <Card className="p-4 text-center transition-transform duration-300 hover:scale-105 hover:shadow-md">
            <CardTitle className="text-base mb-2 text-purple-600">HMOSA</CardTitle>
            <p className="text-sm text-gray-600">HMOSA with restart mechanism</p>
          </Card>

          <Card className="p-4 text-center transition-transform duration-300 hover:scale-105 hover:shadow-md">
            <CardTitle className="text-base mb-2 text-purple-600">HMOSA-</CardTitle>
            <p className="text-sm text-gray-600">HMOSA without restart mechanism</p>
          </Card>
        </>
      ) : null}
    </div>
  </CardContent>
</Card>


          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" /> Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Instance</TableHead>
                      <TableHead>Jobs</TableHead>
                      <TableHead>Machines</TableHead>
                      {test === "restart" ? (
                        <>
                          <TableHead colSpan={2} className="text-center">IGD</TableHead>
                          <TableHead colSpan={2} className="text-center">SNS</TableHead>
                          <TableHead colSpan={2} className="text-center">NPS</TableHead>
                          <TableHead colSpan={2} className="text-center">Exec Time</TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead colSpan={3} className="text-center">IGD</TableHead>
                          <TableHead colSpan={3} className="text-center">SNS</TableHead>
                          <TableHead colSpan={3} className="text-center">NPS</TableHead>
                          <TableHead colSpan={3} className="text-center">Exec Time</TableHead>
                        </>
                      )}
                    </TableRow>
                    <TableRow className="bg-muted/30">
                      <TableHead></TableHead>
                      <TableHead></TableHead>
                      <TableHead></TableHead>
                      {test === "restart" ? (
                        <>
                          <TableHead className="text-center text-xs">HMOSA</TableHead>
                          <TableHead className="text-center text-xs">HMOSA-</TableHead>
                          <TableHead className="text-center text-xs">HMOSA</TableHead>
                          <TableHead className="text-center text-xs">HMOSA-</TableHead>
                          <TableHead className="text-center text-xs">HMOSA</TableHead>
                          <TableHead className="text-center text-xs">HMOSA-</TableHead>
                          <TableHead className="text-center text-xs">HMOSA</TableHead>
                          <TableHead className="text-center text-xs">HMOSA-</TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead className="text-center text-xs">HMOSA</TableHead>
                          <TableHead className="text-center text-xs">V1-HMOSA</TableHead>
                          <TableHead className="text-center text-xs">V2-HMOSA</TableHead>
                          <TableHead className="text-center text-xs">HMOSA</TableHead>
                          <TableHead className="text-center text-xs">V1-HMOSA</TableHead>
                          <TableHead className="text-center text-xs">V2-HMOSA</TableHead>
                          <TableHead className="text-center text-xs">HMOSA</TableHead>
                          <TableHead className="text-center text-xs">V1-HMOSA</TableHead>
                          <TableHead className="text-center text-xs">V2-HMOSA</TableHead>
                          <TableHead className="text-center text-xs">HMOSA</TableHead>
                          <TableHead className="text-center text-xs">V1-HMOSA</TableHead>
                          <TableHead className="text-center text-xs">V2-HMOSA</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metricsData.map((row, rowIndex) => {
                      const algorithms = test === "restart" ? ['HMOSA', 'HMOSA-'] : ['HMOSA', 'V1-HMOSA', 'V2-HMOSA'];
                      
                      // Get best values for each metric
                      const igdValues = algorithms.map(alg => row.algorithms[alg]?.igd || 0);
                      const snsValues = algorithms.map(alg => row.algorithms[alg]?.sns || 0);
                      const npsValues = algorithms.map(alg => row.algorithms[alg]?.nps || 0);
                      const execValues = algorithms.map(alg => row.algorithms[alg]?.exec_time || 0);
                      
                      const bestIGD = getBestIndices(igdValues, 'igd');
                      const bestSNS = getBestIndices(snsValues, 'sns');
                      const bestNPS = getBestIndices(npsValues, 'nps');
                      const bestExec = getBestIndices(execValues, 'exec_time');

                      return (
                        <TableRow key={rowIndex}>
                          <TableCell>{row.instance}</TableCell>
                          <TableCell>{row.jobs}</TableCell>
                          <TableCell>{row.machines}</TableCell>
                          
                          {/* IGD columns */}
                          {algorithms.map((alg, idx) => {
                            const value = row.algorithms[alg]?.igd;
                            const isBest = bestIGD.includes(idx);
                            return (
                              <TableCell 
                                key={`${alg}-igd`} 
                                className={`text-center ${isBest ? 'bg-purple-100 text-purple-800 font-bold' : ''}`}
                              >
                                {value ? value.toFixed(6) : '-'}
                                {isBest && <Trophy className="w-4 h-4 inline ml-1 text-purple-500" />}
                              </TableCell>
                            );
                          })}
                          
                          {/* SNS columns */}
                          {algorithms.map((alg, idx) => {
                            const value = row.algorithms[alg]?.sns;
                            const isBest = bestSNS.includes(idx);
                            return (
                              <TableCell 
                                key={`${alg}-sns`} 
                                className={`text-center ${isBest ? 'bg-purple-100 text-purple-800 font-bold' : ''}`}
                              >
                                {value ? value.toFixed(4) : '-'}
                                {isBest && <Trophy className="w-4 h-4 inline ml-1 text-purple-500" />}
                              </TableCell>
                            );
                          })}
                          
                          {/* NPS columns */}
                          {algorithms.map((alg, idx) => {
                            const value = row.algorithms[alg]?.nps;
                            const isBest = bestNPS.includes(idx);
                            return (
                              <TableCell 
                                key={`${alg}-nps`} 
                                className={`text-center ${isBest ? 'bg-purple-100 text-purple-800 font-bold' : ''}`}
                              >
                                {value ? Math.round(value) : '-'}
                                {isBest && <Trophy className="w-4 h-4 inline ml-1 text-purple-500" />}
                              </TableCell>
                            );
                          })}
                          
                          {/* Exec Time columns */}
                          {algorithms.map((alg, idx) => {
                            const value = row.algorithms[alg]?.exec_time;
                            const isBest = bestExec.includes(idx);
                            return (
                              <TableCell 
                                key={`${alg}-exec`} 
                                className={`text-center ${isBest ? 'bg-purple-100 text-purple-800 font-bold' : ''}`}
                              >
                                {value ? value.toFixed(2) : '-'}
                                {isBest && <Trophy className="w-4 h-4 inline ml-1 text-purple-500" />}
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
          <div><strong>SNS (Spread of Non-dominated Solutions):</strong> Higher values indicate better distribution of solutions</div>
          <div><strong>NPS (Number of Pareto Solutions):</strong> Higher values indicate more non-dominated solutions found</div>
          <div><strong>Execution Time:</strong> Lower values indicate faster algorithm performance</div>
        </div>
      </div>
    </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HMOSAComponentsPage;