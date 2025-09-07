import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TECReductionPage = () => {
  const navigate = useNavigate();
  const [leftShiftApplied, setLeftShiftApplied] = useState(false);
  const [rightShiftApplied, setRightShiftApplied] = useState(false);
  const [rsProbability, setRsProbability] = useState("");

  // Sample initial schedule data
  const initialSchedule = {
    jobs: [
      { id: "J1", machine: "M1", start: 0, duration: 4, color: "#8D70FF" },
      { id: "J2", machine: "M1", start: 4, duration: 3, color: "#22c55e" },
      { id: "J1", machine: "M2", start: 2, duration: 5, color: "#8D70FF" },
      { id: "J2", machine: "M2", start: 7, duration: 4, color: "#22c55e" },
      { id: "J1", machine: "M3", start: 8, duration: 3, color: "#8D70FF" },
      { id: "J2", machine: "M3", start: 11, duration: 2, color: "#22c55e" },
    ],
    cmax: 13,
    tec: 45.2
  };

  const leftShiftSchedule = {
    jobs: [
      { id: "J1", machine: "M1", start: 0, duration: 4, color: "#8D70FF" },
      { id: "J2", machine: "M1", start: 4, duration: 3, color: "#22c55e" },
      { id: "J1", machine: "M2", start: 0, duration: 5, color: "#8D70FF" },
      { id: "J2", machine: "M2", start: 7, duration: 4, color: "#22c55e" },
      { id: "J1", machine: "M3", start: 5, duration: 3, color: "#8D70FF" },
      { id: "J2", machine: "M3", start: 11, duration: 2, color: "#22c55e" },
    ],
    cmax: 13,
    tec: 42.8
  };

  const rightShiftSchedule = {
    jobs: [
      { id: "J1", machine: "M1", start: 0, duration: 4, color: "#8D70FF" },
      { id: "J2", machine: "M1", start: 4, duration: 3, color: "#22c55e" },
      { id: "J1", machine: "M2", start: 1, duration: 5, color: "#8D70FF" },
      { id: "J2", machine: "M2", start: 7, duration: 4, color: "#22c55e" },
      { id: "J1", machine: "M3", start: 6, duration: 3, color: "#8D70FF" },
      { id: "J2", machine: "M3", start: 11, duration: 2, color: "#22c55e" },
    ],
    cmax: 13,
    tec: 43.5
  };

  const probabilityOptions = ["10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"];

  const GanttChart = ({ schedule, title }: { schedule: any; title: string }) => (
    <div className="space-y-4">
      <h3 className="font-semibold">{title}</h3>
      <div className="bg-muted p-4 rounded-lg">
        <div className="space-y-2">
          {["M1", "M2", "M3"].map(machine => (
            <div key={machine} className="flex items-center gap-2">
              <div className="w-8 text-sm font-medium">{machine}</div>
              <div className="flex-1 relative h-8 bg-background border rounded">
                {schedule.jobs
                  .filter((job: any) => job.machine === machine)
                  .map((job: any, index: number) => (
                    <div
                      key={`${job.id}-${index}`}
                      className="absolute h-6 rounded flex items-center justify-center text-white text-xs font-medium mt-1"
                      style={{
                        left: `${(job.start / 15) * 100}%`,
                        width: `${(job.duration / 15) * 100}%`,
                        backgroundColor: job.color
                      }}
                    >
                      {job.id}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>Cmax: <span className="font-semibold">{schedule.cmax}</span></div>
          <div>TEC: <span className="font-semibold">{schedule.tec}</span></div>
        </div>
      </div>
    </div>
  );

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
                TEC Reduction Operator
              </h1>
              <p className="text-muted-foreground">
                Detailed analysis of TEC-reducer and shift strategy effects
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Left Shift Strategy Test */}
        <Card>
          <CardHeader>
            <CardTitle>Effect of Left Shift Strategy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <GanttChart schedule={initialSchedule} title="Initial Schedule" />
            
            <div className="flex justify-center">
              <Button 
                onClick={() => setLeftShiftApplied(true)}
                className="px-8"
                disabled={leftShiftApplied}
              >
                Apply Left Shift
              </Button>
            </div>

            {leftShiftApplied && (
              <GanttChart schedule={leftShiftSchedule} title="Schedule After Left Shift" />
            )}
          </CardContent>
        </Card>

        {/* Right Shift Strategy Test */}
        <Card>
          <CardHeader>
            <CardTitle>Effect of Right Shift Strategy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <GanttChart schedule={initialSchedule} title="Initial Schedule Before TEC Reducer" />
            
            <div className="flex justify-center">
              <Button 
                onClick={() => setRightShiftApplied(true)}
                className="px-8"
                disabled={rightShiftApplied}
              >
                Apply Right Shift
              </Button>
            </div>

            {rightShiftApplied && (
              <GanttChart schedule={rightShiftSchedule} title="Schedule After Right Shift" />
            )}
          </CardContent>
        </Card>

        {/* Effect of RS Probability */}
        <Card>
          <CardHeader>
            <CardTitle>Effect of RS Probability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <label className="font-medium">RS Probability:</label>
              <Select value={rsProbability} onValueChange={setRsProbability}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select %" />
                </SelectTrigger>
                <SelectContent>
                  {probabilityOptions.map(prob => (
                    <SelectItem key={prob} value={prob}>{prob}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {rsProbability && (
              <Card>
                <CardHeader>
                  <CardTitle>Pareto Fronts for {rsProbability} RS Probability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <div className="w-full h-full border rounded p-4 bg-background">
                      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <div className="text-lg font-medium mb-2">Pareto Fronts Comparison</div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span>HNSGA-II</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                              <span>HMOGVNS</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span>HMOSA</span>
                            </div>
                          </div>
                          <div className="mt-4 text-xs text-muted-foreground">
                            Probability: {rsProbability}
                            <br />
                            (Data will be loaded from Excel file during integration)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TECReductionPage;