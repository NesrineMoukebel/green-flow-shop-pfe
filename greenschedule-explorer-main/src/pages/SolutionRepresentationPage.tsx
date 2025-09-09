import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ProcessingTimesChart from "@/components/ProcessingTimesChart";

// Example static schedule for 5 machines and 10 jobs
const machines = ["M1", "M2", "M3", "M4", "M5"];
const jobIndices = Array.from({ length: 10 }, (_, i) => i + 1);
const colors = ["#8D70FF", "#22c55e", "#ef4444", "#f97316", "#1f2937", "#06b6d4", "#eab308", "#a21caf", "#f43f5e", "#0ea5e9"];

// Build a simple static schedule programmatically
const scheduleData = {
  initial: [
    [[7, 1], [2, 47], [5, 73], [0, 93], [6, 138], [4, 161], [8, 180], [1, 256], [3, 300], [9, 374]],
    [[2, 73], [7, 92], [5, 111], [0, 139], [4, 180], [6, 221], [8, 256], [1, 332], [3, 374], [9, 488]],
    [[2, 92], [5, 157], [0, 199], [6, 253], [4, 263], [1, 366], [8, 418], [3, 457], [7, 551], [9, 562]],
    [[2, 157], [5, 199], [0, 262], [6, 316], [4, 343], [8, 452], [1, 458], [3, 551], [9, 627], [7, 635]],
    [[2, 191], [0, 316], [5, 380], [6, 409], [4, 435], [8, 468], [1, 559], [3, 627], [7, 687], [9, 723]]
  ]
  
};

// Processing times matrix [job][machine] - from processing_times.txt
const processingTimes = [
  [45, 31, 54, 54, 64], // Job 0
  [44, 7, 52, 66, 57], // Job 1
  [26, 19, 65, 34, 27], // Job 2
  [74, 83, 94, 76, 60], // Job 3
  [19, 41, 31, 50, 33], // Job 4
  [20, 28, 42, 63, 29], // Job 5
  [23, 30, 10, 27, 26], // Job 6
  [46, 19, 11, 5, 36], // Job 7
  [76, 76, 34, 6, 91], // Job 8
  [57, 31, 33, 8, 19]  // Job 9
];

// Energy pricing periods - real data
const periods = [
  { start: 1, end: 171, price: 0.08 },
  { start: 172, end: 513, price: 0.12 },
  { start: 514, end: 1026, price: 0.08 },
  { start: 1027, end: 1368, price: 0.12 },
  { start: 1369, end: 1539, price: 0.08 },
  { start: 1540, end: 2052, price: 0.04 }
];

const timeHorizon = 2052;

// Objective values for each schedule
const objectives = {
  initial: { cmax: 742, tec: 215.6 }
};

// Job colors for visualization - less pastel, more vibrant
const jobColors = [
  "#8B5CF6", // vivid purple
  "#EC4899", // hot pink
  "#3B82F6", // bright blue
  "#F59E0B", // amber
  "#10B981", // emerald green
  "#F43F5E", // neon red-pink
  "#6366F1", // indigo
  "#EAB308", // yellow gold
  "#14B8A6", // turquoise
  "#D946EF"  // flashy magenta
];




const SolutionRepresentationPage = () => {
  const navigate = useNavigate();

  const getPeriodColor = (price: number) => {
    if (price === 0.08) return '#fb923c'; // less pastel orange
    if (price === 0.12) return '#f87171'; // less pastel red
    if (price === 0.04) return '#4ade80'; // less pastel green
    return '#9ca3af'; // gray fallback
  };

  const GanttChart = ({ scheduleKey, title }: { scheduleKey: keyof typeof scheduleData; title: string }) => {
    const schedule = scheduleData[scheduleKey];
    const { cmax, tec } = objectives[scheduleKey];

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
          {/* Chart title */}
          <div className="text-center mb-4">
            <h4 className="text-base font-medium">Job Schedule</h4>
          </div>

          {/* Gantt chart container */}
          <div className="relative" style={{ height: '420px' }}>
            {/* Machine grid */}
            <div className="relative z-10" style={{ height: '310px' }}>
              {/* Y-axis label */}
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-medium text-gray-600">
                Machine
              </div>
              
              {/* Machine rows */}
              <div className="ml-8 h-full flex flex-col">
                {schedule.map((machine, machineIdx) => (
                  <div key={machineIdx} className="flex-1 relative border-b border-gray-200 last:border-b-0">
                    {/* Machine label - start from 1 */}
                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-600">
                      {machineIdx + 1}
                    </div>
                    
                    {/* Jobs on this machine */}
                    <div className="relative h-full">
                      {machine.map(([jobId, startTime], idx) => {
                        const duration = processingTimes[jobId][machineIdx];
                        return (
                          <div
                            key={idx}
                            className="absolute border border-black"
                      style={{
                              left: `${((startTime) / timeHorizon) * 100}%`,
                              width: `${(duration / timeHorizon) * 100}%`,
                              height: '75%',
                              top: '12.5%',
                              backgroundColor: jobColors[jobId],
                              minWidth: '4px'
                            }}
                          />
                        );
                      })}
                    </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Period price rectangles at bottom - full width */}
            <div className="absolute bottom-20 left-8 right-0" style={{ height: '24px' }}>
              {periods.map((period, i) => {
                const periodWidth = ((period.end - period.start + 1) / timeHorizon) * 100;
                const leftPosition = ((period.start) / timeHorizon) * 100;
                return (
                  <div
                    key={i}
                    className="absolute flex items-center justify-center text-xs font-medium text-white border border-gray-400"
                    style={{
                      left: `${leftPosition}%`,
                      width: `${periodWidth}%`,
                      height: '20px',
                      backgroundColor: getPeriodColor(period.price)
                    }}
                  >
                    ${period.price}
                  </div>
                );
              })}
            </div>

            
              {/* Vertical separators aligned with the right edge of each price rectangle */}
             
              {/* Vertical separators above the x-axis */}
                <div className="absolute left-8 right-0 top-0 bottom-20 z-20 pointer-events-none">
                  {periods.slice(0, -1).map((period, i) => {
                    const leftPosition = (period.end / timeHorizon) * 100;
                    return (
                      <div
                        key={`sep-${i}`}
                        className="absolute left-[value] top-0 bottom-0 border-r-2 border-dotted border-black w-0"
                        style={{
                          left: `${leftPosition}%`,
                          top: 0,          // start at top of chart container
                          bottom: 0,       // stop at top of price rectangles (bottom-20)
                          opacity: 0.8,
                        }}
                      />
                    );
                  })}
                </div>






          </div>

          {/* Time axis */}
          <div className="mt-2 ml-8 relative h-8 border-t border-gray-300">
            <div className="absolute inset-0 flex justify-between items-center text-sm">
              <span>0</span>
              <span>{Math.round(timeHorizon/4)}</span>
              <span>{Math.round(timeHorizon/2)}</span>
              <span>{Math.round(3*timeHorizon/4)}</span>
              <span>{timeHorizon}</span>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm font-medium">
              Time
            </div>
          </div>

          {/* Job legend */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="text-sm font-medium text-gray-700">Jobs:</div>
              {Array.from({length: 10}, (_, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div 
                    className="w-4 h-4 border-2 border-gray-600"
                    style={{ backgroundColor: jobColors[i] }}
                  />
                  <span className="text-xs text-gray-600">Job {i + 1}</span>
            </div>
          ))}
        </div>
          </div>

          {/* Objectives */}
          <div className="flex justify-center items-center gap-6 mt-6">
                <div className="w-32 h-32 bg-white shadow-md rounded-lg flex flex-col items-center justify-center border border-gray-200 
                                transition-transform transform hover:scale-105 hover:shadow-lg hover:border-blue-400">
                  <div className="text-2xl font-bold text-black-600">{cmax}</div>
                  <div className="text-sm text-gray-500">Cmax</div>
                </div>

                <div className="w-32 h-32 bg-white shadow-md rounded-lg flex flex-col items-center justify-center border border-gray-200 
                                transition-transform transform hover:scale-105 hover:shadow-lg hover:border-purple-400">
                  <div className="text-2xl font-bold text-purple-600">{tec}</div>
                  <div className="text-sm text-gray-500">TEC</div>
                </div>
              </div>

        
      </div>
    </div>
  );
  };

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
        {/* <Card>
          <CardHeader>
            <CardTitle>Gantt Chart Example (5 Machines, 10 Jobs)</CardTitle>
          </CardHeader>
          <CardContent>
            <GanttChart schedule={schedule} title="Schedule Gantt Chart" />
          </CardContent>
        </Card> */}

        <GanttChart scheduleKey="initial" title="Initial Schedule" />

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
