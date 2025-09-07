import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Trophy } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter
} from "recharts";

type AlgorithmKey = "HMOSA" | "V1-HMOSA" | "V2-HMOSA";

interface WeightPoint {
  iteration: number;
  cmax: number;
  tec: number;
}

interface ScatterPoint {
  makespan: number;
  tec: number;
}

interface AlgorithmSeries {
  algorithm: AlgorithmKey;
  points: ScatterPoint[];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function buildWeightsSeries(scenario: string): WeightPoint[] {
  const fixedSequence: number[] = [0.5, 0.5, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8];
  const series: WeightPoint[] = [];
  for (let i = 1; i <= 10; i++) {
    const cmax = clamp(parseFloat(fixedSequence[i - 1].toFixed(2)), 0.1, 0.9);
    const tec = parseFloat((1 - cmax).toFixed(2));
    series.push({ iteration: i, cmax, tec });
  }
  return series;
}

function generateParetoFront(seed: number, bias: number): ScatterPoint[] {
  const points: ScatterPoint[] = [];
  for (let i = 0; i < 20; i++) {
    const ms = 100 + seed * 10 + i * (3 + bias) + (Math.sin(i + seed) * 2);
    const te = 50 + seed * 6 + (20 - i) * (2.5 - bias * 0.2) + (Math.cos(i + seed) * 1.5);
    points.push({ makespan: parseFloat(ms.toFixed(2)), tec: parseFloat(te.toFixed(2)) });
  }
  return points;
}

function generateSingleAlgorithmSeries(): AlgorithmSeries[] {
  return [
    { algorithm: "HMOSA", points: generateParetoFront(1, 0.2) },
    { algorithm: "V1-HMOSA", points: generateParetoFront(2, 0.05) },
    { algorithm: "V2-HMOSA", points: generateParetoFront(3, -0.1) },
  ];
}

interface MetricsRow {
  algorithm: string;
  igd: number;
  gd: number;
  sns: number;
  nps: number;
  exec_time: number;
}

function generateMetricsRows(): MetricsRow[] {
  return [
    {
      algorithm: "HMOSA",
      igd: 0.004523,
      gd: 1.234,
      sns: 0.789234,
      nps: 92,
      exec_time: 3.245
    },
    {
      algorithm: "V1-HMOSA",
      igd: 0.004789,
      gd: 1.156,
      sns: 0.801567,
      nps: 89,
      exec_time: 3.412
    },
    {
      algorithm: "V2-HMOSA",
      igd: 0.005134,
      gd: 1.089,
      sns: 0.765123,
      nps: 94,
      exec_time: 2.987
    }
  ];
}

const algorithmColors: Record<AlgorithmKey, string> = {
  HMOSA: "#3b82f6", // blue
  "V1-HMOSA": "#22c55e", // green
  "V2-HMOSA": "#a855f7", // purple
};

const SAWeightsPage = () => {
  const navigate = useNavigate();
  const [scenario, setScenario] = useState<"scenario1" | "scenario2" | "scenario3">("scenario1");

  const weightsData = useMemo(() => buildWeightsSeries(scenario), [scenario]);
  const paretoSeries = useMemo(() => generateSingleAlgorithmSeries(), []);
  const metricsRows = useMemo(() => generateMetricsRows(), []);

  // Helper function to determine if a value is the best
  const isBest = (value: number, column: string, allValues: number[]) => {
    if (column === 'igd' || column === 'gd' || column === 'exec_time') {
      return value === Math.min(...allValues);
    }
    return value === Math.max(...allValues);
  };

  // Extract values for each metric to determine best values
  const igdValues = metricsRows.map(d => d.igd);
  const gdValues = metricsRows.map(d => d.gd);
  const snsValues = metricsRows.map(d => d.sns);
  const npsValues = metricsRows.map(d => d.nps);
  const execTimeValues = metricsRows.map(d => d.exec_time);

  return (
    <div className="min-h-screen bg-gradient-secondary p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/multi-objective/sa-tests")}
          className="hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to SA Tests
        </Button>

        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Dynamic vs. Fixed weights
          </h1>
          <p className="text-muted-foreground">
            Dynamic weights in SA and comparative Pareto analysis.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle>Dynamic weights in SA</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Scenario:</span>
                <select
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value as any)}
                  className="h-9 px-3 rounded-md border bg-background"
                >
                  <option value="scenario1">Scenario 1 (±0.05 steps)</option>
                  <option value="scenario2">Scenario 2 (±0.08 steps)</option>
                  <option value="scenario3">Scenario 3 (±0.03 steps)</option>
                </select>
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
                  <Tooltip formatter={(value: any, name: any) => [
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
                    formatter={(value: any, name: any) => [
                      value.toFixed(2), 
                      name === 'makespan' ? 'Makespan' : 'TEC'
                    ]}
                  />
                  <Legend />
                  {paretoSeries.map((algo) => (
                    <Scatter
                      key={algo.algorithm}
                      name={algo.algorithm}
                      data={algo.points}
                      fill={algorithmColors[algo.algorithm]}
                      shape="circle"
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead rowSpan={2} className="font-semibold align-middle">Algorithm</TableHead>
                    <TableHead colSpan={1} className="text-center font-semibold border-b">
                      IGD
                      <div className="text-xs font-normal text-muted-foreground">
                        Inverted Generational Distance
                      </div>
                    </TableHead>
                    <TableHead colSpan={1} className="text-center font-semibold border-b">
                      GD
                      <div className="text-xs font-normal text-muted-foreground">
                        Generational Distance
                      </div>
                    </TableHead>
                    <TableHead colSpan={1} className="text-center font-semibold border-b">
                      SNS
                      <div className="text-xs font-normal text-muted-foreground">
                        Spacing to Nearest Solution
                      </div>
                    </TableHead>
                    <TableHead colSpan={1} className="text-center font-semibold border-b">
                      NPS
                      <div className="text-xs font-normal text-muted-foreground">
                        Number of Pareto Solutions
                      </div>
                    </TableHead>
                    <TableHead colSpan={1} className="text-center font-semibold border-b">
                      Exec Time
                      <div className="text-xs font-normal text-muted-foreground">
                        Execution Time (seconds)
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metricsRows.map((metric, index) => (
                    <TableRow key={index} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{metric.algorithm}</TableCell>
                      <TableCell className={`text-center ${isBest(metric.igd, 'igd', igdValues) ? 'bg-primary/10 font-bold text-primary' : ''}`}>
                        {metric.igd.toFixed(6)}
                        {isBest(metric.igd, 'igd', igdValues) && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                      </TableCell>
                      <TableCell className={`text-center ${isBest(metric.gd, 'gd', gdValues) ? 'bg-primary/10 font-bold text-primary' : ''}`}>
                        {metric.gd.toFixed(6)}
                        {isBest(metric.gd, 'gd', gdValues) && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                      </TableCell>
                      <TableCell className={`text-center ${isBest(metric.sns, 'sns', snsValues) ? 'bg-primary/10 font-bold text-primary' : ''}`}>
                        {metric.sns.toFixed(6)}
                        {isBest(metric.sns, 'sns', snsValues) && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                      </TableCell>
                      <TableCell className={`text-center ${isBest(metric.nps, 'nps', npsValues) ? 'bg-primary/10 font-bold text-primary' : ''}`}>
                        {metric.nps}
                        {isBest(metric.nps, 'nps', npsValues) && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                      </TableCell>
                      <TableCell className={`text-center ${isBest(metric.exec_time, 'exec_time', execTimeValues) ? 'bg-primary/10 font-bold text-primary' : ''}`}>
                        {metric.exec_time.toFixed(6)}
                        {isBest(metric.exec_time, 'exec_time', execTimeValues) && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Legend */}
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <div className="text-sm">
                <div className="font-medium mb-2">Metric Descriptions:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div><strong>IGD (Inverted Generational Distance):</strong> Lower values indicate better convergence to true Pareto front</div>
                  <div><strong>GD (Generational Distance):</strong> Lower values indicate better convergence</div>
                  <div><strong>SNS (Spacing to Nearest Solution):</strong> Higher values indicate better distribution of solutions</div>
                  <div><strong>NPS (Number of Pareto Solutions):</strong> Higher values indicate more non-dominated solutions found</div>
                  <div><strong>Exec Time (Execution Time):</strong> Lower values indicate faster algorithm performance</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SAWeightsPage;

