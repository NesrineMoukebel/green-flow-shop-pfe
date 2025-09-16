import { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Calculator, Trophy } from "lucide-react";
import { ResponsiveContainer, ScatterChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Scatter } from "recharts";
import { dominates } from "@/services/dataService";

type AlgorithmKey = "HNSGA-II" | "HMOGVNS" | "HMOSA";

interface ScatterPoint { makespan: number; tec: number; }
interface AlgorithmSeries { algorithm: AlgorithmKey; points: ScatterPoint[]; }

function generateMockSeries(): AlgorithmSeries[] {
  const mk = (seed: number, bias: number) => new Array(20).fill(0).map((_, i) => ({
    makespan: +(120 + seed*7 + i*(3+bias) + Math.sin(i+seed)).toFixed(2),
    tec: +(60 + seed*4 + (20-i)*(2.3-bias*0.3) + Math.cos(i+seed)).toFixed(2),
  }));
  return [
    { algorithm: "HNSGA-II", points: mk(1, 0.1) },
    { algorithm: "HMOGVNS", points: mk(2, 0.0) },
    { algorithm: "HMOSA", points: mk(3, -0.1) },
  ];
}

const colors: Record<AlgorithmKey, string> = {
  "HNSGA-II": "#22c55e",
  "HMOGVNS": "#ef4444",
  "HMOSA": "#8D70FF",
};

const AdditionalDataPage = () => {
  const navigate = useNavigate();
  const [paretoSeries, setParetoSeries] = useState<AlgorithmSeries[]>([]);

  useEffect(() => {
    const loadPareto = async () => {
      const base = "./DATA/DATA_page";
      const files = [
        { alg: "HMOGVNS" as AlgorithmKey, path: `${base}/M20_J200_config_6CW_PS_1_HMOGVNS.csv` },
        { alg: "HMOSA" as AlgorithmKey, path: `${base}/M20_J200_config_6CW_PS_1_HMOSA.csv` },
        { alg: "HNSGA-II" as AlgorithmKey, path: `${base}/M20_J200_config_6CW_PS_1_HNSGA.csv` },
      ];
      const result: AlgorithmSeries[] = [];
      for (const f of files) {
        try {
          const res = await fetch(f.path);
          if (!res.ok) throw new Error("not ok");
          const text = await res.text();
          const lines = text.trim().split('\n').slice(1);
          const pointsAll = lines.map(l => {
            const [ms, te] = l.split(',');
            return { makespan: parseFloat(ms), tec: parseFloat(te) };
          });
          const points = pointsAll.filter((p1, i, arr) => !arr.some((p2, j) => j !== i && dominates([p2.makespan, p2.tec], [p1.makespan, p1.tec])));
          result.push({ algorithm: f.alg, points });
        } catch (e) {
          console.warn('PS/PB CSV load error, using mock for', f.alg);
          result.push({ algorithm: f.alg, points: generateMockSeries().find(s => s.algorithm === f.alg)!.points });
        }
      }
      setParetoSeries(result);
    };
    loadPareto();
  }, []);

  const [metricsRows, setMetricsRows] = useState<Array<{ jobs: number; values: Record<AlgorithmKey, { igd: number; sns: number; nps: number; exec_time: number }> }>>([]);

  useEffect(() => {
    const loadMetrics = async () => {
        try {
          const res = await fetch('/DATA/DATA_page/PS_PB_results.json');
          if (!res.ok) throw new Error('missing PS_PB_results.json');
          const json = await res.json();
          // Expect rows shaped: { jobs, variant, igd, sns, nps, exec_time }
          const map = new Map<number, any>();
          for (const r of json) {
            if (!map.has(r.jobs)) map.set(r.jobs, { jobs: r.jobs, values: {} });
            map.get(r.jobs).values[r.variant as AlgorithmKey] = {
              igd: +r.igd,
              sns: +r.sns,
              nps: +r.nps,
              exec_time: +r.exec_time
            };
          }
          setMetricsRows(Array.from(map.values()));
        } catch (e) {
          console.warn('Using real PS_PB metrics from Excel');
      
          const data = [
            { jobs: 10, igd: { 'HNSGA-II': 0.01, 'HMOGVNS': 0.05, 'HMOSA': 0.02 }, sns: { 'HNSGA-II': 0.799, 'HMOGVNS': 0.78, 'HMOSA': 0.797 }, nps: { 'HNSGA-II': 71.225, 'HMOGVNS': 43.275, 'HMOSA': 73.7 }, exec_time: { 'HNSGA-II': 6.8379, 'HMOGVNS': 5.1963, 'HMOSA': 10.2756 } },
            { jobs: 20, igd: { 'HNSGA-II': 0.006, 'HMOGVNS': 0.02, 'HMOSA': 0.01 }, sns: { 'HNSGA-II': 0.8, 'HMOGVNS': 0.796, 'HMOSA': 0.797 }, nps: { 'HNSGA-II': 108.7, 'HMOGVNS': 76.575, 'HMOSA': 99.1 }, exec_time: { 'HNSGA-II': 10.4108, 'HMOGVNS': 5.6042, 'HMOSA': 14.6535 } },
            { jobs: 30, igd: { 'HNSGA-II': 0.003, 'HMOGVNS': 0.015, 'HMOSA': 0.008 }, sns: { 'HNSGA-II': 0.809, 'HMOGVNS': 0.804, 'HMOSA': 0.8 }, nps: { 'HNSGA-II': 137.1375, 'HMOGVNS': 92.2125, 'HMOSA': 119.9375 }, exec_time: { 'HNSGA-II': 13.1681, 'HMOGVNS': 7.0822, 'HMOSA': 15.2817 } },
            { jobs: 40, igd: { 'HNSGA-II': 0.003, 'HMOGVNS': 0.013, 'HMOSA': 0.008 }, sns: { 'HNSGA-II': 0.81, 'HMOGVNS': 0.8, 'HMOSA': 0.8 }, nps: { 'HNSGA-II': 157.6875, 'HMOGVNS': 103.0625, 'HMOSA': 132.5625 }, exec_time: { 'HNSGA-II': 16.2567, 'HMOGVNS': 9.1069, 'HMOSA': 20.3275 } },
            { jobs: 50, igd: { 'HNSGA-II': 0.002, 'HMOGVNS': 0.014, 'HMOSA': 0.009 }, sns: { 'HNSGA-II': 0.81, 'HMOGVNS': 0.809, 'HMOSA': 0.8 }, nps: { 'HNSGA-II': 174.8125, 'HMOGVNS': 105.45, 'HMOSA': 135.3125 }, exec_time: { 'HNSGA-II': 20.0512, 'HMOGVNS': 8.8296, 'HMOSA': 25.1526 } },
            { jobs: 60, igd: { 'HNSGA-II': 0.002, 'HMOGVNS': 0.012, 'HMOSA': 0.008 }, sns: { 'HNSGA-II': 0.818, 'HMOGVNS': 0.817, 'HMOSA': 0.809 }, nps: { 'HNSGA-II': 181.025, 'HMOGVNS': 120.9, 'HMOSA': 152.675 }, exec_time: { 'HNSGA-II': 20.6095, 'HMOGVNS': 14.2318, 'HMOSA': 55.1063 } },
            { jobs: 100, igd: { 'HNSGA-II': 0.001, 'HMOGVNS': 0.08, 'HMOSA': 0.09 }, sns: { 'HNSGA-II': 0.8, 'HMOGVNS': 0.764, 'HMOSA': 0.763 }, nps: { 'HNSGA-II': 145.4333, 'HMOGVNS': 59.55, 'HMOSA': 65.1167 }, exec_time: { 'HNSGA-II': 79.3215, 'HMOGVNS': 31.1625, 'HMOSA': 143.7154 } },
            { jobs: 200, igd: { 'HNSGA-II': 0.0008, 'HMOGVNS': 0.06, 'HMOSA': 0.05 }, sns: { 'HNSGA-II': 0.799, 'HMOGVNS': 0.767, 'HMOSA': 0.764 }, nps: { 'HNSGA-II': 178.5333, 'HMOGVNS': 75.5167, 'HMOSA': 82.5333 }, exec_time: { 'HNSGA-II': 145.0668, 'HMOGVNS': 95.9483, 'HMOSA': 678.5886 } },
            { jobs: 300, igd: { 'HNSGA-II': 0.0004, 'HMOGVNS': 0.056, 'HMOSA': 0.065 }, sns: { 'HNSGA-II': 0.8, 'HMOGVNS': 0.78, 'HMOSA': 0.74 }, nps: { 'HNSGA-II': 196.8667, 'HMOGVNS': 87.5, 'HMOSA': 51.9333 }, exec_time: { 'HNSGA-II': 275.6937, 'HMOGVNS': 150.0738, 'HMOSA': 345.4228 } },
            { jobs: 400, igd: { 'HNSGA-II': 0.0006, 'HMOGVNS': 0.047, 'HMOSA': 0.049 }, sns: { 'HNSGA-II': 0.81, 'HMOGVNS': 0.78, 'HMOSA': 0.75 }, nps: { 'HNSGA-II': 198.1333, 'HMOGVNS': 97.55, 'HMOSA': 62.0667 }, exec_time: { 'HNSGA-II': 321.0540, 'HMOGVNS': 272.1262, 'HMOSA': 352.4548 } }
          ];
      
          setMetricsRows(data.map(d => ({
            jobs: d.jobs,
            values: {
              'HNSGA-II': { 
                igd: d.igd['HNSGA-II'],  // keep as number exactly from data
                sns: d.sns['HNSGA-II'], 
                nps: d.nps['HNSGA-II'], 
                exec_time: d.exec_time['HNSGA-II'] 
              },
              'HMOGVNS': { 
                igd: d.igd['HMOGVNS'], 
                sns: d.sns['HMOGVNS'], 
                nps: d.nps['HMOGVNS'], 
                exec_time: d.exec_time['HMOGVNS'] 
              },
              'HMOSA': { 
                igd: d.igd['HMOSA'], 
                sns: d.sns['HMOSA'], 
                nps: d.nps['HMOSA'], 
                exec_time: d.exec_time['HMOSA'] 
              },
            } as Record<AlgorithmKey, { igd: number; sns: number; nps: number; exec_time: number }>
          })));
          
        }
      };
      
    loadMetrics();
  }, []);

  const equalColor = (value: number) => {
    const palette = ["#fde68a","#bfdbfe","#c7d2fe","#bbf7d0","#fecaca"];
    return palette[value % palette.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar - Matching MultiObjectiveSidebar style */}
      <div className="w-80 h-screen bg-card border-r border-border p-6 overflow-y-auto sticky top-0">
        {/* Logo Section */}
        <img 
          src="./DATA/images/LOGO.png" 
          alt="Bi-Optima Logo" 
          className="px-auto h-20 w-auto hover:scale-105 transition-transform duration-200 cursor-pointer mb-6" 
          onClick={() => navigate("/")}
        />
        
        
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Problem Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground leading-relaxed">
              <p className="mb-3">
                Problem data analysis including benchmark extenstion, energy considerations, and machine consumption rates. 
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Categories - Styled exactly like Algorithms section */}
        <Card className="mt-6 shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Key information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium text-accent">PS & PB</div>
              <div className="text-muted-foreground">Additional files were added, where machines are heterogeneous in terms of consumption rates</div>
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
            <Button variant="ghost" size="sm" onClick={() => navigate("/multi-objective/data")} className="hover:bg-muted">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Problem Data
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Additional data (PS and PB)</h1>
              <p className="text-muted-foreground">Machine consumption scenarios and comparisons</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8 max-w-6xl mx-auto">
        {/* Scheme */}
        <Card>
          <CardHeader>
            <CardTitle>Machine Consumption rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="px-4 py-2 rounded-md bg-muted text-sm font-medium">Machines</div>
              <div className="flex items-start justify-between gap-16 mt-2 w-full max-w-md">
                {/* Elbow left arrow with head */}
                <svg width="160" height="80" viewBox="0 0 160 80" className="text-purple-600">
                  <defs>
                    <marker id="ad-arrowhead1" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                      <polygon points="0 0, 8 4, 0 8" fill="currentColor" />
                    </marker>
                  </defs>
                  <path d="M80 0 L20 0 L20 60" stroke="currentColor" strokeWidth="2" fill="none" markerEnd="url(#ad-arrowhead1)" />
                </svg>
                {/* Elbow right arrow with head */}
                <svg width="160" height="80" viewBox="0 0 160 80" className="text-purple-600">
                  <defs>
                    <marker id="ad-arrowhead2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                      <polygon points="0 0, 8 4, 0 8" fill="currentColor" />
                    </marker>
                  </defs>
                  <path d="M80 0 L140 0 L140 60" stroke="currentColor" strokeWidth="2" fill="none" markerEnd="url(#ad-arrowhead2)" />
                </svg>
              </div>
              <div className="flex items-start justify-between gap-16 w-full max-w-md -mt-6">
                <div className="px-4 py-2 rounded-md bg-muted text-sm font-medium">Same consumption rate</div>
                <div className="px-4 py-2 rounded-md bg-muted text-sm font-medium">Different consumption rates</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PS and PB examples */}
        <Card>
            <CardHeader>
                <CardTitle>PS and PB rate examples for 5 machines</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-8">
                {/* Left side: PS and PB rates */}
                <div className="flex-1 space-y-6">
                <div>
                    <div className="mb-2 font-medium">PS rates: each machine takes a rate between 1 and 3</div>
                    <div className="flex gap-3">
                    {[1, 3, 1, 2, 2].map((v, i) => (
                        <div
                        key={i}
                        className="w-16 h-12 rounded-md border flex items-center justify-center text-sm transition-transform hover:scale-105 hover:shadow"
                        style={{ backgroundColor: equalColor(v) }}
                        >
                        {v}
                        </div>
                    ))}
                    </div>
                </div>

                <div>
                    <div className="mb-2 font-medium">PB rates: each machine takes a rate between 1 and 8</div>
                    <div className="flex gap-3">
                    {[6, 5, 7, 4, 1].map((v, i) => (
                        <div
                        key={i}
                        className="w-16 h-12 rounded-md border flex items-center justify-center text-sm transition-transform hover:scale-105 hover:shadow"
                        style={{ backgroundColor: equalColor(v) }}
                        >
                        {v}
                        </div>
                    ))}
                    </div>
                </div>
                </div>

                {/* Right side: TEC formula */}
                
            </CardContent>
            </Card>

            <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-primary" />
                    New Formula for TEC
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-lg">
                    <div className="text-white mb-4 font-semibold text-center">TEC Calculation</div>
                    <div className="space-y-2 text-center">
                      <div>
                        <em>
                          TEC ={" "}
                          <span
                            className="cursor-help hover:text-green-300 transition-colors"
                            title="i ∈ N: job index"
                          >
                            &sum;<sub>i∈N</sub>
                          </span>{" "}
                          <span
                            className="cursor-help hover:text-green-300 transition-colors"
                            title="j ∈ M: machine index"
                          >
                            &sum;<sub>j∈M</sub>
                          </span>{" "}
                          <span
                            className="cursor-help hover:text-green-300 transition-colors"
                            title="k ∈ K: period index"
                          >
                            &sum;<sub>k∈K</sub>
                          </span>{" "}
                          <span
                            className="cursor-help hover:text-green-300 transition-colors"
                            title="σₖ: price"
                          >
                            &sigma;<sub>k</sub>
                          </span>{" "}
                          ×{" "}
                          <span
                            className="cursor-help hover:text-green-300 transition-colors"
                            title="xᵢⱼₖ: time spent by the job in the period"
                          >
                            x<sub>ijk</sub>
                          </span>{" "}
                          ×{" "}
                          <span
                            className="cursor-help hover:text-green-300 transition-colors"
                            title="rate: machine rate"
                          >
                            rate
                          </span>
                        </em>
                      </div>
                      
                    </div>
                  </div>
                </CardContent>
              </Card>


                {/* Example PS File */}
                <Card className="shadow-card">
                    <CardHeader>
                        <CardTitle>Example PS File - Instance 1 with 10 jobs and 5 machines</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-gray-900 text-green-400 font-mono p-4 rounded-lg overflow-auto text-sm">
                        {/* Filename */}
                    <div className="text-white mb-2">VFR_10_5_Gap_PS.txt</div>
                        <pre>
                    10 <br/>
                    1 1 1 3 3 1 3 3 3 2
                        </pre>
                        </div>
                    </CardContent>
                </Card>

                {/* Example PB File */}
                <Card className="shadow-card">
                <CardHeader>
                    <CardTitle>Example PB File - Instance 8 with 60 jobs and 15 machines</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-gray-900 font-mono p-4 rounded-lg overflow-auto text-sm">
                    {/* Filename */}
                    <div className="text-white mb-2">VFR60_15_8_Gap_PB.txt</div>

                    {/* File content */}
                    <pre className="text-green-400">
                15 <br/>
                5 3 8 3 6 1 4 4 1 6 4 6 3 8 4
                    </pre>
                    </div>
                </CardContent>
                </Card>





        {/* Pareto Fronts */}
        <Card>
          <CardHeader>
            <CardTitle>Pareto Fronts - Configuration: 200 jobs , 20 machines, Instance 1</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="makespan" name="Makespan" type="number" domain={['dataMin','dataMax']} tick={{ fontSize: 12 }} />
                  <YAxis dataKey="tec" name="TEC" type="number" domain={['dataMin','dataMax']} tick={{ fontSize: 12 }} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value: any, name: any, props: any) => {
                        if (props.dataKey === 'makespan') return [(value as number).toFixed(2), 'Makespan'];
                        if (props.dataKey === 'tec') return [(value as number).toFixed(2), 'TEC'];
                        return [value, name];
                    }}
                    /><Legend />
                  {paretoSeries.map(a => (
                    <Scatter key={a.algorithm} name={a.algorithm} data={a.points} fill={colors[a.algorithm]} shape="circle" />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Metrics table across job sizes */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Mean Performance Metrics across job sizes for all 360 instances 
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-auto">
              <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead rowSpan={2} className="align-middle font-semibold border-r">Jobs</TableHead>
                        <TableHead colSpan={3} className="text-center font-semibold border-r">IGD</TableHead>
                        <TableHead colSpan={3} className="text-center font-semibold border-r">SNS</TableHead>
                        <TableHead colSpan={3} className="text-center font-semibold border-r">NPS</TableHead>
                        <TableHead colSpan={3} className="text-center font-semibold">Exec Time</TableHead>
                    </TableRow>
                    <TableRow className="bg-muted/30">
                        <TableHead className="text-center border-r">HNSGA-II</TableHead>
                        <TableHead className="text-center border-r">HMOGVNS</TableHead>
                        <TableHead className="text-center border-r">HMOSA</TableHead>

                        <TableHead className="text-center border-r">HNSGA-II</TableHead>
                        <TableHead className="text-center border-r">HMOGVNS</TableHead>
                        <TableHead className="text-center border-r">HMOSA</TableHead>

                        <TableHead className="text-center border-r">HNSGA-II</TableHead>
                        <TableHead className="text-center border-r">HMOGVNS</TableHead>
                        <TableHead className="text-center border-r">HMOSA</TableHead>

                        <TableHead className="text-center">HNSGA-II</TableHead>
                        <TableHead className="text-center">HMOGVNS</TableHead>
                        <TableHead className="text-center">HMOSA</TableHead>
                    </TableRow>
                    </TableHeader>

                    <TableBody>
                        {metricsRows.map((row, idx) => {
                            const igdVals = ['HNSGA-II','HMOGVNS','HMOSA'].map(v => row.values[v as AlgorithmKey]?.igd ?? Number.POSITIVE_INFINITY);
                            const snsVals = ['HNSGA-II','HMOGVNS','HMOSA'].map(v => row.values[v as AlgorithmKey]?.sns ?? Number.NEGATIVE_INFINITY);
                            const npsVals = ['HNSGA-II','HMOGVNS','HMOSA'].map(v => row.values[v as AlgorithmKey]?.nps ?? Number.NEGATIVE_INFINITY);
                            const exeVals = ['HNSGA-II','HMOGVNS','HMOSA'].map(v => row.values[v as AlgorithmKey]?.exec_time ?? Number.POSITIVE_INFINITY);
                            const best = (val:number, col:'igd'|'sns'|'nps'|'exec_time', arr:number[]) => (col==='igd'||col==='exec_time') ? val===Math.min(...arr) : val===Math.max(...arr);

                            return (
                            <TableRow key={idx} className="hover:bg-muted/30 border-t">
                                <TableCell className="font-medium border-r">{row.jobs}</TableCell>

                                {(['HNSGA-II','HMOGVNS','HMOSA'] as AlgorithmKey[]).map((v,i)=> (
                                <TableCell
                                    key={`igd-${i}`}
                                    className={`text-center ${best(row.values[v]?.igd ?? Number.POSITIVE_INFINITY,'igd',igdVals)?'bg-primary/10 font-bold text-primary':''} ${i===2?'border-r':''}`}
                                >
                                    {row.values[v]?.igd?.toString() ?? 'N/A'}
                                </TableCell>
                                ))}

                                {(['HNSGA-II','HMOGVNS','HMOSA'] as AlgorithmKey[]).map((v,i)=> (
                                <TableCell
                                    key={`sns-${i}`}
                                    className={`text-center ${best(row.values[v]?.sns ?? Number.NEGATIVE_INFINITY,'sns',snsVals)?'bg-primary/10 font-bold text-primary':''} ${i===2?'border-r':''}`}
                                >
                                    {row.values[v]?.sns?.toString() ?? 'N/A'}
                                </TableCell>
                                ))}

                                {(['HNSGA-II','HMOGVNS','HMOSA'] as AlgorithmKey[]).map((v,i)=> (
                                <TableCell
                                    key={`nps-${i}`}
                                    className={`text-center ${best(row.values[v]?.nps ?? Number.NEGATIVE_INFINITY,'nps',npsVals)?'bg-primary/10 font-bold text-primary':''} ${i===2?'border-r':''}`}
                                >
                                    {row.values[v]?.nps?.toString() ?? 'N/A'}
                                </TableCell>
                                ))}

                                {(['HNSGA-II','HMOGVNS','HMOSA'] as AlgorithmKey[]).map((v,i)=> (
                                <TableCell
                                    key={`exe-${i}`}
                                    className={`text-center ${best(row.values[v]?.exec_time ?? Number.POSITIVE_INFINITY,'exec_time',exeVals)?'bg-primary/10 font-bold text-primary':''}`}
                                >
                                    {row.values[v]?.exec_time?.toString() ?? 'N/A'}
                                </TableCell>
                                ))}
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
                  <div><strong>SNS (Spread of Non-Dominated Solutions):</strong> Higher values indicate better distribution of solutions</div>
                  <div><strong>NPS (Number of Pareto Solutions):</strong> Higher values indicate more non-dominated solutions found</div>
                  <div><strong>Exec Time (Execution Time):</strong> Lower values indicate faster algorithm performance</div>
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

export default AdditionalDataPage;


