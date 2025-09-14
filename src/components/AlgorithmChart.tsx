import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const AlgorithmChart = () => {
  // Mock performance data for the three algorithms
  const algorithms = [
    { name: "HNSGA-II", color: "hsl(158, 64%, 52%)" },
    { name: "HMOGVNS", color: "hsl(215, 28%, 17%)" },
    { name: "HMOSA", color: "hsl(142, 76%, 36%)" }
  ];

  // Generate mock performance data points
  const dataPoints = Array.from({ length: 20 }, (_, i) => {
    const iteration = i * 50;
    return {
      iteration,
      "HNSGA-II": 100 - Math.log(i + 1) * 15 + Math.random() * 5,
      "HMOGVNS": 95 - Math.log(i + 1) * 12 + Math.random() * 7,
      "HMOSA": 98 - Math.log(i + 1) * 13 + Math.random() * 6
    };
  });

  const maxValue = 100;
  const minValue = Math.min(...dataPoints.map(d => Math.min(d["HNSGA-II"], d.HMOGVNS, d.HMOSA)));

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Algorithm Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="text-sm font-medium mb-4">Performance Metric vs Iterations</div>
          
          {/* Chart Area */}
          <div className="relative h-64 border-l border-b border-border">
            {/* Y-axis labels */}
            <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground">
              <span>{maxValue.toFixed(0)}</span>
              <span>{((maxValue + minValue) / 2).toFixed(0)}</span>
              <span>{minValue.toFixed(0)}</span>
            </div>
            
            {/* X-axis labels */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>500</span>
              <span>1000</span>
            </div>

            {/* Grid lines */}
            <div className="absolute inset-0">
              {[25, 50, 75].map(percent => (
                <div
                  key={percent}
                  className="absolute w-full border-t border-border/30"
                  style={{ top: `${percent}%` }}
                />
              ))}
            </div>

            {/* Algorithm lines */}
            <svg className="absolute inset-0 w-full h-full">
              {algorithms.map((algorithm) => {
                const points = dataPoints.map((point, index) => {
                  const x = (index / (dataPoints.length - 1)) * 100;
                  const y = ((maxValue - point[algorithm.name as keyof typeof point]) / (maxValue - minValue)) * 100;
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <polyline
                    key={algorithm.name}
                    points={points}
                    fill="none"
                    stroke={algorithm.color}
                    strokeWidth="2"
                    className="drop-shadow-sm"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            {algorithms.map((algorithm) => (
              <div key={algorithm.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: algorithm.color }}
                />
                <span className="text-sm font-medium">{algorithm.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlgorithmChart;