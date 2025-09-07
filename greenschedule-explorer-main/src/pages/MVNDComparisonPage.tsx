import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Trophy } from "lucide-react";
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

// Mock pareto data for the two algorithm variants
function buildMockPareto(algA: string, algB: string) {
  return [
    {
      algorithm: algA,
      points: [
        { makespan: 100, tec: 200 }, { makespan: 105, tec: 205 }, { makespan: 110, tec: 210 },
        { makespan: 115, tec: 215 }, { makespan: 120, tec: 218 },
      ]
    },
    {
      algorithm: algB,
      points: [
        { makespan: 98, tec: 205 }, { makespan: 103, tec: 207 }, { makespan: 112, tec: 212 },
        { makespan: 118, tec: 217 }, { makespan: 122, tec: 220 },
      ]
    }
  ];
}

// Mock metrics for 6 instances
function buildMockMetrics() {
  const rows = [] as Array<{ instance: number; jobs: number; machines: number; igd: number[]; sns: number[]; nps: number[]; exec: number[] }>;
  for (let i = 1; i <= 6; i++) {
    rows.push({
      instance: i,
      jobs: 30,
      machines: 10,
      igd: [0.01 + i * 0.001, 0.012 + i * 0.001],
      sns: [0.80 - i * 0.005, 0.82 - i * 0.005],
      nps: [100 - i, 102 - i],
      exec: [2 + i * 0.1, 1.8 + i * 0.1],
    });
  }
  return rows;
}

function bestIndex(arr: number[], type: 'min' | 'max') {
  if (type === 'min') {
    const m = Math.min(...arr);
    return arr.findIndex(v => v === m);
  }
  const M = Math.max(...arr);
  return arr.findIndex(v => v === M);
}

const colors = {
  A: "#22c55e",
  B: "#1f2937",
};

const MVNDComparisonPage = () => {
  const navigate = useNavigate();
  const [scenario, setScenario] = useState(scenarioOptions[0].value);
  const [mh, setMh] = useState(metaheuristics[0].value);

  const [algA, algB] = getAlgorithmPair(scenario, mh);
  const paretoData = buildMockPareto(algA, algB);
  const metrics = buildMockMetrics();

  const points = paretoData.flatMap(a => a.points);
  const minMakespan = Math.min(...points.map(p => p.makespan));
  const maxMakespan = Math.max(...points.map(p => p.makespan));
  const minTec = Math.min(...points.map(p => p.tec));
  const maxTec = Math.max(...points.map(p => p.tec));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/multi-objective")}
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">M-VND Comparison</h1>
              <p className="text-muted-foreground">Compare M-VND vs Standard and vs Non-M-VND variants</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Scenario</label>
              <Select value={scenario} onValueChange={setScenario}>
                <SelectTrigger>
                  <SelectValue placeholder="Select scenario" />
                </SelectTrigger>
                <SelectContent>
                  {scenarioOptions.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Metaheuristic</label>
              <Select value={mh} onValueChange={setMh}>
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

        {/* Pareto Fronts */}
        <Card>
          <CardHeader>
            <CardTitle>Algorithm Comparison - Pareto Fronts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="makespan" name="Makespan" type="number" domain={[minMakespan, maxMakespan]} tick={{ fontSize: 12 }} />
                  <YAxis dataKey="tec" name="TEC" type="number" domain={[minTec, maxTec]} tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value: any, name: any) => [value.toFixed(2), name === 'makespan' ? 'Makespan' : 'TEC']} />
                  <Legend />
                  <Scatter name={algA} data={paretoData[0].points} fill={colors.A} shape="circle" />
                  <Scatter name={algB} data={paretoData[1].points} fill={colors.B} shape="circle" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Performance Metrics (6 Instances)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead rowSpan={2} className="font-semibold align-middle">Instance</TableHead>
                    <TableHead rowSpan={2} className="font-semibold align-middle">Jobs</TableHead>
                    <TableHead rowSpan={2} className="font-semibold align-middle">Machines</TableHead>
                    <TableHead colSpan={2} className="text-center font-semibold border-b">IGD</TableHead>
                    <TableHead colSpan={2} className="text-center font-semibold border-b">SNS</TableHead>
                    <TableHead colSpan={2} className="text-center font-semibold border-b">NPS</TableHead>
                    <TableHead colSpan={2} className="text-center font-semibold border-b">Exec Time</TableHead>
                  </TableRow>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-center font-semibold border-b">{algA}</TableHead>
                    <TableHead className="text-center font-semibold border-b">{algB}</TableHead>
                    <TableHead className="text-center font-semibold border-b">{algA}</TableHead>
                    <TableHead className="text-center font-semibold border-b">{algB}</TableHead>
                    <TableHead className="text-center font-semibold border-b">{algA}</TableHead>
                    <TableHead className="text-center font-semibold border-b">{algB}</TableHead>
                    <TableHead className="text-center font-semibold border-b">{algA}</TableHead>
                    <TableHead className="text-center font-semibold border-b">{algB}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((row, idx) => {
                    const bestIgd = bestIndex(row.igd, 'min');
                    const bestSns = bestIndex(row.sns, 'max');
                    const bestNps = bestIndex(row.nps, 'max');
                    const bestExec = bestIndex(row.exec, 'min');
                    return (
                      <TableRow key={idx} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{row.instance}</TableCell>
                        <TableCell>{row.jobs}</TableCell>
                        <TableCell>{row.machines}</TableCell>
                        {row.igd.map((v, i) => (
                          <TableCell key={`igd-${i}`} className={`text-center ${bestIgd === i ? 'bg-primary/10 font-bold text-primary' : ''}`}>
                            {v.toFixed(6)}
                            {bestIgd === i && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                          </TableCell>
                        ))}
                        {row.sns.map((v, i) => (
                          <TableCell key={`sns-${i}`} className={`text-center ${bestSns === i ? 'bg-primary/10 font-bold text-primary' : ''}`}>
                            {v.toFixed(6)}
                            {bestSns === i && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                          </TableCell>
                        ))}
                        {row.nps.map((v, i) => (
                          <TableCell key={`nps-${i}`} className={`text-center ${bestNps === i ? 'bg-primary/10 font-bold text-primary' : ''}`}>
                            {v}
                            {bestNps === i && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                          </TableCell>
                        ))}
                        {row.exec.map((v, i) => (
                          <TableCell key={`exec-${i}`} className={`text-center ${bestExec === i ? 'bg-primary/10 font-bold text-primary' : ''}`}>
                            {v.toFixed(6)}
                            {bestExec === i && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
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
                  <div><strong>IGD (Inverted Generational Distance):</strong> Lower is better</div>
                  <div><strong>SNS (Spacing to Nearest Solution):</strong> Higher is better</div>
                  <div><strong>NPS (Number of Pareto Solutions):</strong> Higher is better</div>
                  <div><strong>Exec Time (Execution Time):</strong> Lower is better</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MVNDComparisonPage;

