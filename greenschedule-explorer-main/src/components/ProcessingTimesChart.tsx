import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { loadProcessingTimes, ProcessingTimesData } from "@/services/dataService";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface ProcessingTimesChartProps {
  jobs: number;
  machines: number;
  instance?: number;
}

const ProcessingTimesChart = ({ jobs, machines, instance = 1 }: ProcessingTimesChartProps) => {
  const [processingData, setProcessingData] = useState<ProcessingTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await loadProcessingTimes(jobs, machines, instance);
        setProcessingData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load processing times');
        console.error('Error loading processing times:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [jobs, machines, instance]);

  // Calculate if we need horizontal scroll based on number of machines
  const needsHorizontalScroll = machines > 10;
  const needsVerticalScroll = jobs > 15;

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Processing Times Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading processing times...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !processingData) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Processing Times Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-red-500">
              {error || 'Failed to load processing times data'}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Electricity prices - 6CW profile
  const electricityPrices = [
    { period: "Period 1", price: 0.08, color: "#f97316", duration: "H/12", relativeHeight: 0.67 },
    { period: "Period 2", price: 0.12, color: "#ef4444", duration: "H/6", relativeHeight: 1.0 },
    { period: "Period 3", price: 0.08, color: "#f97316", duration: "H/4", relativeHeight: 0.67 },
    { period: "Period 4", price: 0.12, color: "#ef4444", duration: "H/6", relativeHeight: 1.0 },
    { period: "Period 5", price: 0.08, color: "#f97316", duration: "H/12", relativeHeight: 0.67 },
    { period: "Period 6", price: 0.04, color: "#22c55e", duration: "H/4", relativeHeight: 0.33 }
  ];

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Processing Times Visualization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Processing Times Matrix */}
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="text-sm font-medium mb-4">
            Processing Times Matrix
            <div className="text-xs text-muted-foreground">
              Jobs: {jobs}, Machines: {machines}, Instance: {instance}
            </div>
          </div>
          
          <div className={`
            ${needsVerticalScroll ? 'max-h-96 overflow-y-auto' : ''}
            ${needsHorizontalScroll ? 'overflow-x-auto' : ''}
          `}>
            <div className={`
              ${needsHorizontalScroll ? 'min-w-max' : 'w-full'}
            `}>
              <TooltipProvider>
                <table className={`
                  border-collapse border border-border
                  ${needsHorizontalScroll ? 'w-full' : 'w-full'}
                `}>
                  <thead>
                    <tr>
                      <th className={`
                        border border-border p-2 bg-muted text-xs font-medium
                        ${needsHorizontalScroll ? 'min-w-[80px]' : ''}
                      `}>
                        Job/Machine
                      </th>
                      {Array.from({ length: machines }, (_, i) => (
                        <th key={i} className={`
                          border border-border p-2 bg-muted text-xs font-medium
                          ${needsHorizontalScroll ? 'min-w-[60px]' : ''}
                        `}>
                          M{i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {processingData.processingTimes.map((row, jobIndex) => (
                      <tr key={jobIndex}>
                        <td className={`
                          border border-border p-2 bg-muted text-xs font-medium
                          ${needsHorizontalScroll ? 'min-w-[80px]' : ''}
                        `}>
                          J{jobIndex + 1}
                        </td>
                        {row.map((time, machineIndex) => (
                          <td
                            key={machineIndex}
                            className={`
                              border border-border p-2 text-center text-xs
                              ${needsHorizontalScroll ? 'min-w-[60px]' : ''}
                              hover:bg-white hover:text-purple-700 cursor-pointer transition-colors
                            `}
                            title={`Job: J${jobIndex + 1}, Machine: M${machineIndex + 1}`}
                          >
                            {time}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Electricity Prices Histogram - 6CW Profile */}
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="text-sm font-medium mb-4">Electricity Prices Histogram (6CW Profile)</div>
          <div className="flex justify-center">
            <div className="flex gap-2">
              {electricityPrices.map((period, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="rounded-t flex items-end justify-center text-white text-xs font-medium px-1"
                    style={{
                      height: `${period.relativeHeight * 80 + 20}px`,
                      width: period.duration === "H/12" ? "30px" : period.duration === "H/6" ? "60px" : "90px",
                      backgroundColor: period.color
                    }}
                  >
                    ${period.price}
                  </div>
                  <div className="mt-2 text-xs text-center" style={{ width: period.duration === "H/12" ? "30px" : period.duration === "H/6" ? "60px" : "90px" }}>
                    <div className="font-medium text-xs">{period.period}</div>
                    <div className="text-muted-foreground text-xs">{period.duration}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingTimesChart;