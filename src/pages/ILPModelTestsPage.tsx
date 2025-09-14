import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SCENARIOS = [
  { label: "ILP vs Proposed (Cmax)", value: "cmax" },
  { label: "ILP vs Proposed (TEC)", value: "tec" },
  { label: "Comparison with Literature (Cmax)", value: "literature" },
];

type RowCmax = {
  jobs: number;
  machines: number;
  instance: number;
  model: number;
  lower: number;
  gapModel: number; // %
  exec: number; // seconds
  gapHNSGA: number;
  gapHMOSA: number;
  gapHMOGVNS: number;
};

type RowTec = Omit<RowCmax, 'model' | 'gapModel'> & { tecModel: number; gapTec: number };

type RowLit = {
  jobs: number;
  machines: number;
  instance: number;
  gapHNSGA: number;
  gapHMOSA: number;
  gapHMOGVNS: number;
};

function buildMockRowsCmax(): RowCmax[] {
  const configs = [
    { jobs: 10, machines: 5 },
    { jobs: 10, machines: 10 },
    { jobs: 10, machines: 15 },
  ];
  const rows: RowCmax[] = [];
  configs.forEach(cfg => {
    for (let i = 1; i <= 10; i++) {
      const model = 100 + i + cfg.machines;
      const lower = model - 5;
      const gapModel = ((model - lower) / lower) * 100;
      rows.push({
        jobs: cfg.jobs,
        machines: cfg.machines,
        instance: i,
        model,
        lower,
        gapModel,
        exec: 2 + (i * 0.1),
        gapHNSGA: 1 + (i % 3),
        gapHMOSA: 1.5 + ((i + 1) % 3),
        gapHMOGVNS: 0.8 + ((i + 2) % 3),
      });
    }
  });
  return rows;
}

function buildMockRowsTec(): RowTec[] {
  const base = buildMockRowsCmax();
  return base.map(r => ({
    jobs: r.jobs,
    machines: r.machines,
    instance: r.instance,
    tecModel: r.model * 1.5,
    lower: r.lower * 1.5,
    gapTec: r.gapModel,
    exec: r.exec,
    gapHNSGA: r.gapHNSGA + 0.2,
    gapHMOSA: r.gapHMOSA + 0.1,
    gapHMOGVNS: r.gapHMOGVNS + 0.05,
  }));
}

function buildMockRowsLit(): RowLit[] {
  const rows: RowLit[] = [];
  [5, 10, 15].forEach(m => {
    for (let i = 1; i <= 10; i++) {
      rows.push({ jobs: 10, machines: m, instance: i, gapHNSGA: 1 + (i % 3), gapHMOSA: 1.5 + ((i + 1) % 3), gapHMOGVNS: 0.8 + ((i + 2) % 3) });
    }
  });
  return rows;
}

const ILPModelTestsPage = () => {
  const navigate = useNavigate();
  const [scenario, setScenario] = useState<string>(SCENARIOS[0].value);

  const rowsCmax = useMemo(buildMockRowsCmax, []);
  const rowsTec = useMemo(buildMockRowsTec, []);
  const rowsLit = useMemo(buildMockRowsLit, []);

  const avg = (arr: number[]) => (arr.reduce((a, b) => a + b, 0) / arr.length);

  return (<div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-80 h-screen bg-card border-r border-border p-6 overflow-y-auto sticky top-0">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select value={scenario} onValueChange={setScenario}>
                <SelectTrigger>
                  <SelectValue placeholder="Select scenario" />
                </SelectTrigger>
                <SelectContent>
                  {SCENARIOS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* <Button variant="hero" className="w-full">Run Simulation</Button> */}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><Info className="w-4 h-4 text-purple-500" /> Objective-specific models</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">We employ distinct ILP models for each objective (Cmax and TEC).</CardContent>
        </Card>
        <Card className="mt-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><Info className="w-4 h-4 text-purple-500" /> Cmax lower bounds</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Cmax lower bounds are taken from (Benavides & Ritt, 2018).</CardContent>
        </Card>
        
      </div>

      {/* Main */}
      <div className="flex-1 overflow-auto">
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
                <h1 className="text-2xl font-bold text-foreground">ILP Model Tests</h1>
                <p className="text-muted-foreground">Compare ILP model results against proposed algorithms and literature</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">

        {scenario === 'cmax' && (
          <Card>
            <CardHeader>
              <CardTitle>ILP Model vs Proposed Algorithms (Cmax)</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="border rounded-lg max-h-96 overflow-y-auto overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10 text-primary">
                      <TableHead>Jobs</TableHead>
                      <TableHead>Machines</TableHead>
                      <TableHead>Instance</TableHead>
                      <TableHead>Cmax Model</TableHead>
                      <TableHead>Lower Bound</TableHead>
                      <TableHead>Gap Cmax(%)</TableHead>
                      <TableHead>Exec Time (s)</TableHead>
                      <TableHead>Gap HNSGA-II (%)</TableHead>
                      <TableHead>Gap HMOSA (%)</TableHead>
                      <TableHead>Gap HMOGVNS (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rowsCmax.map((r, idx) => (
                      <TableRow key={idx} className="hover:bg-muted/30">
                        <TableCell>{r.jobs}</TableCell>
                        <TableCell>{r.machines}</TableCell>
                        <TableCell>{r.instance}</TableCell>
                        <TableCell>{r.model}</TableCell>
                        <TableCell>{r.lower}</TableCell>
                        <TableCell>{r.gapModel.toFixed(3)}</TableCell>
                        <TableCell>{r.exec.toFixed(3)}</TableCell>
                        <TableCell>{r.gapHNSGA.toFixed(3)}</TableCell>
                        <TableCell>{r.gapHMOSA.toFixed(3)}</TableCell>
                        <TableCell>{r.gapHMOGVNS.toFixed(3)}</TableCell>
                      </TableRow>
                    ))}
                    {/* AVG Row for gaps */}
                    <TableRow className="bg-muted/30">
                      <TableCell className="font-semibold" colSpan={5}>Averages</TableCell>
                      <TableCell className="font-semibold">{avg(rowsCmax.map(r => r.gapModel)).toFixed(3)}</TableCell>
                      <TableCell></TableCell>
                      <TableCell className="font-semibold">{avg(rowsCmax.map(r => r.gapHNSGA)).toFixed(3)}</TableCell>
                      <TableCell className="font-semibold">{avg(rowsCmax.map(r => r.gapHMOSA)).toFixed(3)}</TableCell>
                      <TableCell className="font-semibold">{avg(rowsCmax.map(r => r.gapHMOGVNS)).toFixed(3)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {scenario === 'tec' && (
          <Card>
            <CardHeader>
              <CardTitle>ILP Model vs Proposed Algorithms (TEC)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg max-h-96 overflow-y-auto overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10 text-primary">
                      <TableHead>Jobs</TableHead>
                      <TableHead>Machines</TableHead>
                      <TableHead>Instance</TableHead>
                      <TableHead>TEC Model</TableHead>
                      <TableHead>Lower Bound</TableHead>
                      <TableHead>Gap TEC(%)</TableHead>
                      <TableHead>Exec Time (s)</TableHead>
                      <TableHead>Gap HNSGA-II (%)</TableHead>
                      <TableHead>Gap HMOSA (%)</TableHead>
                      <TableHead>Gap HMOGVNS (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rowsTec.map((r, idx) => (
                      <TableRow key={idx} className="hover:bg-muted/30">
                        <TableCell>{r.jobs}</TableCell>
                        <TableCell>{r.machines}</TableCell>
                        <TableCell>{r.instance}</TableCell>
                        <TableCell>{r.tecModel.toFixed(3)}</TableCell>
                        <TableCell>{r.lower.toFixed(3)}</TableCell>
                        <TableCell>{r.gapTec.toFixed(3)}</TableCell>
                        <TableCell>{r.exec.toFixed(3)}</TableCell>
                        <TableCell>{r.gapHNSGA.toFixed(3)}</TableCell>
                        <TableCell>{r.gapHMOSA.toFixed(3)}</TableCell>
                        <TableCell>{r.gapHMOGVNS.toFixed(3)}</TableCell>
                      </TableRow>
                    ))}
                    {/* AVG Row for gaps */}
                    <TableRow className="bg-muted/30">
                      <TableCell className="font-semibold" colSpan={5}>Averages</TableCell>
                      <TableCell className="font-semibold">{avg(rowsTec.map(r => r.gapTec)).toFixed(3)}</TableCell>
                      <TableCell></TableCell>
                      <TableCell className="font-semibold">{avg(rowsTec.map(r => r.gapHNSGA)).toFixed(3)}</TableCell>
                      <TableCell className="font-semibold">{avg(rowsTec.map(r => r.gapHMOSA)).toFixed(3)}</TableCell>
                      <TableCell className="font-semibold">{avg(rowsTec.map(r => r.gapHMOGVNS)).toFixed(3)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {scenario === 'literature' && (
          <Card>
            <CardHeader>
              <CardTitle>Comparison with Literature (Cmax)</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="border rounded-lg max-h-96 overflow-y-auto overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10 text-primary">
                      <TableHead>Jobs</TableHead>
                      <TableHead>Machines</TableHead>
                      <TableHead>Instance</TableHead>
                      <TableHead>Gap HNSGA-II (%)</TableHead>
                      <TableHead>Gap HMOSA (%)</TableHead>
                      <TableHead>Gap HMOGVNS (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rowsLit.map((r, idx) => (
                      <TableRow key={idx} className="hover:bg-muted/30">
                        <TableCell>{r.jobs}</TableCell>
                        <TableCell>{r.machines}</TableCell>
                        <TableCell>{r.instance}</TableCell>
                        <TableCell>{r.gapHNSGA.toFixed(3)}</TableCell>
                        <TableCell>{r.gapHMOSA.toFixed(3)}</TableCell>
                        <TableCell>{r.gapHMOGVNS.toFixed(3)}</TableCell>
                      </TableRow>
                    ))}
                    {/* AVG Row for gaps */}
                    <TableRow className="bg-muted/30">
                      <TableCell className="font-semibold" colSpan={3}>Averages</TableCell>
                      <TableCell className="font-semibold">{avg(rowsLit.map(r => r.gapHNSGA)).toFixed(3)}</TableCell>
                      <TableCell className="font-semibold">{avg(rowsLit.map(r => r.gapHMOSA)).toFixed(3)}</TableCell>
                      <TableCell className="font-semibold">{avg(rowsLit.map(r => r.gapHMOGVNS)).toFixed(3)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
};

export default ILPModelTestsPage;
