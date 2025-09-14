import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, ArrowLeft, Settings2 } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const metaheuristics = [
  { label: "HNSGA-II", value: "HNSGA-II" },
  { label: "HMOGVNS", value: "HMOGVNS" },
  { label: "HMOSA", value: "HMOSA" },
];

const heuristicVariants = [
  { name: "NFS", color: "#22c55e", label: "NFS" },
  { name: "NEH", color: "#ef4444", label: "NEH" },
  { name: "WNEH", color: "black", label: "WNEH" },
  { name: "R", color: "#8D70FF", label: "Random" },
];

// Pareto dominance filter
const getParetoFront = (points: { makespan: number; tec: number }[]) => {
  return points.filter((p, i) =>
    !points.some((q, j) =>
      j !== i &&
      q.makespan <= p.makespan &&
      q.tec <= p.tec &&
      (q.makespan < p.makespan || q.tec < p.tec)
    )
  );
};

// Load CSV data function
const loadCSVData = async (metaheuristic: string) => {
  try {
    const files = [
      { name: "NFS", path: `../DATA/Constructive_heuristics_tests/M5_J30_config_6CW_NFS-${metaheuristic}.csv` },
      { name: "NEH", path: `../DATA/Constructive_heuristics_tests/M5_J30_config_6CW_NEH-${metaheuristic}.csv` },
      { name: "WNEH", path: `../DATA/Constructive_heuristics_tests/M5_J30_config_6CW_WNEH_${metaheuristic}.csv` },
      { name: "R", path: `../DATA/Constructive_heuristics_tests/M5_J30_config_6CW_R-${metaheuristic}.csv` },
    ];

    const paretoData = [];
    
    for (const file of files) {
      try {
        const response = await fetch(file.path);
        if (!response.ok) continue;
        
        const text = await response.text();
        const lines = text.trim().split('\n');
        
        // Parse CSV data (assuming makespan,tec format)
        const points = lines.slice(1).map(line => {
          const parts = line.split(',');
          return {
            makespan: parseFloat(parts[0]),
            tec: parseFloat(parts[1]),
          };
        }).filter(p => !isNaN(p.makespan) && !isNaN(p.tec));
        
        // Apply Pareto dominance filter
        const paretoPoints = getParetoFront(points);
        
        paretoData.push({
          algorithm: `${file.name}-${metaheuristic}`,
          points: paretoPoints,
        });
      } catch (error) {
        console.warn(`Failed to load ${file.path}:`, error);
      }
    }
    
    return paretoData;
  } catch (error) {
    console.error('Error loading CSV data:', error);
    return [];
  }
};

// Load metrics JSON data
const loadMetricsData = async (metaheuristic: string) => {
  try {
    const response = await fetch(`../DATA/Constructive_heuristics_tests/${metaheuristic}_HEURISTICS.json`);
    if (!response.ok) {
      console.warn(`Failed to load metrics for ${metaheuristic}`);
      return [];
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading metrics data:', error);
    return [];
  }
};

// Helper to determine best value for each metric (lowest for IGD, Exec; highest for SNS, NPS)
function getBestIndices(arr, metric) {
  if (metric === "IGD" || metric === "Exec") {
    const min = Math.min(...arr);
    return arr.map((v, i) => v === min ? i : -1).filter(i => i !== -1);
  } else {
    const max = Math.max(...arr);
    return arr.map((v, i) => v === max ? i : -1).filter(i => i !== -1);
  }
}

const ConstructiveHeuristicsPage = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("HNSGA-II");
  const [paretoData, setParetoData] = useState([]);
  const [metricsData, setMetricsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data when component mounts (default to HNSGA-II)
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [csvData, jsonData] = await Promise.all([
        loadCSVData(selected),
        loadMetricsData(selected)
      ]);
      
      setParetoData(csvData);
      setMetricsData(jsonData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleMetaheuristicChange = (value: string) => {
    setSelected(value);
  };

  const handleRunSimulation = () => {
    loadData();
  };

  // Flatten all points for axis domain calculation
  const allPoints = paretoData.flatMap(a => a.points || []);
  const minMakespan = allPoints.length > 0 ? Math.min(...allPoints.map(p => p.makespan)) : 0;
  const maxMakespan = allPoints.length > 0 ? Math.max(...allPoints.map(p => p.makespan)) : 100;
  const minTec = allPoints.length > 0 ? Math.min(...allPoints.map(p => p.tec)) : 0;
  const maxTec = allPoints.length > 0 ? Math.max(...allPoints.map(p => p.tec)) : 100;

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
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Metaheuristic</label>
              <Select value={selected} onValueChange={handleMetaheuristicChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select metaheuristic" />
                </SelectTrigger>
                <SelectContent>
                  {metaheuristics.map((mh) => (
                    <SelectItem key={mh.value} value={mh.value}>{mh.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="hero" className="w-full" onClick={handleRunSimulation} disabled={loading}>
              {loading ? "Loading..." : "Run Simulation"}
            </Button>
          </CardContent>
        </Card>

        {/* Heuristics Description */}
        <Card className="mt-6 shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Constructive Heuristics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium text-accent">Random</div>
              <div className="text-muted-foreground">Generates random sequences for each machine</div>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium text-accent">NEH</div>
              <div className="text-muted-foreground">Adapted version of NEH for NPFS, where NEH is applied to each machine</div>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium text-accent">Weighted NEH</div>
              <div className="text-muted-foreground">Adapted version of NEH for NPFS, where it is is applied to each machine</div>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium text-accent">NFS Heuristic</div>
              <div className="text-muted-foreground">Modified version of the NFS heuristic for NPFS</div>
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
                onClick={() => navigate("/multi-objective/meta")}
                className="hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Components
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Constructive Heuristics
                </h1>
                <p className="text-muted-foreground">
                  Compare constructive heuristics for each metaheuristic variant
                </p>
              </div>
            </div>
          </div>
        </div>

        {(paretoData.length > 0 || loading || error) && (
          <div className="p-6 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Pareto Fronts example - Instance 8, 30 jobs, 5 machines</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-muted-foreground">Loading Pareto fronts...</div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-red-500">{error}</div>
                  </div>
                ) : paretoData.length === 0 ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-muted-foreground">No data available. Click "Run Simulation" to load results.</div>
                  </div>
                ) : (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="makespan" 
                          name="Makespan" 
                          type="number" 
                          domain={['dataMin', 'dataMax']} 
                          tick={{ fontSize: 12 }} 
                        />
                        <YAxis 
                          dataKey="tec" 
                          name="TEC" 
                          type="number" 
                          domain={['dataMin', 'dataMax']} 
                          tick={{ fontSize: 12 }} 
                        />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length > 0) {
                                const point = payload[0].payload;
                                return (
                                  <div className="bg-white p-2 border rounded shadow">
                                    <div>Makespan: {point.makespan.toFixed(2)}</div>
                                    <div>TEC: {point.tec.toFixed(2)}</div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />

                        <Legend />
                        // In the Scatter component, fix the color mapping logic:
                        {paretoData.map((algorithm, idx) => {
                          // Extract the heuristic name from the algorithm string
                          const heuristicName = algorithm.algorithm.split('-')[0];
                          const variant = heuristicVariants.find(v => v.name === heuristicName);
                          
                          return (
                            <Scatter 
                              key={algorithm.algorithm} 
                              name={algorithm.algorithm} 
                              data={algorithm.points} 
                              fill={variant?.color || `hsl(${idx * 90}, 70%, 50%)`} 
                              shape="circle" 
                            />
                          );
                        })}
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
  <CardHeader>
    <CardTitle>Algorithm Variants</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
      {/* NFS */}
      <Card className="p-2 text-center transition-transform duration-300 hover:scale-105 hover:shadow-md">
        <CardTitle className="text-sm mb-1 text-purple-600">NFS-{selected}</CardTitle>
        <p className="text-xs text-gray-600">
          {selected === "HNSGA-II"
            ? "20% using NFS heuristic, 80% random"
            : "Adapted NFS used for initial solution"}
        </p>
      </Card>

      {/* NEH */}
      <Card className="p-2 text-center transition-transform duration-300 hover:scale-105 hover:shadow-md">
        <CardTitle className="text-sm mb-1 text-purple-600">NEH-{selected}</CardTitle>
        <p className="text-xs text-gray-600">
          {selected === "HNSGA-II"
            ? "20% using adapted NEH heuristic, 80% random"
            : "Adapted NEH used for initial solution"}
        </p>
      </Card>

      {/* WNEH */}
      <Card className="p-2 text-center transition-transform duration-300 hover:scale-105 hover:shadow-md">
        <CardTitle className="text-sm mb-1 text-purple-600">WNEH-{selected}</CardTitle>
        <p className="text-xs text-gray-600">
          {selected === "HNSGA-II"
            ? "20% using adapted WNEH heuristic, 80% random"
            : "Adapted WNEH used for initial solution"}
        </p>
      </Card>

      {/* R */}
      <Card className="p-2 text-center transition-transform duration-300 hover:scale-105 hover:shadow-md">
        <CardTitle className="text-sm mb-1 text-purple-600">R-{selected}</CardTitle>
        <p className="text-xs text-gray-600">
          {selected === "HNSGA-II"
            ? "100% random"
            : "Random initial solution used"}
        </p>
      </Card>
    </div>
  </CardContent>
</Card>




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
            <TableHead rowSpan={2} className="font-semibold align-middle">No. Jobs</TableHead>
            <TableHead rowSpan={2} className="font-semibold align-middle">No. Machines</TableHead>
            <TableHead rowSpan={2} className="font-semibold align-middle border-r-2 border-muted-foreground/30">Instance</TableHead>
            <TableHead colSpan={4} className="text-center font-semibold border-b border-r-2 border-muted-foreground/30">
              IGD
              <div className="text-xs font-normal text-muted-foreground">Inverted Generational Distance</div>
            </TableHead>
            <TableHead colSpan={4} className="text-center font-semibold border-b border-r-2 border-muted-foreground/30">
              SNS
              <div className="text-xs font-normal text-muted-foreground">Spacing to Nearest Solution</div>
            </TableHead>
            <TableHead colSpan={4} className="text-center font-semibold border-b border-r-2 border-muted-foreground/30">
              NPS
              <div className="text-xs font-normal text-muted-foreground">Number of Pareto Solutions</div>
            </TableHead>
            <TableHead colSpan={4} className="text-center font-semibold border-b">
              Execution Time
              <div className="text-xs font-normal text-muted-foreground">Execution Time (seconds)</div>
            </TableHead>
          </TableRow>
          <TableRow className="bg-muted/50">
            {heuristicVariants.map((h) => (
              <TableHead key={h.name + "-IGD"} className="text-center font-semibold border-b border-r-2 border-muted-foreground/30">
                {h.name}-{selected}
              </TableHead>
            ))}
            {heuristicVariants.map((h) => (
              <TableHead key={h.name + "-SNS"} className="text-center font-semibold border-b border-r-2 border-muted-foreground/30">
                {h.name}-{selected}
              </TableHead>
            ))}
            {heuristicVariants.map((h) => (
              <TableHead key={h.name + "-NPS"} className="text-center font-semibold border-b border-r-2 border-muted-foreground/30">
                {h.name}-{selected}
              </TableHead>
            ))}
            {heuristicVariants.map((h) => (
              <TableHead key={h.name + "-Exec"} className="text-center font-semibold border-b">
                {h.name}-{selected}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {metricsData.length > 0 ? (() => {
            // Group data by instance
            const groupedData = metricsData.reduce((acc, item) => {
              const key = `${item.jobs}-${item.machines}-${item.instance}`;
              if (!acc[key]) {
                acc[key] = {
                  jobs: item.jobs,
                  machines: item.machines,
                  instance: item.instance,
                  algorithms: {}
                };
              }
              acc[key].algorithms[item.algorithm] = item;
              return acc;
            }, {});

            return Object.values(groupedData).map((group: any, idx) => {
              // Extract values for each metric across algorithms
              const variants = ['NFS', 'NEH', 'WNEH', 'R'];
              const igdValues = variants.map(v => group.algorithms[`${v}-${selected}`]?.igd || 0);
              const snsValues = variants.map(v => group.algorithms[`${v}-${selected}`]?.sns || 0);
              const npsValues = variants.map(v => group.algorithms[`${v}-${selected}`]?.nps || 0);
              const execValues = variants.map(v => group.algorithms[`${v}-${selected}`]?.exec_time || 0);

              const bestIGD = getBestIndices(igdValues, "IGD");
              const bestSNS = getBestIndices(snsValues, "SNS");
              const bestNPS = getBestIndices(npsValues, "NPS");
              const bestExec = getBestIndices(execValues, "Exec");

              return (
                <TableRow key={idx} className="hover:bg-muted/30">
                  <TableCell>{group.jobs}</TableCell>
                  <TableCell>{group.machines}</TableCell>
                  <TableCell className="border-r-2 border-muted-foreground/30">{group.instance}</TableCell>
                  {igdValues.map((val, i) => (
                    <TableCell key={`IGD-${i}`} className={`text-center border-r-2 border-muted-foreground/30 ${bestIGD.includes(i) ? 'bg-purple-100 font-bold text-purple-800' : ''}`}>
                      {val.toFixed(4)}
                      {bestIGD.includes(i) && <Trophy className="w-3 h-3 inline ml-1 text-purple-600" />}
                    </TableCell>
                  ))}
                  {snsValues.map((val, i) => (
                    <TableCell key={`SNS-${i}`} className={`text-center border-r-2 border-muted-foreground/30 ${bestSNS.includes(i) ? 'bg-purple-100 font-bold text-purple-800' : ''}`}>
                      {val.toFixed(2)}
                      {bestSNS.includes(i) && <Trophy className="w-3 h-3 inline ml-1 text-purple-600" />}
                    </TableCell>
                  ))}
                  {npsValues.map((val, i) => (
                    <TableCell key={`NPS-${i}`} className={`text-center border-r-2 border-muted-foreground/30 ${bestNPS.includes(i) ? 'bg-purple-100 font-bold text-purple-800' : ''}`}>
                      {val}
                      {bestNPS.includes(i) && <Trophy className="w-3 h-3 inline ml-1 text-purple-600" />}
                    </TableCell>
                  ))}
                  {execValues.map((val, i) => (
                    <TableCell key={`Exec-${i}`} className={`text-center ${bestExec.includes(i) ? 'bg-purple-100 font-bold text-purple-800' : ''}`}>
                      {val.toFixed(2)}
                      {bestExec.includes(i) && <Trophy className="w-3 h-3 inline ml-1 text-purple-600" />}
                    </TableCell>
                  ))}
                </TableRow>
              );
            });
          })() : (
            <TableRow>
              <TableCell colSpan={19} className="text-center text-muted-foreground">
                No metrics data available
              </TableCell>
            </TableRow>
          )}
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
        )}
      </div>
    </div>
  );
};

export default ConstructiveHeuristicsPage;
