import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";

const scenarioOptions = [
  { label: "Comparison between MOQL approaches", value: "moql" },
  { label: "Results of PO-PQL on metaheuristics", value: "pql" },
  { label: "QL counts", value: "ql-counts" },
  { label: "Rewards tests", value: "rewards-tests" },
  { label: "Actions tests", value: "actions-tests" },
];

const metaheuristics = [
  { label: "HNSGA-II", value: "HNSGA-II" },
  { label: "HMOGVNS", value: "HMOGVNS" },
  { label: "HMOSA", value: "HMOSA" },
];

function getMoqlVariants(mh: string) {
  return [
    `QL1-${mh}`,
    `QL2-${mh}`,
    `QL3-${mh}`,
    `QL-${mh}`,
  ];
}

function getPqlPair(mh: string) {
  return [`QL-${mh}`, mh];
}

function buildMockPareto(names: string[]) {
  return names.map((name, idx) => ({
    algorithm: name,
    points: [
      { makespan: 100 + idx * 3, tec: 200 + idx * 4 },
      { makespan: 105 + idx * 3, tec: 206 + idx * 4 },
      { makespan: 111 + idx * 3, tec: 212 + idx * 4 },
      { makespan: 118 + idx * 3, tec: 218 + idx * 4 },
    ]
  }));
}

const colors = ["#22c55e", "#1f2937", "#ef4444", "#8D70FF"]; // up to 4 series

function buildMock6InstanceMetrics(names: string[]) {
  const rows: Array<{ instance: number; jobs: number; machines: number; values: Record<string, { igd: number; sns: number; nps: number; exec: number }> }> = [];
  for (let i = 1; i <= 6; i++) {
    const entry: any = { instance: i, jobs: 30, machines: 10, values: {} };
    names.forEach((n, idx) => {
      entry.values[n] = { igd: 0.01 + i * 0.001 + idx * 0.002, sns: 0.8 - i * 0.005 - idx * 0.01, nps: 100 - i - idx * 2, exec: 2 + i * 0.1 + idx * 0.05 };
    });
    rows.push(entry);
  }
  return rows;
}

function buildMockMeansForJobs(names: string[]) {
  const jobSizes = [10, 20, 30, 40, 50, 60, 100, 200, 300, 400];
  return jobSizes.map((jobs) => {
    const row: any = { jobs, machines: 10, values: {} };
    names.forEach((n, idx) => {
      row.values[n] = { igd: 0.01 + jobs * 0.00001 + idx * 0.001, sns: 0.8 - jobs * 0.0001 - idx * 0.01, nps: 100 - Math.floor(jobs / 10) - idx * 3, exec: 2 + jobs * 0.005 + idx * 0.2 };
    });
    return row;
  });
}

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
    ql: [145.4, 120.6, 126.8, 157.0, 660.4],
    noql: [70.8, 0, 42.6, 8.8, 67.6],
  },
  "HMOSA": {
    ql: [811.33, 811.66, 825.0, 805.0, 789.0],
    noql: [38.0, 10.0, 30.0, 8.3, 3.3],
  },
} as const;

function buildBarData(values: number[]) {
  return operators.map((op, i) => ({ operator: op, count: values[i] }));
}

// Actions tests sequences
const actionOps = operators;
function generateRandomSequences(num: number) {
  const seqs: string[][] = [];
  for (let i = 0; i < num; i++) {
    const arr = [...actionOps];
    for (let j = arr.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [arr[j], arr[k]] = [arr[k], arr[j]];
    }
    seqs.push(arr);
  }
  return seqs;
}

const MORLPage = () => {
  const navigate = useNavigate();
  const [scenario, setScenario] = useState<string>(scenarioOptions[0].value);
  const [mh, setMh] = useState<string>(metaheuristics[0].value);

  const names = useMemo(() => scenario === 'moql' ? getMoqlVariants(mh) : getPqlPair(mh), [scenario, mh]);
  const pareto = useMemo(() => {
    if (scenario === 'rewards-tests') return buildMockPareto(["QL-HMOGVNS", "QL1-HMOGVNS", "QL2-HMOGVNS"]);
    if (scenario === 'actions-tests') return buildMockPareto(["QL-HMOGVNS", "QL2-HMOGVNS"]);
    if (scenario === 'ql-counts') return [];
    return buildMockPareto(names);
  }, [names, scenario]);

  const allPoints = pareto.flatMap(a => a.points);
  const minMakespan = allPoints.length ? Math.min(...allPoints.map(p => p.makespan)) : 0;
  const maxMakespan = allPoints.length ? Math.max(...allPoints.map(p => p.makespan)) : 1;
  const minTec = allPoints.length ? Math.min(...allPoints.map(p => p.tec)) : 0;
  const maxTec = allPoints.length ? Math.max(...allPoints.map(p => p.tec)) : 1;

  const sixInstMetrics = useMemo(() => {
    if (scenario === 'rewards-tests') return buildMock6InstanceMetrics(["QL-HMOGVNS", "QL1-HMOGVNS", "QL2-HMOGVNS"]);
    if (scenario === 'actions-tests') return buildMock6InstanceMetrics(["QL-HMOGVNS", "QL2-HMOGVNS"]);
    if (scenario === 'ql-counts') return [] as any;
    return buildMock6InstanceMetrics(names);
  }, [names, scenario]);

  const meansByJobs = useMemo(() => {
    if (scenario !== 'pql') return [] as any;
    return buildMockMeansForJobs(names);
  }, [names, scenario]);

  const showMhDropdown = scenario === 'moql' || scenario === 'pql';

  const actionSequences = useMemo(() => scenario === 'actions-tests' ? generateRandomSequences(9) : [], [scenario]);

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
              <h1 className="text-2xl font-bold text-foreground">MORL</h1>
              <p className="text-muted-foreground">Multi-objective reinforcement learning comparisons</p>
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
            {showMhDropdown && (
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
            )}
          </CardContent>
        </Card>

        {/* QL Counts */}
        {scenario === 'ql-counts' && (
          <Card>
            <CardHeader>
              <CardTitle>QL Counts per Operator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {metaheuristics.map((mhItem) => (
                <div key={mhItem.value} className="space-y-4">
                  <div className="text-lg font-semibold">{mhItem.label}</div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="h-72 border rounded p-4 bg-muted/30">
                      <div className="text-sm font-medium mb-2">Count (QL)</div>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={buildBarData(countsData[mhItem.value as keyof typeof countsData].ql)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="operator" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#22c55e" name="QL" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="h-72 border rounded p-4 bg-muted/30">
                      <div className="text-sm font-medium mb-2">Count (no QL)</div>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={buildBarData(countsData[mhItem.value as keyof typeof countsData].noql)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="operator" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#8D70FF" name="No QL" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Pareto Fronts for other scenarios */}
        {scenario !== 'ql-counts' && (
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
                    {pareto.map((series, idx) => (
                      <Scatter key={series.algorithm} name={series.algorithm} data={series.points} fill={colors[idx % colors.length]} shape="circle" />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metrics Tables */}
        {scenario === 'moql' && (
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
                    <TableRow className="bg-primary/10 text-primary">
                      <TableHead rowSpan={2}>Instance</TableHead>
                      <TableHead rowSpan={2}>Jobs</TableHead>
                      <TableHead rowSpan={2}>Machines</TableHead>
                      <TableHead colSpan={names.length} className="text-center">IGD</TableHead>
                      <TableHead colSpan={names.length} className="text-center">SNS</TableHead>
                      <TableHead colSpan={names.length} className="text-center">NPS</TableHead>
                      <TableHead colSpan={names.length} className="text-center">Exec</TableHead>
                    </TableRow>
                    <TableRow className="bg-primary/10 text-primary">
                      {names.map(n => <TableHead key={`igd-h-${n}`}>{n}</TableHead>)}
                      {names.map(n => <TableHead key={`sns-h-${n}`}>{n}</TableHead>)}
                      {names.map(n => <TableHead key={`nps-h-${n}`}>{n}</TableHead>)}
                      {names.map(n => <TableHead key={`exec-h-${n}`}>{n}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sixInstMetrics.map((row, idx) => (
                      <TableRow key={idx} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{row.instance}</TableCell>
                        <TableCell>{row.jobs}</TableCell>
                        <TableCell>{row.machines}</TableCell>
                        {names.map(n => <TableCell key={`igd-${idx}-${n}`}>{row.values[n].igd.toFixed(3)}</TableCell>)}
                        {names.map(n => <TableCell key={`sns-${idx}-${n}`}>{row.values[n].sns.toFixed(3)}</TableCell>)}
                        {names.map(n => <TableCell key={`nps-${idx}-${n}`}>{row.values[n].nps}</TableCell>)}
                        {names.map(n => <TableCell key={`exec-${idx}-${n}`}>{row.values[n].exec.toFixed(3)}</TableCell>)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {scenario === 'pql' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Mean Metrics by Jobs (10 sizes)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10 text-primary">
                      <TableHead rowSpan={2}>Jobs</TableHead>
                      <TableHead rowSpan={2}>Machines</TableHead>
                      <TableHead colSpan={names.length} className="text-center">IGD</TableHead>
                      <TableHead colSpan={names.length} className="text-center">SNS</TableHead>
                      <TableHead colSpan={names.length} className="text-center">NPS</TableHead>
                      <TableHead colSpan={names.length} className="text-center">Exec</TableHead>
                    </TableRow>
                    <TableRow className="bg-primary/10 text-primary">
                      {names.map(n => <TableHead key={`igd-mean-h-${n}`}>{n}</TableHead>)}
                      {names.map(n => <TableHead key={`sns-mean-h-${n}`}>{n}</TableHead>)}
                      {names.map(n => <TableHead key={`nps-mean-h-${n}`}>{n}</TableHead>)}
                      {names.map(n => <TableHead key={`exec-mean-h-${n}`}>{n}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meansByJobs.map((row, idx) => (
                      <TableRow key={idx} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{row.jobs}</TableCell>
                        <TableCell>10</TableCell>
                        {names.map(n => <TableCell key={`igd-mean-${idx}-${n}`}>{row.values[n].igd.toFixed(3)}</TableCell>)}
                        {names.map(n => <TableCell key={`sns-mean-${idx}-${n}`}>{row.values[n].sns.toFixed(3)}</TableCell>)}
                        {names.map(n => <TableCell key={`nps-mean-${idx}-${n}`}>{row.values[n].nps}</TableCell>)}
                        {names.map(n => <TableCell key={`exec-mean-${idx}-${n}`}>{row.values[n].exec.toFixed(3)}</TableCell>)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {scenario === 'rewards-tests' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Rewards Tests: Metrics (6 Instances)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10 text-primary">
                      <TableHead rowSpan={2}>Instance</TableHead>
                      <TableHead rowSpan={2}>Jobs</TableHead>
                      <TableHead rowSpan={2}>Machines</TableHead>
                      <TableHead colSpan={3} className="text-center">IGD</TableHead>
                      <TableHead colSpan={3} className="text-center">SNS</TableHead>
                      <TableHead colSpan={3} className="text-center">NPS</TableHead>
                      <TableHead colSpan={3} className="text-center">Exec</TableHead>
                    </TableRow>
                    <TableRow className="bg-primary/10 text-primary">
                      {(["QL-HMOGVNS", "QL1-HMOGVNS", "QL2-HMOGVNS"]).map(n => <TableHead key={`igd-rew-${n}`}>{n}</TableHead>)}
                      {(["QL-HMOGVNS", "QL1-HMOGVNS", "QL2-HMOGVNS"]).map(n => <TableHead key={`sns-rew-${n}`}>{n}</TableHead>)}
                      {(["QL-HMOGVNS", "QL1-HMOGVNS", "QL2-HMOGVNS"]).map(n => <TableHead key={`nps-rew-${n}`}>{n}</TableHead>)}
                      {(["QL-HMOGVNS", "QL1-HMOGVNS", "QL2-HMOGVNS"]).map(n => <TableHead key={`exec-rew-${n}`}>{n}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {buildMock6InstanceMetrics(["QL-HMOGVNS", "QL1-HMOGVNS", "QL2-HMOGVNS"]).map((row, idx) => (
                      <TableRow key={idx} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{row.instance}</TableCell>
                        <TableCell>{row.jobs}</TableCell>
                        <TableCell>{row.machines}</TableCell>
                        {["QL-HMOGVNS", "QL1-HMOGVNS", "QL2-HMOGVNS"].map(n => <TableCell key={`igd-rew-${idx}-${n}`}>{row.values[n].igd.toFixed(3)}</TableCell>)}
                        {["QL-HMOGVNS", "QL1-HMOGVNS", "QL2-HMOGVNS"].map(n => <TableCell key={`sns-rew-${idx}-${n}`}>{row.values[n].sns.toFixed(3)}</TableCell>)}
                        {["QL-HMOGVNS", "QL1-HMOGVNS", "QL2-HMOGVNS"].map(n => <TableCell key={`nps-rew-${idx}-${n}`}>{row.values[n].nps}</TableCell>)}
                        {["QL-HMOGVNS", "QL1-HMOGVNS", "QL2-HMOGVNS"].map(n => <TableCell key={`exec-rew-${idx}-${n}`}>{row.values[n].exec.toFixed(3)}</TableCell>)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {scenario === 'actions-tests' && (
          <Card>
            <CardHeader>
              <CardTitle>Actions Tests: Random Operator Sequences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1 text-sm">
                {actionSequences.map((seq, i) => (
                  <div key={i} className="font-mono">Order {i + 1}: {seq.join(" → ")}</div>
                ))}
              </div>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10 text-primary">
                      <TableHead rowSpan={2}>Instance</TableHead>
                      <TableHead rowSpan={2}>Jobs</TableHead>
                      <TableHead rowSpan={2}>Machines</TableHead>
                      <TableHead colSpan={2} className="text-center">IGD</TableHead>
                      <TableHead colSpan={2} className="text-center">SNS</TableHead>
                      <TableHead colSpan={2} className="text-center">NPS</TableHead>
                      <TableHead colSpan={2} className="text-center">Exec</TableHead>
                    </TableRow>
                    <TableRow className="bg-primary/10 text-primary">
                      {(["QL-HMOGVNS", "QL2-HMOGVNS"]).map(n => <TableHead key={`igd-act-${n}`}>{n}</TableHead>)}
                      {(["QL-HMOGVNS", "QL2-HMOGVNS"]).map(n => <TableHead key={`sns-act-${n}`}>{n}</TableHead>)}
                      {(["QL-HMOGVNS", "QL2-HMOGVNS"]).map(n => <TableHead key={`nps-act-${n}`}>{n}</TableHead>)}
                      {(["QL-HMOGVNS", "QL2-HMOGVNS"]).map(n => <TableHead key={`exec-act-${n}`}>{n}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {buildMock6InstanceMetrics(["QL-HMOGVNS", "QL2-HMOGVNS"]).map((row, idx) => (
                      <TableRow key={idx} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{row.instance}</TableCell>
                        <TableCell>{row.jobs}</TableCell>
                        <TableCell>{row.machines}</TableCell>
                        {["QL-HMOGVNS", "QL2-HMOGVNS"].map(n => <TableCell key={`igd-act-${idx}-${n}`}>{row.values[n].igd.toFixed(3)}</TableCell>)}
                        {["QL-HMOGVNS", "QL2-HMOGVNS"].map(n => <TableCell key={`sns-act-${idx}-${n}`}>{row.values[n].sns.toFixed(3)}</TableCell>)}
                        {["QL-HMOGVNS", "QL2-HMOGVNS"].map(n => <TableCell key={`nps-act-${idx}-${n}`}>{row.values[n].nps}</TableCell>)}
                        {["QL-HMOGVNS", "QL2-HMOGVNS"].map(n => <TableCell key={`exec-act-${idx}-${n}`}>{row.values[n].exec.toFixed(3)}</TableCell>)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MORLPage;
