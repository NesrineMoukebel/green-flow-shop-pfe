import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Trophy } from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type AlgorithmKey = "HMOSA" | "HMOSA-";

interface ScatterPoint {
  makespan: number;
  tec: number;
}

interface AlgorithmSeries {
  algorithm: AlgorithmKey;
  points: ScatterPoint[];
}

function generateParetoFront(seed: number, bias: number): ScatterPoint[] {
  const points: ScatterPoint[] = [];
  // Generate 20 points roughly forming a Pareto front
  for (let i = 0; i < 20; i++) {
    const ms = 100 + seed * 10 + i * (3 + bias) + (Math.sin(i + seed) * 2);
    const te = 50 + seed * 6 + (20 - i) * (2.5 - bias * 0.2) + (Math.cos(i + seed) * 1.5);
    points.push({ makespan: parseFloat(ms.toFixed(2)), tec: parseFloat(te.toFixed(2)) });
  }
  return points;
}

function generateSingleSeries(): AlgorithmSeries[] {
  // Generate single Pareto comparison
  return [
    { algorithm: "HMOSA", points: generateParetoFront(1, 0.2) },
    { algorithm: "HMOSA-", points: generateParetoFront(2, -0.1) },
  ];
}

interface MetricsRow {
  instance: number;
  igd: { HMOSA: number; "HMOSA-": number };
  sns: { HMOSA: number; "HMOSA-": number };
  nps: { HMOSA: number; "HMOSA-": number };
  exec: { HMOSA: number; "HMOSA-": number };
}

function generateMetricsRows(): MetricsRow[] {
  const rows: MetricsRow[] = [];
  for (let i = 1; i <= 6; i++) {
    const base = 0.004 + i * 0.0006;
    rows.push({
      instance: i,
      igd: { HMOSA: parseFloat((base + 0.0005).toFixed(6)), "HMOSA-": parseFloat((base + 0.0012).toFixed(6)) },
      sns: { HMOSA: parseFloat((0.80 - i * 0.01).toFixed(6)), "HMOSA-": parseFloat((0.78 - i * 0.011).toFixed(6)) },
      nps: { HMOSA: 90 - i, "HMOSA-": 88 - i },
      exec: { HMOSA: parseFloat((3 + i * 0.3).toFixed(3)), "HMOSA-": parseFloat((2.8 + i * 0.28).toFixed(3)) },
    });
  }
  return rows;
}

const algorithmColors: Record<AlgorithmKey, string> = {
  HMOSA: "#3b82f6", // blue
  "HMOSA-": "#a855f7", // purple
};

const SARestartPage = () => {
  const navigate = useNavigate();

  const paretoSeries = useMemo(() => generateSingleSeries(), []);
  const metricsRows = useMemo(() => generateMetricsRows(), []);

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
            Restart mechanism in SA
          </h1>
          <p className="text-muted-foreground">
            Compare HMOSA vs HMOSA- using Pareto fronts and performance metrics.
          </p>
        </div>

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
              Performance Metrics (6 instances)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead rowSpan={2} className="font-semibold align-middle">Instance</TableHead>
                    <TableHead colSpan={2} className="text-center font-semibold border-b">IGD</TableHead>
                    <TableHead colSpan={2} className="text-center font-semibold border-b">SNS</TableHead>
                    <TableHead colSpan={2} className="text-center font-semibold border-b">NPS</TableHead>
                    <TableHead colSpan={2} className="text-center font-semibold border-b">Exec Time</TableHead>
                  </TableRow>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-center">HMOSA</TableHead>
                    <TableHead className="text-center">HMOSA-</TableHead>
                    <TableHead className="text-center">HMOSA</TableHead>
                    <TableHead className="text-center">HMOSA-</TableHead>
                    <TableHead className="text-center">HMOSA</TableHead>
                    <TableHead className="text-center">HMOSA-</TableHead>
                    <TableHead className="text-center">HMOSA</TableHead>
                    <TableHead className="text-center">HMOSA-</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metricsRows.map((row) => (
                    <TableRow key={row.instance} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{row.instance}</TableCell>
                      <TableCell className="text-center">{row.igd.HMOSA.toFixed(6)}</TableCell>
                      <TableCell className="text-center">{row.igd["HMOSA-"].toFixed(6)}</TableCell>
                      <TableCell className="text-center">{row.sns.HMOSA.toFixed(6)}</TableCell>
                      <TableCell className="text-center">{row.sns["HMOSA-"].toFixed(6)}</TableCell>
                      <TableCell className="text-center">{row.nps.HMOSA}</TableCell>
                      <TableCell className="text-center">{row.nps["HMOSA-"]}</TableCell>
                      <TableCell className="text-center">{row.exec.HMOSA.toFixed(3)}</TableCell>
                      <TableCell className="text-center">{row.exec["HMOSA-"].toFixed(3)}</TableCell>
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

export default SARestartPage;

