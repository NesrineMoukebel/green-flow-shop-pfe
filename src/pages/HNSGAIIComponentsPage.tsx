import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Info, Trophy, Settings2 } from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

type TestType = "crossover" | "nfs";

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

// Load CSV data for crossover test
const loadCrossoverData = async () => {
  try {
    const algorithms = [
      { name: "2PT-HNSGA-II", file: "M20_J400_config_6CW_2PT.csv" },
      { name: "PMX-HNSGA-II", file: "M20_J400_config_6CW_PMX.csv" }
    ];
    const paretoData: AlgorithmSeries[] = [];

    for (const algorithm of algorithms) {
      const response = await fetch(`./DATA/NSGA_page_tests/${algorithm.file}`);
      if (!response.ok) continue;
      
      const csvText = await response.text();
      const lines = csvText.trim().split('\n').slice(1); // Skip header
      
      const points: ScatterPoint[] = lines.map(line => {
        const [makespan, tec] = line.split(',').map(Number);
        return { makespan, tec };
      }).filter(p => !isNaN(p.makespan) && !isNaN(p.tec));
      
      const paretoPoints = getParetoFront(points);
      paretoData.push({ algorithm: algorithm.name, points: paretoPoints });
    }

    const metricsResponse = await fetch('./DATA/NSGA_page_tests/crossover_types.json');
    const metricsData = metricsResponse.ok ? await metricsResponse.json() : [];

    return { paretoData, metricsData };
  } catch (error) {
    console.error('Error loading crossover data:', error);
    throw error;
  }
};

// Load CSV data for NFS ratio test
const loadNFSData = async () => {
  try {
    const algorithms = [
      { name: "NR-HNSGA-II", file: "M5_J30_config_6CW_NFSR.csv" },
      { name: "NFS-HNSGA-II", file: "M5_J30_config_6CW_100NFS.csv" },
      { name: "R-HNSGA-II", file: "M5_J30_config_6CW_Random.csv" }
    ];
    const paretoData: AlgorithmSeries[] = [];

    for (const algorithm of algorithms) {
      const response = await fetch(`./DATA/NSGA_page_tests/${algorithm.file}`);
      if (!response.ok) continue;
      
      const csvText = await response.text();
      const lines = csvText.trim().split('\n').slice(1); // Skip header
      
      const points: ScatterPoint[] = lines.map(line => {
        const [makespan, tec] = line.split(',').map(Number);
        return { makespan, tec };
      }).filter(p => !isNaN(p.makespan) && !isNaN(p.tec));
      
      const paretoPoints = getParetoFront(points);
      paretoData.push({ algorithm: algorithm.name, points: paretoPoints });
    }

    const metricsResponse = await fetch('./DATA/NSGA_page_tests/nfs_ratio.json');
    const metricsData = metricsResponse.ok ? await metricsResponse.json() : [];

    return { paretoData, metricsData };
  } catch (error) {
    console.error('Error loading NFS data:', error);
    throw error;
  }
};

const HNSGAIIComponentsPage = () => {
  const navigate = useNavigate();
  const [test, setTest] = useState<TestType>("crossover");
  const [paretoData, setParetoData] = useState<AlgorithmSeries[]>([]);
  const [metricsData, setMetricsData] = useState<MetricsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (test === "crossover") {
      loadCrossoverData().then(data => {
        setParetoData(data.paretoData);
        setMetricsData(data.metricsData);
      }).catch(err => {
        console.error('Error loading crossover data:', err);
        setError('Failed to load crossover data');
      });
    } else {
      loadNFSData().then(data => {
        setParetoData(data.paretoData);
        setMetricsData(data.metricsData);
      }).catch(err => {
        console.error('Error loading NFS data:', err);
        setError('Failed to load NFS data');
      });
    }
  }, [test]);

  const handleRunSimulation = () => {
    setLoading(true);
    setError(null);
    
    if (test === "crossover") {
      loadCrossoverData().then(data => {
        setParetoData(data.paretoData);
        setMetricsData(data.metricsData);
      }).catch(err => {
        console.error('Error loading crossover data:', err);
        setError('Failed to load crossover data');
      }).finally(() => setLoading(false));
    } else {
      loadNFSData().then(data => {
        setParetoData(data.paretoData);
        setMetricsData(data.metricsData);
      }).catch(err => {
        console.error('Error loading NFS data:', err);
        setError('Failed to load NFS data');
      }).finally(() => setLoading(false));
    }
  };
// Determine example text based on scenario and selected MH
const getParetoExampleText = (scenario: string) => {
  if (scenario === "crossover") {
    return "Pareto fronts example - Instance 9, 400 jobs, 20 machines";
    
  } else if (scenario === "nfs") {
     return "Pareto fronts example - Instance 9, 30 jobs, 5 machines";
    
  }
  return "Pareto fronts example"; // default fallback
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
    "2PT-HNSGA-II": "#a855f7",
    "PMX-HNSGA-II": "#3b82f6",
    "NR-HNSGA-II": "#a855f7",
    "NFS-HNSGA-II": "#22c55e",
    "R-HNSGA-II": "#1f2937"
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
                  <SelectItem value="crossover">Crossover types tests</SelectItem>
                  <SelectItem value="nfs">NFS ratio tests</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              {test === "crossover" ? "Crossover Types" : "NFS Ratio Tests"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {test === "crossover" ? (
              <div className="p-3 bg-muted rounded-md">
                <div className="font-medium text-accent">Crossover Types</div>
                <div className="text-muted-foreground">
                  Compare Two-point crossover (2PT-HNSGA-II) and Partially Mapped Crossover (PMX-HNSGA-II) crossover operators for genetic algorithm performance.
                </div>
              </div>
            ) : (
              <>
                <div className="p-3 bg-muted rounded-md">
                  <div className="font-medium text-accent">NR-HNSGA-II</div>
                  <div className="text-muted-foreground">20% NFS, 80% Random</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="font-medium text-accent">NFS-HNSGA-II</div>
                  <div className="text-muted-foreground">100% generated with NFS heuristic</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="font-medium text-accent">R-HNSGA-II</div>
                  <div className="text-muted-foreground">100% generated with Random heuristic</div>
                </div>
              </>
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
                <h1 className="text-2xl font-bold text-foreground">HNSGA-II Components Tests</h1>
                <p className="text-muted-foreground">
                  {test === 'crossover' 
                    ? 'Compare 2PT-HNSGA-II and PMX-HNSGA-II crossover operators.' 
                    : 'Compare NR-HNSGA-II, NFS-HNSGA-II and R-HNSGA-II variants.'}
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
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;

                        const point = payload[0].payload; // the data point

                        return (
                          <div className="bg-white p-2 border rounded shadow text-sm">
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
                      {test === "crossover" ? (
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
                      {test === "crossover" ? (
                        <>
                          <TableHead className="text-center text-xs">2PT-HNSGA-II</TableHead>
                          <TableHead className="text-center text-xs">PMX-HNSGA-II</TableHead>
                          <TableHead className="text-center text-xs">2PT-HNSGA-II</TableHead>
                          <TableHead className="text-center text-xs">PMX-HNSGA-II</TableHead>
                          <TableHead className="text-center text-xs">2PT-HNSGA-II</TableHead>
                          <TableHead className="text-center text-xs">PMX-HNSGA-II</TableHead>
                          <TableHead className="text-center text-xs">2PT-HNSGA-II</TableHead>
                          <TableHead className="text-center text-xs">PMX-HNSGA-II</TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead className="text-center text-xs">NR-HNSGA-II</TableHead>
                          <TableHead className="text-center text-xs">NFS-HNSGA-II</TableHead>
                          <TableHead className="text-center text-xs">R-HNSGA-II</TableHead>
                          <TableHead className="text-center text-xs">NR-HNSGA-II</TableHead>
                          <TableHead className="text-center text-xs">NFS-HNSGA-II</TableHead>
                          <TableHead className="text-center text-xs">R-HNSGA-II</TableHead>
                          <TableHead className="text-center text-xs">NR-HNSGA-II</TableHead>
                          <TableHead className="text-center text-xs">NFS-HNSGA-II</TableHead>
                          <TableHead className="text-center text-xs">R-HNSGA-II</TableHead>
                          <TableHead className="text-center text-xs">NR-HNSGA-II</TableHead>
                          <TableHead className="text-center text-xs">NFS-HNSGA-II</TableHead>
                          <TableHead className="text-center text-xs">R-HNSGA-II</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metricsData.map((row, rowIndex) => {
                      const algorithms = test === "crossover" 
                        ? ['2PT-HNSGA-II', 'PMX-HNSGA-II'] 
                        : ['NR-HNSGA-II', 'NFS-HNSGA-II', 'R-HNSGA-II'];
                      
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

export default HNSGAIIComponentsPage;