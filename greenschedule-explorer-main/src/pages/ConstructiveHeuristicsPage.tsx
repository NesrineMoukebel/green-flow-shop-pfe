import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const metaheuristics = [
  { label: "HNSGA-II", value: "HNSGA-II" },
  { label: "HMOGVNS", value: "HMOGVNS" },
  { label: "HMOSA", value: "HMOSA" },
];

const heuristicVariants = [
  { name: "NEH", color: "#1f2937" },
  { name: "NFS", color: "#22c55e" },
  { name: "WNEH", color: "#ef4444" },
  { name: "Random", color: "#f59e42" },
];

// Mock data for 4 constructive heuristics for each metaheuristic
const mockParetoData = {
  "HNSGA-II": [
    { algorithm: "NFS-HNSGA-II", points: [ { makespan: 100, tec: 200 }, { makespan: 110, tec: 210 }, { makespan: 120, tec: 220 } ] },
    { algorithm: "NEH-HNSGA-II", points: [ { makespan: 105, tec: 205 }, { makespan: 115, tec: 215 }, { makespan: 125, tec: 225 } ] },
    { algorithm: "WNEH-HNSGA-II", points: [ { makespan: 102, tec: 202 }, { makespan: 112, tec: 212 }, { makespan: 122, tec: 222 } ] },
    { algorithm: "R-HNSGA-II", points: [ { makespan: 108, tec: 208 }, { makespan: 118, tec: 218 }, { makespan: 128, tec: 228 } ] },
  ],
  "HMOGVNS": [
    { algorithm: "NFS-HMOGVNS", points: [ { makespan: 90, tec: 180 }, { makespan: 95, tec: 185 }, { makespan: 100, tec: 190 } ] },
    { algorithm: "NEH-HMOGVNS", points: [ { makespan: 92, tec: 182 }, { makespan: 97, tec: 187 }, { makespan: 102, tec: 192 } ] },
    { algorithm: "WNEH-HMOGVNS", points: [ { makespan: 94, tec: 184 }, { makespan: 99, tec: 189 }, { makespan: 104, tec: 194 } ] },
    { algorithm: "R-HMOGVNS", points: [ { makespan: 96, tec: 186 }, { makespan: 101, tec: 191 }, { makespan: 106, tec: 196 } ] },
  ],
  "HMOSA": [
    { algorithm: "NFS-HMOSA", points: [ { makespan: 130, tec: 230 }, { makespan: 135, tec: 235 }, { makespan: 140, tec: 240 } ] },
    { algorithm: "NEH-HMOSA", points: [ { makespan: 132, tec: 232 }, { makespan: 137, tec: 237 }, { makespan: 142, tec: 242 } ] },
    { algorithm: "WNEH-HMOSA", points: [ { makespan: 134, tec: 234 }, { makespan: 139, tec: 239 }, { makespan: 144, tec: 244 } ] },
    { algorithm: "R-HMOSA", points: [ { makespan: 136, tec: 236 }, { makespan: 141, tec: 241 }, { makespan: 146, tec: 246 } ] },
  ],
};

// Mock metrics data for the table
const mockMetricsData = {
  "HNSGA-II": [
    {
      jobs: 10,
      machines: 5,
      instance: 1,
      IGD: [0.01, 0.02, 0.03, 0.004],
      SNS: [0.8, 0.7, 0.6, 0.5],
      NPS: [100, 90, 80, 70],
      Exec: [2.1, 2.2, 2.3, 2.4],
    },
  ],
  "HMOGVNS": [
    {
      jobs: 10,
      machines: 5,
      instance: 1,
      IGD: [0.015, 0.025, 0.035, 0.045],
      SNS: [0.82, 0.72, 0.62, 0.52],
      NPS: [110, 100, 90, 80],
      Exec: [2.5, 2.6, 2.7, 2.8],
    },
  ],
  "HMOSA": [
    {
      jobs: 10,
      machines: 5,
      instance: 1,
      IGD: [0.012, 0.022, 0.032, 0.042],
      SNS: [0.81, 0.71, 0.61, 0.51],
      NPS: [105, 95, 85, 75],
      Exec: [2.3, 2.4, 2.5, 2.6],
    },
  ],
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
  const [selected, setSelected] = useState(metaheuristics[0].value);
  const [paretoData, setParetoData] = useState(mockParetoData[selected]);
  const [metricsData, setMetricsData] = useState(mockMetricsData[selected]);

  useEffect(() => {
    setParetoData(mockParetoData[selected]);
    setMetricsData(mockMetricsData[selected]);
  }, [selected]);

  // Flatten all points for axis domain calculation
  const allPoints = paretoData.flatMap(a => a.points);
  const minMakespan = Math.min(...allPoints.map(p => p.makespan));
  const maxMakespan = Math.max(...allPoints.map(p => p.makespan));
  const minTec = Math.min(...allPoints.map(p => p.tec));
  const maxTec = Math.max(...allPoints.map(p => p.tec));

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/multi-objective")}
              className="hover:bg-muted"
            >
              Back to Menu
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Constructive Heuristics</h1>
              <p className="text-muted-foreground">Compare constructive heuristics for each metaheuristic variant</p>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Choose Metaheuristic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs">
              <Select value={selected} onValueChange={setSelected}>
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Algorithm Comparison - Pareto Fronts</CardTitle>
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
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value: any, name: any) => [
                      value.toFixed(2),
                      name === 'makespan' ? 'Makespan' : 'TEC',
                    ]}
                  />
                  <Legend />
                  {paretoData.map((algorithm, idx) => (
                    <Scatter
                      key={algorithm.algorithm}
                      name={algorithm.algorithm}
                      data={algorithm.points}
                      fill={heuristicVariants[idx].color}
                      shape="circle"
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
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
                    <TableHead rowSpan={2} className="font-semibold align-middle">Instance</TableHead>
                    <TableHead colSpan={4} className="text-center font-semibold border-b">IGD
                      <div className="text-xs font-normal text-muted-foreground">Inverted Generational Distance</div>
                    </TableHead>
                    <TableHead colSpan={4} className="text-center font-semibold border-b">SNS
                      <div className="text-xs font-normal text-muted-foreground">Spacing to Nearest Solution</div>
                    </TableHead>
                    <TableHead colSpan={4} className="text-center font-semibold border-b">NPS
                      <div className="text-xs font-normal text-muted-foreground">Number of Pareto Solutions</div>
                    </TableHead>
                    <TableHead colSpan={4} className="text-center font-semibold border-b">Execution Time
                      <div className="text-xs font-normal text-muted-foreground">Execution Time (seconds)</div>
                    </TableHead>
                  </TableRow>
                  <TableRow className="bg-muted/50">
                    {heuristicVariants.map((h) => (
                      <TableHead key={h.name + "-IGD"} className="text-center font-semibold border-b">{h.name}-{selected}</TableHead>
                    ))}
                    {heuristicVariants.map((h) => (
                      <TableHead key={h.name + "-SNS"} className="text-center font-semibold border-b">{h.name}-{selected}</TableHead>
                    ))}
                    {heuristicVariants.map((h) => (
                      <TableHead key={h.name + "-NPS"} className="text-center font-semibold border-b">{h.name}-{selected}</TableHead>
                    ))}
                    {heuristicVariants.map((h) => (
                      <TableHead key={h.name + "-Exec"} className="text-center font-semibold border-b">{h.name}-{selected}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metricsData.map((row, idx) => {
                    const bestIGD = getBestIndices(row.IGD, "IGD");
                    const bestSNS = getBestIndices(row.SNS, "SNS");
                    const bestNPS = getBestIndices(row.NPS, "NPS");
                    const bestExec = getBestIndices(row.Exec, "Exec");
                    return (
                      <TableRow key={idx} className="hover:bg-muted/30">
                        <TableCell>{row.jobs}</TableCell>
                        <TableCell>{row.machines}</TableCell>
                        <TableCell>{row.instance}</TableCell>
                        {row.IGD.map((val, i) => (
                          <TableCell key={"IGD-"+i} className={`text-center ${bestIGD.includes(i) ? 'bg-primary/10 font-bold text-primary' : ''}`}>
                            {val}
                            {bestIGD.includes(i) && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                          </TableCell>
                        ))}
                        {row.SNS.map((val, i) => (
                          <TableCell key={"SNS-"+i} className={`text-center ${bestSNS.includes(i) ? 'bg-primary/10 font-bold text-primary' : ''}`}>
                            {val}
                            {bestSNS.includes(i) && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                          </TableCell>
                        ))}
                        {row.NPS.map((val, i) => (
                          <TableCell key={"NPS-"+i} className={`text-center ${bestNPS.includes(i) ? 'bg-primary/10 font-bold text-primary' : ''}`}>
                            {val}
                            {bestNPS.includes(i) && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                          </TableCell>
                        ))}
                        {row.Exec.map((val, i) => (
                          <TableCell key={"Exec-"+i} className={`text-center ${bestExec.includes(i) ? 'bg-primary/10 font-bold text-primary' : ''}`}>
                            {val}
                            {bestExec.includes(i) && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {/* Legend */}
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <div className="text-sm">
                <div className="font-medium mb-2">Metric Descriptions:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div><strong>IGD (Inverted Generational Distance):</strong> Lower values indicate better convergence to true Pareto front</div>
                  <div><strong>SNS (Spacing to Nearest Solution):</strong> Higher values indicate better distribution of solutions</div>
                  <div><strong>NPS (Number of Pareto Solutions):</strong> Higher values indicate more non-dominated solutions found</div>
                  <div><strong>Execution Time:</strong> Lower values indicate faster algorithm performance</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConstructiveHeuristicsPage;
