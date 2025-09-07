import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Settings2 } from "lucide-react";

interface SidebarProps {
  onRun: (config: {
    jobs: number;
    machines: number;
    instance: number;
  }) => void;
}

const Sidebar = ({ onRun }: SidebarProps) => {
  const [jobs, setJobs] = useState<string>("30");
  const [machines, setMachines] = useState<string>("10");
  const [instance, setInstance] = useState<string>("1");

  const handleRun = () => {
    onRun({
      jobs: parseInt(jobs),
      machines: parseInt(machines),
      instance: parseInt(instance),
    });
  };

  return (
    <div className="w-80 h-screen bg-card border-r border-border p-6 overflow-y-auto sticky top-0">
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings2 className="w-5 h-5 text-primary" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Number of Jobs */}
          <div className="space-y-2">
            <Label htmlFor="jobs" className="text-sm font-medium">
              Number of Jobs
            </Label>
            <Select value={jobs} onValueChange={setJobs}>
              <SelectTrigger>
                <SelectValue placeholder="Select jobs" />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 40, 50, 60, 100, 200, 300, 400].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Number of Machines */}
          <div className="space-y-2">
            <Label htmlFor="machines" className="text-sm font-medium">
              Number of Machines
            </Label>
            <Select value={machines} onValueChange={setMachines}>
              <SelectTrigger>
                <SelectValue placeholder="Select machines" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 20, 40, 60].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Instance Number */}
          <div className="space-y-2">
            <Label htmlFor="instance" className="text-sm font-medium">
              Instance Number
            </Label>
            <Select value={instance} onValueChange={setInstance}>
              <SelectTrigger>
                <SelectValue placeholder="Select instance" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Run Button */}
          <Button 
            variant="hero" 
            size="lg" 
            className="w-full mt-8"
            onClick={handleRun}
          >
            <Play className="w-5 h-5 mr-2" />
            RUN SIMULATION
          </Button>
        </CardContent>
      </Card>

      {/* Algorithm Info */}
      <Card className="mt-6 shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Algorithms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="p-3 bg-muted rounded-md">
            <div className="font-medium text-accent">HNSGA-II</div>
            <div className="text-muted-foreground">Hybrid Non-dominated Sorting Genetic Algorithm</div>
          </div>
          <div className="p-3 bg-muted rounded-md">
            <div className="font-medium text-accent">HMOGVNS</div>
            <div className="text-muted-foreground">Hybrid Multi-objective General Variable Neighborhood Search</div>
          </div>
          <div className="p-3 bg-muted rounded-md">
            <div className="font-medium text-accent">HMOSA</div>
            <div className="text-muted-foreground">Hybrid Multi-objective Simulated Annealing</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sidebar;