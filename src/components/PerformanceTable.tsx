import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy } from "lucide-react";
import { loadMetricsData, MetricsData } from "@/services/dataService";

interface PerformanceTableProps {
  jobs?: number;
  machines?: number;
  instance?: number;
}

const PerformanceTable = ({ jobs = 30, machines = 10, instance = 1 }: PerformanceTableProps) => {
  const [metricsData, setMetricsData] = useState<MetricsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await loadMetricsData(jobs, machines, instance);
        setMetricsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load metrics data');
        console.error('Error loading metrics data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [jobs, machines, instance]);

  // Helper function to determine if a value is the best (lowest for IGD, exec_time, highest for SNS, NPS)
  const isBest = (value: number, column: string, allValues: number[]) => {
    if (column === 'igd' || column === 'exec_time') {
      return value === Math.min(...allValues);
    }
    return value === Math.max(...allValues);
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading performance metrics...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || metricsData.length === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-red-500">
              {error || 'No metrics data available for this configuration'}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extract values for each metric to determine best values
  const igdValues = metricsData.map(d => d.igd);
  const snsValues = metricsData.map(d => d.sns);
  const npsValues = metricsData.map(d => d.nps);
  const execTimeValues = metricsData.map(d => d.exec_time);

  return (
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
                  SNS
                  <div className="text-xs font-normal text-muted-foreground">
                    Spread of Non-dominated solutions
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
              {metricsData.map((metric, index) => (
                <TableRow key={index} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{metric.algorithm}</TableCell>
                  <TableCell className={`text-center ${isBest(metric.igd, 'igd', igdValues) ? 'bg-primary/10 font-bold text-primary' : ''}`}>
                    {metric.igd.toFixed(6)}
                    {isBest(metric.igd, 'igd', igdValues) && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
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
              <div><strong>SNS (Spread of Non-dominated solutions):</strong> Higher values indicate better spread of solutions</div>
              <div><strong>NPS (Number of Pareto Solutions):</strong> Higher values indicate more non-dominated solutions found</div>
              <div><strong>Exec Time (Execution Time):</strong> Lower values indicate faster algorithm performance</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceTable;