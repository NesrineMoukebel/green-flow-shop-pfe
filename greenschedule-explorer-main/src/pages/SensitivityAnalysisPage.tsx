import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Legend } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { loadMetricsData, ParetoData, MetricsData } from "@/services/dataService";

const SensitivityAnalysisPage = () => {
  const navigate = useNavigate();
  const [paretoData, setParetoData] = useState<ParetoData[]>([]);
  const [metricsData, setMetricsData] = useState<MetricsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Pareto dominance filter ---
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

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Load Pareto data from DATA_page CSVs
        const base = "/DATA/DATA_page/Sensitivity_analysis";
        const files = [
          { name: 'HNSGA-II-6CW', path: `${base}/NFS_HNSGA_6CW/M20_J200_config_6CW_4.csv` },
          { name: 'HNSGA-II-6CWI', path: `${base}/NFS_HNSGA_6CWI/M20_J200_config_6CWI_4.csv` },
          { name: 'HNSGA-II-6CWD', path: `${base}/NFS_HNSGA_6CWD/M20_J200_config_6CWD_4.csv` }
        ];

        const fetched: ParetoData[] = [];
        for (const f of files) {
          try {
            const res = await fetch(f.path);
            if (!res.ok) throw new Error(`Failed to fetch ${f.path}`);
            const text = await res.text();
            const lines = text.trim().split('\n');

            // Parse points from CSV
            const pointsRaw = lines.slice(1).map(line => {
              const parts = line.split(',');
              return {
                makespan: parseFloat(parts[0]),
                tec: parseFloat(parts[1]),
                pareto: false,
                executionTime: 0
              };
            });

            // Filter nondominated points
            const nondominated = getParetoFront(pointsRaw).map(p => ({
              ...p,
              pareto: true,
              executionTime: 0
            }));

            fetched.push({ algorithm: f.name, points: nondominated });
          } catch (e) {
            console.warn('Sensitivity CSV load error:', e);
          }
        }
        setParetoData(fetched);

        // Load metrics from JSON (converted from xlsx) if available, fallback to existing loader
        try {
          const metricsJsonRes = await fetch(`${base}/Tariff_profile_metrics.json`);
          if (metricsJsonRes.ok) {
            const json: any[] = await metricsJsonRes.json();
            const normalized: MetricsData[] = json.map(row => ({
              instance: row.instance,
              machines: row.machines,
              jobs: row.jobs,
              algorithm: row.algorithm,
              igd: Number(row.igd),
              gd: 0,
              sns: Number(row.sns),
              nps: Number(row.nps),
              exec_time: Number(row.exec_time),
            }));
            
            setMetricsData(normalized);
          } else {
            const fallback = [] as MetricsData[];
            for (let i = 1; i <= 2; i++) {
              const m = await loadMetricsData(10, 5, i);
              if (m && m.length > 0) fallback.push(...m);
            }
            setMetricsData(fallback);
          }
        } catch (e) {
          console.warn('Metrics JSON load error, using fallback:', e);
          const fallback = [] as MetricsData[];
          for (let i = 1; i <= 2; i++) {
            const m = await loadMetricsData(10, 5, i);
            if (m && m.length > 0) fallback.push(...m);
          }
          setMetricsData(fallback);
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sensitivity analysis data');
        console.error('Error loading sensitivity analysis data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Price profile data for histograms with correct durations
  const priceProfiles = [
    {
      name: "Decreasing (6CWD)",
      durations: ["H/6", "H/12", "H/4", "H/12", "H/6", "H/4"],
      prices: [0.12, 0.08, 0.04, 0.08, 0.12, 0.08],
      color: "#ef4444",
      durationValues: [1/6, 1/12, 1/4, 1/12, 1/6, 1/4]
    },
    {
      name: "Normal (6CW)",
      durations: ["H/12", "H/6", "H/4", "H/6", "H/12", "H/4"],
      prices: [0.08, 0.12, 0.08, 0.12, 0.08, 0.04],
      color: "#22c55e",
      durationValues: [1/12, 1/6, 1/4, 1/6, 1/12, 1/4]
    },
    {
      name: "Increasing (6CWI)",
      durations: ["H/4", "H/12", "H/6", "H/4", "H/6", "H/12"],
      prices: [0.04, 0.08, 0.12, 0.08, 0.12, 0.08],
      color: "#8D70FF",
      durationValues: [1/4, 1/12, 1/6, 1/4, 1/6, 1/12]
    }
  ];

  // Convert Pareto data to Recharts format
  const chartData = paretoData.flatMap(algorithm => 
    algorithm.points.map(point => ({
      makespan: point.makespan,
      tec: point.tec,
      algorithm: algorithm.algorithm
    }))
  );

  const algorithmColors = {
    "HNSGA-II-6CW": "#3b82f6",
    "HNSGA-II-6CWI": "#ef4444",
    "HNSGA-II-6CWD": "#22c55e"
  } as const;

  const isBest = (value: number, column: string, allValues: number[]) => {
    if (column === 'igd' || column === 'exec_time') {
      return value === Math.min(...allValues);
    }
    return value === Math.max(...allValues);
  };

  const variantOrder = ["HNSGA-II-6CW", "HNSGA-II-6CWI", "HNSGA-II-6CWD"] as const;
  const metricsByVariant = variantOrder.map(v => metricsData.find(m => m.algorithm === v)).filter(Boolean) as MetricsData[];

  // Group rows by jobs/machines/instance and span variants per metric
  const groupedRows = (() => {
    const map = new Map<string, { jobs: number; machines: number; instance: number; values: Record<string, { igd: number; sns: number; nps: number; exec_time: number }> }>();
    for (const m of metricsData) {
      if (!variantOrder.includes(m.algorithm as any)) continue;
      const key = `${m.jobs}-${m.machines}-${m.instance}`;
      let entry = map.get(key);
      if (!entry) {
        entry = { jobs: m.jobs, machines: m.machines, instance: m.instance, values: {} };
        map.set(key, entry);
      }
      entry.values[m.algorithm] = { igd: m.igd, sns: m.sns, nps: m.nps, exec_time: m.exec_time };
    }
    return Array.from(map.values());
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/multi-objective/data")}
                className="hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Problem Data
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Sensitivity Analysis
                </h1>
                <p className="text-muted-foreground">
                  How price distribution affects solution quality
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading sensitivity analysis data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/multi-objective/data")}
                className="hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Problem Data
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Sensitivity Analysis
                </h1>
                <p className="text-muted-foreground">
                  How price distribution affects solution quality
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      
      {/* Sidebar - Matching MultiObjectiveSidebar style */}
      <div className="w-80 h-screen bg-card border-r border-border p-6 overflow-y-auto sticky top-0">
        {/* Logo Section */}
        <img 
          src="/DATA/images/LOGO.png" 
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
              <div className="font-medium text-accent">6CWD profile</div>
              <div className="text-muted-foreground">6CWD was created by shifting the 6CW profile by T/2</div>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium text-accent">6CWI profile</div>
              <div className="text-muted-foreground">6CWI was created by shifting the 6CW profile by 3T/4</div>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium text-accent">Sensitivity Analysis</div>
              <div className="text-muted-foreground">Analysis of how electricity price distributions affect solution quality and performance</div>
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
              onClick={() => navigate("/multi-objective/data")}
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Problem Data
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Sensitivity Analysis
              </h1>
              <p className="text-muted-foreground">
                How price distribution affects solution quality
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8 max-w-6xl mx-auto">
        {/* Price Profiles Histograms */}
        <Card>
          <CardHeader>
            <CardTitle>Price Profiles Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {priceProfiles.map((profile, index) => (
                <div key={index} className="space-y-4">
                  <h3 className="font-semibold text-center" style={{ color: profile.color }}>
                    {profile.name}
                  </h3>
                  <div className="h-64 flex items-end justify-center gap-2">
                    {profile.prices.map((price, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div
                          className="rounded-t flex items-end justify-center text-white text-xs font-medium px-1"
                          style={{
                            height: `${(price / 0.12) * 120 + 20}px`,
                            width: `${profile.durationValues[i] * 200}px`,
                            backgroundColor: profile.color,
                            minWidth: '30px'
                          }}
                        >
                          {price}
                        </div>
                        <div className="mt-2 text-xs text-center">
                          <div className="font-medium">P{i+1}</div>
                          <div className="text-muted-foreground text-xs">{profile.durations[i]}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pareto Fronts Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Pareto Fronts example - Instance 4 with 200 jobs and 20 machines</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-muted-foreground">No Pareto data available</div>
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
  cursor={{ strokeDasharray: "3 3" }}
  content={({ active, payload }) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow">
          <div>Makespan: {point.makespan}</div>
          <div>TEC: {point.tec}</div>
        </div>
      );
    }
    return null;
  }}
/>

                    <Legend />
                    
                    {paretoData.map(algorithm => (
                      <Scatter 
                        key={algorithm.algorithm}
                        name={algorithm.algorithm} 
                        data={algorithm.points.map(point => ({
                          makespan: point.makespan,
                          tec: point.tec
                        }))} 
                        fill={algorithmColors[algorithm.algorithm as keyof typeof algorithmColors]}
                        shape="circle"
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics Table */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metricsData.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-muted-foreground">No metrics data available</div>
              </div>
            ) : (
              <>
                <div className="border rounded-lg overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead rowSpan={2} className="font-semibold align-middle border-r">Instance</TableHead>
                        <TableHead rowSpan={2} className="font-semibold align-middle border-r">Jobs</TableHead>
                        <TableHead rowSpan={2} className="font-semibold align-middle border-r">Machines</TableHead>
                        <TableHead colSpan={3} className="text-center font-semibold border-b border-l">IGD</TableHead>
                        <TableHead colSpan={3} className="text-center font-semibold border-b border-l">SNS</TableHead>
                        <TableHead colSpan={3} className="text-center font-semibold border-b border-l">NPS</TableHead>
                        <TableHead colSpan={3} className="text-center font-semibold border-b border-l">Exec Time</TableHead>
                      </TableRow>
                      <TableRow className="bg-muted/30">
                        {variantOrder.map((v, i) => (
                          <TableHead key={`igd-${v}`} className={`text-center ${i === 0 ? 'border-l border-border' : ''}`}>{v}</TableHead>
                        ))}
                        {variantOrder.map((v, i) => (
                          <TableHead key={`sns-${v}`} className={`text-center ${i === 0 ? 'border-l border-border' : ''}`}>{v}</TableHead>
                        ))}
                        {variantOrder.map((v, i) => (
                          <TableHead key={`nps-${v}`} className={`text-center ${i === 0 ? 'border-l border-border' : ''}`}>{v}</TableHead>
                        ))}
                        {variantOrder.map((v, i) => (
                          <TableHead key={`exec-${v}`} className={`text-center ${i === 0 ? 'border-l border-border' : ''}`}>{v}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {groupedRows.map((row, idx) => {
                        const igdVals = variantOrder.map(v => row.values[v]?.igd ?? Number.POSITIVE_INFINITY);
                        const snsVals = variantOrder.map(v => row.values[v]?.sns ?? Number.NEGATIVE_INFINITY);
                        const npsVals = variantOrder.map(v => row.values[v]?.nps ?? Number.NEGATIVE_INFINITY);
                        const execVals = variantOrder.map(v => row.values[v]?.exec_time ?? Number.POSITIVE_INFINITY);

                        return (
                          <TableRow key={idx} className="hover:bg-muted/30">
                            <TableCell className="border-r font-medium">{row.instance}</TableCell>
                            <TableCell className="border-r">{row.jobs}</TableCell>
                            <TableCell className="border-r">{row.machines}</TableCell>

                            {/* IGD */}
                            {variantOrder.map((v, i) => (
                              <TableCell
                                key={`igdv-${i}`}
                                className={`text-center ${isBest(row.values[v]?.igd ?? Number.POSITIVE_INFINITY, 'igd', igdVals) ? 'bg-primary/10 font-bold text-primary' : ''} ${i === 0 ? 'border-l border-border' : ''}`}
                              >
                                {(row.values[v]?.igd ?? 0).toFixed(2)}
                                {isBest(row.values[v]?.igd ?? Number.POSITIVE_INFINITY, 'igd', igdVals) && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                              </TableCell>
                            ))}

                            {/* SNS */}
                            {variantOrder.map((v, i) => (
                              <TableCell
                                key={`snsv-${i}`}
                                className={`text-center ${isBest(row.values[v]?.sns ?? Number.NEGATIVE_INFINITY, 'sns', snsVals) ? 'bg-primary/10 font-bold text-primary' : ''} ${i === 0 ? 'border-l border-border' : ''}`}
                              >
                                {(row.values[v]?.sns ?? 0).toFixed(2)}
                                {isBest(row.values[v]?.sns ?? Number.NEGATIVE_INFINITY, 'sns', snsVals) && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                              </TableCell>
                            ))}

                            {/* NPS */}
                            {variantOrder.map((v, i) => (
                              <TableCell
                                key={`npsv-${i}`}
                                className={`text-center ${isBest(row.values[v]?.nps ?? Number.NEGATIVE_INFINITY, 'nps', npsVals) ? 'bg-primary/10 font-bold text-primary' : ''} ${i === 0 ? 'border-l border-border' : ''}`}
                              >
                                {row.values[v]?.nps ?? 0}
                                {isBest(row.values[v]?.nps ?? Number.NEGATIVE_INFINITY, 'nps', npsVals) && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                              </TableCell>
                            ))}

                            {/* Exec Time */}
                            {variantOrder.map((v, i) => (
                              <TableCell
                                key={`execv-${i}`}
                                className={`text-center ${isBest(row.values[v]?.exec_time ?? Number.POSITIVE_INFINITY, 'exec_time', execVals) ? 'bg-primary/10 font-bold text-primary' : ''} ${i === 0 ? 'border-l border-border' : ''}`}
                              >
                                {(row.values[v]?.exec_time ?? 0).toFixed(2)}
                                {isBest(row.values[v]?.exec_time ?? Number.POSITIVE_INFINITY, 'exec_time', execVals) && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

              </>
            )}

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

export default SensitivityAnalysisPage;
