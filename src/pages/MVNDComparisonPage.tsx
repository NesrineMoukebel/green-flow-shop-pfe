import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Trophy, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const scenarioOptions = [
  { label: "M-VND vs Standard VND", value: "mvnd-vs-standard" },
  { label: "MHs with M-VND vs without", value: "with-mvnd-vs-without" },
];

const metaheuristics = [
  { label: "HNSGA-II", value: "HNSGA-II" },
  { label: "HMOGVNS", value: "HMOGVNS" },
  { label: "HMOSA", value: "HMOSA" },
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

// Build label pairs based on scenario and metaheuristic
function getAlgorithmPair(scenario: string, mh: string) {
  if (scenario === "mvnd-vs-standard") {
    if (mh === "HNSGA-II") return ["HNSGA-II", "S-HNSGA-II"];
    if (mh === "HMOGVNS") return ["HMOGVNS", "S-HMOGVNS"];
    if (mh === "HMOSA") return ["HMOSA", "S-HMOSA"];
  } else {
    if (mh === "HNSGA-II") return ["HNSGA-II", "NSGA-II"];
    if (mh === "HMOGVNS") return ["HMOGVNS", "MOVNS"];
    if (mh === "HMOSA") return ["HMOSA", "MOSA"];
  }
  return [mh, mh];
}


// Load CSV data for M-VND comparison
const loadMVNDCSVData = async (scenario: string, metaheuristic: string) => {
  try {
    const basePath = scenario === "mvnd-vs-standard" 
      ? "../DATA/VND_tests/M-VNDvsS_VND" 
      : "../DATA/VND_tests/M-VNDvswithout";
    
    const [algA, algB] = getAlgorithmPair(scenario, metaheuristic);
    
    const files = [
      { name: algA, path: `${basePath}/${metaheuristic}.csv` },
      { name: algB, path: `${basePath}/${scenario === "mvnd-vs-standard" ? `S-${metaheuristic}` : (metaheuristic === "HNSGA-II" ? "NSGA-II" : metaheuristic === "HMOGVNS" ? "MOVNS" : "MOSA")}.csv` }
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
          algorithm: file.name,
          points: paretoPoints,
        });
      } catch (error) {
        console.warn(`Failed to load ${file.path}:`, error);
      }
    }
    
    return paretoData;
  } catch (error) {
    console.error('Error loading M-VND CSV data:', error);
    return [];
  }
};

// Load metrics JSON data
const loadMVNDMetricsData = async (scenario: string, metaheuristic: string) => {
  try {
    const basePath = scenario === "mvnd-vs-standard" 
      ? "../DATA/VND_tests/M-VNDvsS_VND" 
      : "../DATA/VND_tests/M-VNDvswithout";
    
    const response = await fetch(`${basePath}/${metaheuristic}.json`);
    if (!response.ok) {
      console.warn(`Failed to load metrics for ${metaheuristic}`);
      return [];
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading M-VND metrics data:', error);
    return [];
  }
};

function bestIndex(arr: number[], type: 'min' | 'max') {
  if (type === 'min') {
    const m = Math.min(...arr);
    return arr.findIndex(v => v === m);
  }
  const M = Math.max(...arr);
  return arr.findIndex(v => v === M);
}

const colors = {
  A: "#8D70FF",
  B: "#ef4444",
};

 

const MVNDComparisonPage = () => {
  const navigate = useNavigate();
  const [scenario, setScenario] = useState(scenarioOptions[0].value);
  const [mh, setMh] = useState(metaheuristics[0].value);
  const [paretoData, setParetoData] = useState([]);
  const [metricsData, setMetricsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);


  // Determine example text based on scenario and selected MH
const getParetoExampleText = (scenario: string, mh: string) => {
  if (scenario === "mvnd-vs-standard") {
    if (mh === "HNSGA-II") return "Pareto fronts example - Instance 1, 60 jobs, 10 machines";
    if (mh === "HMOGVNS") return "Pareto fronts example - Instance 6, 30 jobs, 10 machines";
    if (mh === "HMOSA") return "Pareto fronts example - Instance 9, 100 jobs, 20 machines";
  } else if (scenario === "with-mvnd-vs-without") {
    if (mh === "HNSGA-II") return "Pareto fronts example - Instance 6, 50 jobs, 15 machines";
    if (mh === "HMOGVNS") return "Pareto fronts example - Instance 1, 200 jobs, 40 machines";
    if (mh === "HMOSA") return "Pareto fronts example - Instance 5, 100 jobs, 20 machines";
  }
  return "Pareto fronts example"; // default fallback
};

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [csvData, jsonData] = await Promise.all([
        loadMVNDCSVData(scenario, mh),
        loadMVNDMetricsData(scenario, mh)
      ]);
      
      setParetoData(csvData);
      setMetricsData(jsonData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleScenarioChange = (value: string) => {
    setScenario(value);
  };

  const handleMetaheuristicChange = (value: string) => {
    setMh(value);
  };

  const handleRunSimulation = () => {
    loadData();
  };

  const [algA, algB] = getAlgorithmPair(scenario, mh);
  
  const points = paretoData.flatMap(a => a.points || []);
  const minMakespan = points.length > 0 ? Math.min(...points.map(p => p.makespan)) : 0;
  const maxMakespan = points.length > 0 ? Math.max(...points.map(p => p.makespan)) : 100;
  const minTec = points.length > 0 ? Math.min(...points.map(p => p.tec)) : 0;
  const maxTec = points.length > 0 ? Math.max(...points.map(p => p.tec)) : 100;

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
              <label className="text-sm font-medium">Test Type</label>
              <Select value={scenario} onValueChange={handleScenarioChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  {scenarioOptions.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Metaheuristic</label>
              <Select value={mh} onValueChange={handleMetaheuristicChange}>
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
            <Button variant="hero" className="w-full" onClick={handleRunSimulation} disabled={loading}>
              {loading ? "Loading..." : "Run Simulation"}
            </Button>
          </CardContent>
        </Card>

        {/* Test Descriptions */}
        <Card className="mt-6 shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">M-VND Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium text-accent">M-VND vs Standard VND</div>
              <div className="text-muted-foreground">Compares Modified VND against Standard VND implementations</div>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium text-accent">With M-VND vs Without</div>
              <div className="text-muted-foreground">Evaluates the impact of incorporating M-VND into metaheuristics</div>
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
                  M-VND Comparison
                </h1>
                <p className="text-muted-foreground">
                  Compare M-VND vs Standard and vs Non-M-VND variants
                </p>
              </div>
            </div>
          </div>
        </div>

        {(paretoData.length > 0 || loading || error) && (
          <div className="p-6 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>{getParetoExampleText(scenario, mh)}</CardTitle>
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
                          formatter={(value: any, name: any) => {
                            // 'name' comes from the dataKey
                            if (name === 'makespan') return [(value as number).toFixed(2), 'Makespan'];
                            if (name === 'tec') return [(value as number).toFixed(2), 'TEC'];
                            return [value, name];
                          }}
                        />

                        <Legend />
                        {paretoData.map((algorithm, idx) => (
                          <Scatter 
                            key={algorithm.algorithm} 
                            name={algorithm.algorithm} 
                            data={algorithm.points} 
                            fill={idx === 0 ? colors.A : colors.B} 
                            shape="circle" 
                          />
                        ))}
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
  <CardHeader className="pb-3">
    <CardTitle className="flex items-center gap-2 text-lg">
      <Trophy className="w-4 h-4 text-primary" />
      Performance Metrics 
    </CardTitle>
  </CardHeader>
  <CardContent className="pt-0">
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead rowSpan={2} className="font-semibold align-middle border-r-2 border-muted-foreground/30 py-2 text-sm">Instance</TableHead>
            <TableHead rowSpan={2} className="font-semibold align-middle border-r-2 border-muted-foreground/30 py-2 text-sm">Jobs</TableHead>
            <TableHead rowSpan={2} className="font-semibold align-middle border-r-2 border-muted-foreground/30 py-2 text-sm">Machines</TableHead>
            <TableHead colSpan={2} className="text-center font-semibold border-b border-r-2 border-muted-foreground/30 py-2 text-sm">IGD</TableHead>
            <TableHead colSpan={2} className="text-center font-semibold border-b border-r-2 border-muted-foreground/30 py-2 text-sm">SNS</TableHead>
            <TableHead colSpan={2} className="text-center font-semibold border-b border-r-2 border-muted-foreground/30 py-2 text-sm">NPS</TableHead>
            <TableHead colSpan={2} className="text-center font-semibold border-b py-2 text-sm">Exec Time</TableHead>
          </TableRow>
          <TableRow className="bg-muted/50">
            <TableHead className="text-center font-semibold border-b border-r-2 border-muted-foreground/30 py-1 text-xs">{algA}</TableHead>
            <TableHead className="text-center font-semibold border-b border-r-2 border-muted-foreground/30 py-1 text-xs">{algB}</TableHead>
            <TableHead className="text-center font-semibold border-b border-r-2 border-muted-foreground/30 py-1 text-xs">{algA}</TableHead>
            <TableHead className="text-center font-semibold border-b border-r-2 border-muted-foreground/30 py-1 text-xs">{algB}</TableHead>
            <TableHead className="text-center font-semibold border-b border-r-2 border-muted-foreground/30 py-1 text-xs">{algA}</TableHead>
            <TableHead className="text-center font-semibold border-b border-r-2 border-muted-foreground/30 py-1 text-xs">{algB}</TableHead>
            <TableHead className="text-center font-semibold border-b py-1 text-xs">{algA}</TableHead>
            <TableHead className="text-center font-semibold border-b py-1 text-xs">{algB}</TableHead>
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
              const [algA, algB] = getAlgorithmPair(scenario, mh);
              const igdValues = [group.algorithms[algA]?.igd || 0, group.algorithms[algB]?.igd || 0];
              const snsValues = [group.algorithms[algA]?.sns || 0, group.algorithms[algB]?.sns || 0];
              const npsValues = [group.algorithms[algA]?.nps || 0, group.algorithms[algB]?.nps || 0];
              const execValues = [group.algorithms[algA]?.exec_time || 0, group.algorithms[algB]?.exec_time || 0];

              const bestIgd = bestIndex(igdValues, 'min');
              const bestSns = bestIndex(snsValues, 'max');
              const bestNps = bestIndex(npsValues, 'max');
              const bestExec = bestIndex(execValues, 'min');

              return (
                <TableRow key={idx} className="hover:bg-muted/30">
                  <TableCell className="font-medium border-r-2 border-muted-foreground/30 py-1 text-sm">{group.instance}</TableCell>
                  <TableCell className="border-r-2 border-muted-foreground/30 py-1 text-sm">{group.jobs}</TableCell>
                  <TableCell className="border-r-2 border-muted-foreground/30 py-1 text-sm">{group.machines}</TableCell>
                  {igdValues.map((v, i) => (
                    <TableCell key={`igd-${i}`} className={`text-center py-1 text-sm ${i === 0 ? 'border-r-2 border-muted-foreground/30' : 'border-r-2 border-muted-foreground/30'} ${bestIgd === i ? 'bg-purple-100 font-bold text-purple-800' : ''}`}>
                      {v.toFixed(6)}
                      {bestIgd === i && <Trophy className="w-3 h-3 inline ml-1 text-purple-600" />}
                    </TableCell>
                  ))}
                  {snsValues.map((v, i) => (
                    <TableCell key={`sns-${i}`} className={`text-center py-1 text-sm ${i === 0 ? 'border-r-2 border-muted-foreground/30' : 'border-r-2 border-muted-foreground/30'} ${bestSns === i ? 'bg-purple-100 font-bold text-purple-800' : ''}`}>
                      {v.toFixed(2)}
                      {bestSns === i && <Trophy className="w-3 h-3 inline ml-1 text-purple-600" />}
                    </TableCell>
                  ))}
                  {npsValues.map((v, i) => (
                    <TableCell key={`nps-${i}`} className={`text-center py-1 text-sm ${i === 0 ? 'border-r-2 border-muted-foreground/30' : 'border-r-2 border-muted-foreground/30'} ${bestNps === i ? 'bg-purple-100 font-bold text-purple-800' : ''}`}>
                      {v}
                      {bestNps === i && <Trophy className="w-3 h-3 inline ml-1 text-purple-600" />}
                    </TableCell>
                  ))}
                  {execValues.map((v, i) => (
                    <TableCell key={`exec-${i}`} className={`text-center py-1 text-sm ${bestExec === i ? 'bg-purple-100 font-bold text-purple-800' : ''}`}>
                      {v.toFixed(2)}
                      {bestExec === i && <Trophy className="w-3 h-3 inline ml-1 text-purple-600" />}
                    </TableCell>
                  ))}
                </TableRow>
              );
            });
          })() : (
            <TableRow>
              <TableCell colSpan={11} className="text-center text-muted-foreground py-2">
                No metrics data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
    <div className="mt-3 p-2 bg-muted/30 rounded-lg">
      <div className="text-xs">
        <div className="font-medium mb-1">Metric Descriptions:</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs text-muted-foreground">
          <div><strong>IGD (Inverted Generational Distance):</strong> Lower is better</div>
          <div><strong>SNS (Spread of Non-dominated Solutions):</strong> Higher is better</div>
          <div><strong>NPS (Number of Pareto Solutions):</strong> Higher is better</div>
          <div><strong>Exec Time (Execution Time):</strong> Lower is better</div>
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

export default MVNDComparisonPage;

