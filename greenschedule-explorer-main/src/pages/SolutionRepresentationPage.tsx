import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ProcessingTimesChart from "@/components/ProcessingTimesChart";

// Example static schedule for 5 machines and 10 jobs
const machines = ["M1", "M2", "M3", "M4", "M5"];
const jobIndices = Array.from({ length: 10 }, (_, i) => i + 1);
const colors = ["#8D70FF", "#22c55e", "#ef4444", "#f97316", "#1f2937", "#06b6d4", "#eab308", "#a21caf", "#f43f5e", "#0ea5e9"];

// Build a simple static schedule programmatically
const schedule = {
  jobs: machines.flatMap((machine, mIdx) =>
    jobIndices.map((jIdx) => ({
      id: `J${jIdx}`,
      machine,
      start: mIdx * 2 + (jIdx - 1) * 3,
      duration: 2 + ((jIdx + mIdx) % 3),
      color: colors[jIdx - 1]
    }))
  ),
  cmax: 40,
  tec: 100.0
};

const GanttChart = ({ schedule, title }: { schedule: any; title: string }) => (
  <div className="space-y-4">
    <h3 className="font-semibold">{title}</h3>
    <div className="bg-muted p-4 rounded-lg">
      <div className="space-y-2">
        {machines.map(machine => (
          <div key={machine} className="flex items-center gap-2">
            <div className="w-12 text-sm font-medium">{machine}</div>
            <div className="flex-1 relative h-8 bg-background border rounded">
              {schedule.jobs
                .filter((job: any) => job.machine === machine)
                .map((job: any, index: number) => {
                  const end = job.start + job.duration;
                  return (
                    <div
                      key={`${job.id}-${index}`}
                      className="absolute h-6 rounded flex items-center justify-center text-white text-xs font-medium mt-1"
                      style={{
                        left: `${(job.start / 45) * 100}%`,
                        width: `${(job.duration / 45) * 100}%`,
                        backgroundColor: job.color,
                      }}
                      title={`Job: ${job.id}\nStart: ${job.start}\nEnd: ${end}`}
                    >
                      {job.id}
                    </div>
                  );
                })}
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

const SolutionRepresentationPage = () => {
  const navigate = useNavigate();

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
              Back to Menu
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Solution Representation</h1>
              <p className="text-muted-foreground">Visual representation and data structure of a schedule</p>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-8">
        {/* Gantt Chart Example */}
        <Card>
          <CardHeader>
            <CardTitle>Gantt Chart Example (5 Machines, 10 Jobs)</CardTitle>
          </CardHeader>
          <CardContent>
            <GanttChart schedule={schedule} title="Schedule Gantt Chart" />
          </CardContent>
        </Card>

        {/* Processing Times Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Data Example: Processing Times</CardTitle>
          </CardHeader>
          <CardContent>
            <ProcessingTimesChart jobs={10} machines={5} instance={1} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SolutionRepresentationPage;
