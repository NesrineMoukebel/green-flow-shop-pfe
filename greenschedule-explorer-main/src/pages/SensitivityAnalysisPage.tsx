import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Legend } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { loadSensitivityAnalysisData, loadMetricsData, ParetoData, MetricsData } from "@/services/dataService";

const SensitivityAnalysisPage = () => {
  const navigate = useNavigate();
  const [paretoData, setParetoData] = useState<ParetoData[]>([]);
  const [metricsData, setMetricsData] = useState<MetricsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Load Pareto data for different price profiles
        const paretoResults = await loadSensitivityAnalysisData(10, 5, 1);
        setParetoData(paretoResults);
        
        // Load metrics data for multiple configurations
        const metricsResults = [];
        for (let i = 1; i <= 2; i++) {
          const metrics = await loadMetricsData(10, 5, i);
          if (metrics && metrics.length > 0) {
            metricsResults.push(...metrics);
          }
        }
        setMetricsData(metricsResults);
        
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
      durationValues: [1/6, 1/12, 1/4, 1/12, 1/6, 1/4] // For relative widths
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
    "HNSGA-II-6CW": "#22c55e",
    "HNSGA-II-6CWD": "#ef4444",
    "HNSGA-II-6CWI": "#8D70FF"
  };

  // Helper function to determine if a value is the best (lowest for IGD and execTime, highest for others)
  const isBest = (value: number, column: string, allValues: number[]) => {
    if (column === 'igd' || column === 'exec') {
      return value === Math.min(...allValues);
    }
    return value === Math.max(...allValues);
  };

  if (loading) {
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
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Menu
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
                onClick={() => navigate("/multi-objective")}
                className="hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Menu
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

      <div className="p-6 space-y-8">
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
                            width: `${profile.durationValues[i] * 240}px`,
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
            <CardTitle>Algorithm Comparison - Pareto Fronts</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-muted-foreground">No Pareto data available</div>
              </div>
            ) : (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
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
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead rowSpan={2} className="font-semibold align-middle border-r">Instance</TableHead>
                        <TableHead rowSpan={2} className="font-semibold align-middle border-r">Jobs</TableHead>
                        <TableHead rowSpan={2} className="font-semibold align-middle border-r">Machines</TableHead>
                        <TableHead rowSpan={2} className="font-semibold align-middle border-r">Algorithm</TableHead>
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
                      {metricsData.map((metric, index) => {
                        // Get all values for the same metric type to determine best values
                        const sameMetricType = metricsData.filter(m => 
                          m.instance === metric.instance && 
                          m.jobs === metric.jobs && 
                          m.machines === metric.machines
                        );
                        
                        const igdValues = sameMetricType.map(m => m.igd);
                        const gdValues = sameMetricType.map(m => m.gd);
                        const snsValues = sameMetricType.map(m => m.sns);
                        const npsValues = sameMetricType.map(m => m.nps);
                        const execTimeValues = sameMetricType.map(m => m.exec_time);
                        
                        return (
                          <TableRow key={index} className="hover:bg-muted/30">
                            <TableCell className="border-r font-medium">{metric.instance}</TableCell>
                            <TableCell className="border-r">{metric.jobs}</TableCell>
                            <TableCell className="border-r">{metric.machines}</TableCell>
                            <TableCell className="border-r font-medium">{metric.algorithm}</TableCell>
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
                      <div><strong>GD (Generational Distance):</strong> Lower values indicate better convergence</div>
                      <div><strong>SNS (Spacing to Nearest Solution):</strong> Higher values indicate better distribution of solutions</div>
                      <div><strong>NPS (Number of Pareto Solutions):</strong> Higher values indicate more non-dominated solutions found</div>
                      <div><strong>Exec Time (Execution Time):</strong> Lower values indicate faster algorithm performance</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SensitivityAnalysisPage;