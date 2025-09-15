import { useEffect, useState } from "react";
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
  gapModel: number;
  exec: number;
  gapHNSGA: number;
  gapHMOSA: number;
  gapHMOGVNS: number;
};

type RowTec = {
  jobs: number;
  machines: number;
  instance: number;
  tecModel: number;
  lower: number;
  gapTec: number;
  exec: number;
  gapHNSGA: number;
  gapHMOSA: number;
  gapHMOGVNS: number;
};

type RowLit = {
  jobs: number;
  machines: number;
  instance: number;
  gapHNSGA: number;
  gapHMOSA: number;
  gapHMOGVNS: number;
};

const ILPModelTestsPage = () => {
  const navigate = useNavigate();
  const [scenario, setScenario] = useState<string>(SCENARIOS[0].value);

  const [rowsCmax, setRowsCmax] = useState<RowCmax[]>([]);
  const [rowsTec, setRowsTec] = useState<RowTec[]>([]);
  const [rowsLit, setRowsLit] = useState<RowLit[]>([]);

  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

  // Load JSON data depending on scenario
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("../DATA/ILP_model_tests/" + scenario + ".json");
        const data = await response.json();
        if (scenario === "cmax") setRowsCmax(data);
        if (scenario === "tec") setRowsTec(data);
        if (scenario === "literature") setRowsLit(data);
      } catch (error) {
        console.error("Error loading JSON:", error);
      }
    };
    fetchData();
  }, [scenario]);

  return (
    <div className="min-h-screen bg-background flex">
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
                  {SCENARIOS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-500" /> Objective-specific models
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            We employ distinct ILP models for each objective (Cmax and TEC).
          </CardContent>
        </Card>
        <Card className="mt-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-500" /> Cmax lower bounds
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Cmax lower bounds are taken from (Benavides & Ritt, 2018).
          </CardContent>
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
                <p className="text-muted-foreground">
                  Compare ILP model results against proposed algorithms and literature
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className="p-6 space-y-8">
          {scenario === "cmax" && rowsCmax.length > 0 && (
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
                      <TableRow className="bg-muted/30">
                        <TableCell className="font-semibold" colSpan={5}>
                          Averages
                        </TableCell>
                        <TableCell className="font-semibold">
                          {avg(rowsCmax.map((r) => r.gapModel)).toFixed(3)}
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="font-semibold">
                          {avg(rowsCmax.map((r) => r.gapHNSGA)).toFixed(3)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {avg(rowsCmax.map((r) => r.gapHMOSA)).toFixed(3)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {avg(rowsCmax.map((r) => r.gapHMOGVNS)).toFixed(3)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {scenario === "tec" && rowsTec.length > 0 && (
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
                      <TableRow className="bg-muted/30">
                        <TableCell className="font-semibold" colSpan={5}>
                          Averages
                        </TableCell>
                        <TableCell className="font-semibold">
                          {avg(rowsTec.map((r) => r.gapTec)).toFixed(3)}
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="font-semibold">
                          {avg(rowsTec.map((r) => r.gapHNSGA)).toFixed(3)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {avg(rowsTec.map((r) => r.gapHMOSA)).toFixed(3)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {avg(rowsTec.map((r) => r.gapHMOGVNS)).toFixed(3)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {scenario === "literature" && rowsLit.length > 0 && (
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
                        <TableHead>Instances</TableHead>
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
                          <TableCell>{r.gapHNSGA.toFixed(3)}</TableCell>
                          <TableCell>{r.gapHMOSA.toFixed(3)}</TableCell>
                          <TableCell>{r.gapHMOGVNS.toFixed(3)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/30">
                        <TableCell className="font-semibold" colSpan={2}>
                          Averages
                        </TableCell>
                        <TableCell className="font-semibold">
                          {7.82.toFixed(3)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {20.87.toFixed(3)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {19.59.toFixed(3)}
                        </TableCell>
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
