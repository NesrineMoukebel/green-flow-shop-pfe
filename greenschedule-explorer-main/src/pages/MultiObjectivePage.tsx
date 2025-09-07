import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import ProcessingTimesChart from "@/components/ProcessingTimesChart";
import AlgorithmChart from "@/components/AlgorithmChart";
import PerformanceTable from "@/components/PerformanceTable";

interface SimulationConfig {
  jobs: number;
  machines: number;
  instances: number;
}

const MultiObjectivePage = () => {
  const navigate = useNavigate();
  const [currentConfig, setCurrentConfig] = useState<SimulationConfig>({
    jobs: 30,
    machines: 10,
    instances: 10
  });
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = (config: SimulationConfig) => {
    setCurrentConfig(config);
    setIsRunning(true);
    
    // Simulate algorithm execution
    setTimeout(() => {
      setIsRunning(false);
    }, 2000);
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="hover:bg-muted"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Multi-objective Flow Shop
                  </h1>
                  <p className="text-muted-foreground">
                    Configuration: {currentConfig.jobs} jobs, {currentConfig.machines} machines, {currentConfig.instances} instances
                  </p>
                </div>
              </div>
              {isRunning && (
                <div className="flex items-center gap-2 text-primary">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="font-medium">Running simulation...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="p-6 space-y-8">
          {/* Section 1: Processing Times Visualization */}
          <ProcessingTimesChart 
            jobs={currentConfig.jobs} 
            machines={currentConfig.machines} 
          />

          {/* Section 2: Algorithm Comparison */}
          <AlgorithmChart />

          {/* Section 3: Performance Metrics */}
          <PerformanceTable />
        </div>
      </div>
    </div>
  );
};

export default MultiObjectivePage;