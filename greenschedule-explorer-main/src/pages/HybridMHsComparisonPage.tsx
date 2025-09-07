import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Sidebar from "@/components/Sidebar";
import ProcessingTimesChart from "@/components/ProcessingTimesChart";
import PerformanceTable from "@/components/PerformanceTable";
import { loadParetoData, ParetoData } from "@/services/dataService";

const HybridMHsComparisonPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState("30");
  const [machines, setMachines] = useState("10");
  const [instance, setInstance] = useState("1");
  const [paretoData, setParetoData] = useState<ParetoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = (config: { jobs: number; machines: number; instance: number }) => {
    setJobs(config.jobs.toString());
    setMachines(config.machines.toString());
    setInstance(config.instance.toString());
  };

  // Load Pareto data when configuration changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await loadParetoData(parseInt(jobs), parseInt(machines), parseInt(instance));
        setParetoData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Pareto data');
        console.error('Error loading Pareto data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [jobs, machines, instance]);

  // Convert Pareto data to Recharts format
  const chartData = paretoData.flatMap(algorithm => 
    algorithm.points.map(point => ({
      makespan: point.makespan,
      tec: point.tec,
      algorithm: algorithm.algorithm
    }))
  );

  const algorithmColors = {
    "HNSGA-II": "#22c55e",
    "HMOGVNS": "#1f2937", 
    "HMOSA": "#ef4444"
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar onRun={handleRun} />
      
      {/* Main Content */}
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
                <h1 className="text-2xl font-bold text-foreground">
                  Hybrid MHs Comparison
                </h1>
                <p className="text-muted-foreground">
                  Compare hybrid metaheuristics performance metrics
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Processing Times Visualization */}
          <ProcessingTimesChart jobs={parseInt(jobs)} machines={parseInt(machines)} instance={parseInt(instance)} />

          {/* Pareto Fronts Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Algorithm Comparison - Pareto Fronts</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-muted-foreground">Loading Pareto fronts...</div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-red-500">{error}</div>
                </div>
              ) : chartData.length === 0 ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-muted-foreground">No Pareto data available for this configuration</div>
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
          <PerformanceTable 
            jobs={parseInt(jobs)} 
            machines={parseInt(machines)} 
            instance={parseInt(instance)} 
          />
        </div>
      </div>
    </div>
  );
};

export default HybridMHsComparisonPage;