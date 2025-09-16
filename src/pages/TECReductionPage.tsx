import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Real schedule data from files
const scheduleData = {
  initial: [
    [[7, 1], [5, 46], [4, 66], [3, 85], [1, 159], [2, 203], [6, 229], [0, 252], [8, 297], [9, 373]],
    [[5, 66], [1, 203], [4, 210], [3, 251], [8, 373], [2, 449], [6, 468], [0, 498], [7, 551], [9, 570]],
    [[1, 210], [6, 498], [5, 508], [2, 550], [4, 615], [0, 646], [8, 700], [3, 734], [7, 828], [9, 839]],
    [[1, 262], [6, 508], [5, 550], [2, 615], [4, 649], [0, 700], [8, 754], [3, 828], [7, 904], [9, 909]],
    [[1, 328], [6, 535], [5, 613], [2, 649], [4, 699], [0, 754], [8, 818], [3, 909], [7, 969], [9, 1005]]
  ],
  sorting: [
    [[7, 653], [5, 699], [4, 719], [3, 738], [1, 812], [2, 856], [6, 882], [0, 905], [8, 950], [9, 1904]],
    [[5, 867], [1, 895], [4, 902], [3, 943], [8, 1401], [2, 1477], [6, 1496], [0, 1643], [7, 1942], [9, 1961]],
    [[1, 1436], [6, 1526], [5, 1536], [2, 1578], [4, 1643], [0, 1674], [8, 1733], [3, 1767], [7, 1981], [9, 1992]],
    [[1, 1488], [6, 1554], [5, 1581], [2, 1644], [4, 1678], [0, 1728], [8, 1840], [3, 1861], [7, 1992], [9, 2025]],
    [[1, 1610], [6, 1667], [5, 1693], [2, 1722], [4, 1749], [0, 1782], [8, 1846], [3, 1937], [7, 1997], [9, 2033]]
  ],
  afterLS: [
    [[7, 514], [5, 560], [4, 580], [3, 599], [1, 673], [2, 717], [6, 743], [0, 766], [8, 811], [9, 887]],
    [[5, 580], [1, 717], [4, 724], [3, 765], [8, 887], [2, 963], [6, 982], [0, 1369], [7, 1400], [9, 1419]],
    [[1, 724], [6, 1012], [5, 1369], [2, 1411], [4, 1476], [0, 1540], [8, 1594], [3, 1628], [7, 1722], [9, 1733]],
    [[1, 776], [6, 1369], [5, 1411], [2, 1476], [4, 1540], [0, 1594], [8, 1648], [3, 1722], [7, 1798], [9, 1803]],
    [[1, 842], [6, 1396], [5, 1474], [2, 1510], [4, 1590], [0, 1648], [8, 1712], [3, 1803], [7, 1863], [9, 1899]]
  ],
  afterRS: [
    [[7, 653], [5, 699], [4, 719], [3, 738], [1, 812], [2, 856], [6, 882], [0, 905], [8, 950], [9, 1904]],
    [[5, 867], [1, 895], [4, 902], [3, 943], [8, 1401], [2, 1477], [6, 1496], [0, 1643], [7, 1942], [9, 1961]],
    [[1, 1436], [6, 1526], [5, 1536], [2, 1578], [4, 1643], [0, 1674], [8, 1733], [3, 1767], [7, 1981], [9, 1992]],
    [[1, 1488], [6, 1554], [5, 1581], [2, 1644], [4, 1678], [0, 1728], [8, 1840], [3, 1861], [7, 1992], [9, 2025]],
    [[1, 1610], [6, 1667], [5, 1693], [2, 1722], [4, 1749], [0, 1782], [8, 1846], [3, 1937], [7, 1997], [9, 2033]]
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

// RS Probability data types
interface ParetoPoint {
  makespan: number;
  tec: number;
  isPareto: boolean;
  executionTime: number;
}

interface RSVariantData {
  name: string;
  description: string;
  color: string;
  data: ParetoPoint[];
}

// RS Probability data loading functions
const loadCSVData = async (filePath: string): Promise<ParetoPoint[]> => {
  try {
    const response = await fetch(filePath);
    const csvText = await response.text();
    const lines = csvText.split('\n');
    const data: ParetoPoint[] = [];
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const [makespan, tec, pareto, executionTime] = line.split(',');
        data.push({
          makespan: parseFloat(makespan),
          tec: parseFloat(tec),
          isPareto: pareto === 'true',
          executionTime: parseFloat(executionTime)
        });
      }
    }
    return data;
  } catch (error) {
    console.error(`Error loading CSV data from ${filePath}:`, error);
    return [];
  }
};


// Objective values for each schedule
const objectives = {
  initial: { cmax: 1024, tec: 193.2 },
  sorting: { cmax: 2052, tec: 113.0 },
  afterLS: { cmax: 1918, tec: 135.04 },
  afterRS: { cmax: 2052, tec: 113.0 }
};

// Job colors for visualization - less pastel, more vibrant
const jobColors = [
  "#A78BFA", "#34D399", "#FBBF24", "#F87171", "#60A5FA",
  "#C084FC", "#10B981", "#EF4444", "#8B5CF6", "#06B6D4"
];

// Individual Pareto Chart Component
const IndividualParetoChart = ({ variant }: { variant: RSVariantData }) => {
  const paretoPoints = variant.data.filter(p => p.isPareto);
  const minMakespan = Math.min(...paretoPoints.map(p => p.makespan));
  const maxMakespan = Math.max(...paretoPoints.map(p => p.makespan));
  const minTEC = Math.min(...paretoPoints.map(p => p.tec));
  const maxTEC = Math.max(...paretoPoints.map(p => p.tec));
  
  const chartWidth = 400;
  const chartHeight = 300;
  const margin = { top: 20, right: 20, bottom: 60, left: 60 };
  const plotWidth = chartWidth - margin.left - margin.right;
  const plotHeight = chartHeight - margin.top - margin.bottom;
  
  const scaleX = (makespan: number) => 
    ((makespan - minMakespan) / (maxMakespan - minMakespan)) * plotWidth + margin.left;
  const scaleY = (tec: number) => 
    plotHeight - ((tec - minTEC) / (maxTEC - minTEC)) * plotHeight + margin.top;
  
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
      <div className="text-center mb-4">
        <h4 className="text-lg font-semibold" style={{ color: variant.color }}>
          {variant.name}
        </h4>
        <p className="text-sm text-muted-foreground">{variant.description}</p>
      </div>
      
      <div className="flex justify-center">
        <svg width={chartWidth} height={chartHeight} className="border border-gray-200">
          {/* Grid lines */}
          <defs>
            <pattern id={`grid-${variant.name}`} width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width={plotWidth} height={plotHeight} x={margin.left} y={margin.top} fill={`url(#grid-${variant.name})`} />
          
          {/* Axes */}
          <line 
            x1={margin.left} y1={margin.top + plotHeight} 
            x2={margin.left + plotWidth} y2={margin.top + plotHeight} 
            stroke="black" strokeWidth="2"
          />
          <line 
            x1={margin.left} y1={margin.top} 
            x2={margin.left} y2={margin.top + plotHeight} 
            stroke="black" strokeWidth="2"
          />
          
          {/* Pareto points - no lines connecting them */}
          {paretoPoints.map((point, idx) => (
            <circle
              key={idx}
              cx={scaleX(point.makespan)}
              cy={scaleY(point.tec)}
              r="4"
              fill={variant.color}
              stroke="white"
              strokeWidth="1.5"
              opacity="0.8"
            />
          ))}
          
          {/* Axis labels */}
          <text
            x={margin.left + plotWidth / 2}
            y={chartHeight - 15}
            textAnchor="middle"
            className="text-xs font-medium"
          >
            Makespan (Cmax)
          </text>
          <text
            x={15}
            y={margin.top + plotHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90 15 ${margin.top + plotHeight / 2})`}
            className="text-xs font-medium"
          >
            TEC
          </text>
          
          {/* Tick marks and values */}
          {[0, 0.5, 1].map(ratio => {
            const makespan = minMakespan + ratio * (maxMakespan - minMakespan);
            const tec = minTEC + ratio * (maxTEC - minTEC);
            return (
              <g key={ratio}>
                {/* X-axis ticks */}
                <line
                  x1={margin.left + ratio * plotWidth}
                  y1={margin.top + plotHeight}
                  x2={margin.left + ratio * plotWidth}
                  y2={margin.top + plotHeight + 5}
                  stroke="black"
                />
                <text
                  x={margin.left + ratio * plotWidth}
                  y={margin.top + plotHeight + 15}
                  textAnchor="middle"
                  className="text-xs"
                >
                  {Math.round(makespan)}
                </text>
                
                {/* Y-axis ticks */}
                <line
                  x1={margin.left - 5}
                  y1={margin.top + plotHeight - ratio * plotHeight}
                  x2={margin.left}
                  y2={margin.top + plotHeight - ratio * plotHeight}
                  stroke="black"
                />
                <text
                  x={margin.left - 10}
                  y={margin.top + plotHeight - ratio * plotHeight + 4}
                  textAnchor="end"
                  className="text-xs"
                >
                  {Math.round(tec)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Chart statistics */}
      <div className="mt-4 text-center">
        <div className="text-sm text-muted-foreground">
          {paretoPoints.length} Pareto solutions
        </div>
      </div>
    </div>
  );
};

const TECReductionPage = () => {
  const navigate = useNavigate();
  const [selectedTest, setSelectedTest] = useState("tec-reduction");
  const [showSorting, setShowSorting] = useState(false);
  const [showLS, setShowLS] = useState(false);
  const [showRS, setShowRS] = useState(false);
  
  // RS Probability data state
  const [rsVariants, setRsVariants] = useState<RSVariantData[]>([]);
  const [isLoadingRSData, setIsLoadingRSData] = useState(false);

  // Load RS probability data
  useEffect(() => {
    const loadRSData = async () => {
      if (selectedTest === "rs-probability" && rsVariants.length === 0) {
        setIsLoadingRSData(true);
        try {
          const [rs0Data, rs50Data, rs100Data] = await Promise.all([
            loadCSVData('./DATA/TEC_reducer_page/M5_J10_config_6CW_RS0.csv'),
            loadCSVData('./DATA/TEC_reducer_page/M5_J10_config_6CW_RS50.csv'),
            loadCSVData('./DATA/TEC_reducer_page/M5_J10_config_6CW_RS100.csv')
          ]);

          const variants: RSVariantData[] = [
            {
              name: 'RS0-HNSGA-II',
              description: 'We stop at the LS strategy',
              color: '#3B82F6', // Blue
              data: rs0Data
            },
            {
              name: 'RS50-HNSGA-II',
              description: 'We apply RS strategy with a 50% probability',
              color: '#10B981', // Green
              data: rs50Data
            },
            {
              name: 'RS100-HNSGA-II',
              description: 'We always use RS after LS',
              color: '#F59E0B', // Orange
              data: rs100Data
            }
          ];

          setRsVariants(variants);
        } catch (error) {
          console.error('Error loading RS data:', error);
        } finally {
          setIsLoadingRSData(false);
        }
      }
    };

    loadRSData();
  }, [selectedTest, rsVariants.length]);

  // Reset states when test changes
  const handleTestChange = (value: string) => {
    setSelectedTest(value);
    setShowSorting(false);
    setShowLS(false);
    setShowRS(false);
  };

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
          <div className="mt-6 grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{cmax}</div>
              <div className="text-sm text-gray-500">Cmax</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{tec}</div>
              <div className="text-sm text-gray-500">TEC</div>
            </div>
        </div>
      </div>
    </div>
  );
  };


  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-80 h-screen bg-card border-r border-border p-6 overflow-y-auto sticky top-0">
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings2 className="w-5 h-5 text-primary" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Test</label>
              <Select value={selectedTest} onValueChange={handleTestChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  
                  <SelectItem value="tec-reduction">TEC Reduction Process</SelectItem>
                  <SelectItem value="rs-probability">Right Shift Probability</SelectItem>
                  <SelectItem value="tec-gap">TEC Gaps before</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* TEC Reducer Description */}
        {(selectedTest === "tec-reduction" || selectedTest === "tec-gap") && (
          <Card className="mt-6 shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">TEC Reducer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-muted rounded-md">
                <div className="font-medium text-accent">Period Sorting</div>
                <div className="text-muted-foreground">Reorganizes jobs based on energy pricing periods to minimize cost</div>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <div className="font-medium text-accent">Left Shift (LS)</div>
                <div className="text-muted-foreground">Shifts jobs to earlier time slots to reduce makespan and energy cost</div>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <div className="font-medium text-accent">Right Shift (RS)</div>
                <div className="text-muted-foreground">Strategically delays jobs to align with lower-cost energy periods</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* RS Probability Description */}
        {selectedTest === "rs-probability" && (
          <Card className="mt-6 shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">RS Probability Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 bg-muted rounded-md">
                <div className="font-medium text-accent">RS0</div>
                <div className="text-muted-foreground">We stop at the LS strategy</div>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <div className="font-medium text-accent">RS50</div>
                <div className="text-muted-foreground">We apply RS strategy with a 50% probability</div>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <div className="font-medium text-accent">RS100</div>
                <div className="text-muted-foreground">We always use RS after LS</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
                onClick={() => navigate("/multi-objective/meta")}
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Components
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                TEC Reduction Operator
              </h1>
              <p className="text-muted-foreground">
                  {selectedTest === "tec-reduction" 
                    ? "Step-by-step visualization of the TEC reduction process with energy pricing"
                    : "Analysis of Right Shift probability effects on algorithm performance"
                  }
              </p>
              </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
          {selectedTest === "tec-reduction" && (
            <>
              {/* Interactive TEC Reduction Process */}
        <Card>
          <CardHeader>
                  <CardTitle>TEC Reduction Process</CardTitle>
                  <p className="text-muted-foreground">
                    Follow the step-by-step transformation of the schedule to reduce Total Energy Cost
                  </p>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Always show initial schedule */}
            <GanttChart scheduleKey="initial" title="Initial Schedule" />
            
            {/* Period Sorting Button and Schedule */}
            <div className="flex justify-center">
              <Button 
                onClick={() => setShowSorting(true)}
                className="px-8"
                disabled={showSorting}
                size="lg"
              >
                Apply Period Sorting
              </Button>
            </div>

            {showSorting && (
              <GanttChart scheduleKey="sorting" title="Schedule After Period Sorting" />
            )}
            
            {/* Left Shift Button and Schedule */}
            {showSorting && (
              <>
                <div className="flex justify-center">
                  <Button 
                    onClick={() => setShowLS(true)}
                    className="px-8"
                    disabled={showLS}
                    size="lg"
                  >
                    Apply Left Shift
                  </Button>
                </div>
                
                {showLS && (
                  <GanttChart scheduleKey="afterLS" title="Schedule After Left Shift" />
                )}
              </>
            )}
            
            {/* Right Shift Button and Schedule */}
            {showLS && (
              <>
            <div className="flex justify-center">
              <Button 
                    onClick={() => setShowRS(true)}
                className="px-8"
                    disabled={showRS}
                    size="lg"
              >
                Apply Right Shift
              </Button>
            </div>

                {showRS && (
                  <GanttChart scheduleKey="afterRS" title="Schedule After Right Shift" />
                )}
              </>
            )}
          </CardContent>
        </Card>

                {/* Summary comparison */}
                {showRS && (
        <Card>
          <CardHeader>
                      <CardTitle>TEC Reduction Summary</CardTitle>
                </CardHeader>
                <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(objectives).map(([key, obj]) => (
                          <div key={key} className="p-4 bg-muted rounded-lg text-center">
                            <h4 className="font-medium mb-2 capitalize">
                              {key === 'afterLS' ? 'After LS' : key === 'afterRS' ? 'After RS' : key}
                            </h4>
                            <div className="space-y-1">
                              <div className="text-lg font-bold text-blue-600">{obj.cmax}</div>
                              <div className="text-sm text-muted-foreground">Cmax</div>
                              <div className="text-lg font-bold text-green-600">{obj.tec}</div>
                              <div className="text-sm text-muted-foreground">TEC</div>
                            </div>
                          </div>
                        ))}
                          </div>
                       
                      <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                          TEC Reduction Achievement
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          The TEC reduction process achieved a <strong>41.5% reduction</strong> in Total Energy Cost 
                          (from 193.2 to 113.0), demonstrating the effectiveness of period sorting and shift strategies 
                          in optimizing energy usage during different pricing periods.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
            </>
          )}

          {selectedTest === "rs-probability" && (
            <>
              {/* RS Description Card */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Right Shift Probability Analysis</CardTitle>
                  <p className="text-muted-foreground">
                    Analyze the impact of different Right Shift probabilities on algorithm performance
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="font-semibold text-blue-800 dark:text-blue-200 mb-2">RS0-HNSGA-II</div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        We stop at the LS strategy
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="font-semibold text-green-800 dark:text-green-200 mb-2">RS50-HNSGA-II</div>
                      <div className="text-sm text-green-700 dark:text-green-300">
                        We apply RS strategy with a 50% probability
                      </div>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="font-semibold text-orange-800 dark:text-orange-200 mb-2">RS100-HNSGA-II</div>
                      <div className="text-sm text-orange-700 dark:text-orange-300">
                        We always use RS after LS
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Individual Pareto Charts */}
              {/* Individual Pareto Charts */}
              <Card>
  <CardHeader>
    <CardTitle>Pareto Fronts Analysis</CardTitle>
    <p className="text-muted-foreground">
      Individual Pareto fronts for each RS probability variant
    </p>
  </CardHeader>
  <CardContent>
    {isLoadingRSData ? (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-muted-foreground">Loading RS probability data...</div>
        </div>
      </div>
    ) : rsVariants.length > 0 ? (
      <div className="flex flex-col gap-6">
        {/* Individual charts */}
        {rsVariants.map((variant) => (
          <IndividualParetoChart key={variant.name} variant={variant} />
        ))}

        {/* Combined chart (SVG, same style as individuals) */}
        <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
          <div className="text-center mb-4">
            <h4 className="text-lg font-semibold">Combined Pareto Fronts</h4>
            <p className="text-sm text-muted-foreground">All RS probability variants overlaid</p>
          </div>

          <div className="flex justify-center">
            {(() => {
              // Collect all pareto points across variants
              const allPoints = rsVariants.flatMap(v => v.data.filter(p => p.isPareto));
              const minMakespan = Math.min(...allPoints.map(p => p.makespan));
              const maxMakespan = Math.max(...allPoints.map(p => p.makespan));
              const minTEC = Math.min(...allPoints.map(p => p.tec));
              const maxTEC = Math.max(...allPoints.map(p => p.tec));

              const chartWidth = 500;
              const chartHeight = 350;
              const margin = { top: 20, right: 20, bottom: 60, left: 60 };
              const plotWidth = chartWidth - margin.left - margin.right;
              const plotHeight = chartHeight - margin.top - margin.bottom;

              const scaleX = (makespan: number) =>
                ((makespan - minMakespan) / (maxMakespan - minMakespan)) * plotWidth + margin.left;
              const scaleY = (tec: number) =>
                plotHeight - ((tec - minTEC) / (maxTEC - minTEC)) * plotHeight + margin.top;

              return (
                <svg width={chartWidth} height={chartHeight} className="border border-gray-200">
                  {/* Grid */}
                  <defs>
                    <pattern id="grid-combined" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect
                    width={plotWidth}
                    height={plotHeight}
                    x={margin.left}
                    y={margin.top}
                    fill="url(#grid-combined)"
                  />

                  {/* Axes */}
                  <line
                    x1={margin.left}
                    y1={margin.top + plotHeight}
                    x2={margin.left + plotWidth}
                    y2={margin.top + plotHeight}
                    stroke="black"
                    strokeWidth="2"
                  />
                  <line
                    x1={margin.left}
                    y1={margin.top}
                    x2={margin.left}
                    y2={margin.top + plotHeight}
                    stroke="black"
                    strokeWidth="2"
                  />

                  {/* Pareto points for each variant */}
                  {rsVariants.map((variant, vi) =>
                    variant.data.filter(p => p.isPareto).map((point, idx) => (
                      <circle
                        key={`${vi}-${idx}`}
                        cx={scaleX(point.makespan)}
                        cy={scaleY(point.tec)}
                        r="4"
                        fill={variant.color}
                        stroke="white"
                        strokeWidth="1.5"
                        opacity="0.85"
                      />
                    ))
                  )}

                  {/* Labels */}
                  <text
                    x={margin.left + plotWidth / 2}
                    y={chartHeight - 15}
                    textAnchor="middle"
                    className="text-xs font-medium"
                  >
                    Makespan (Cmax)
                  </text>
                  <text
                    x={15}
                    y={margin.top + plotHeight / 2}
                    textAnchor="middle"
                    transform={`rotate(-90 15 ${margin.top + plotHeight / 2})`}
                    className="text-xs font-medium"
                  >
                    TEC
                  </text>
                </svg>
              );
            })()}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4">
            {rsVariants.map((variant) => (
              <div key={variant.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: variant.color }}></span>
                <span className="text-sm">{variant.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ) : (
      <div className="h-96 flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center text-muted-foreground">
          <div className="text-lg font-medium mb-2">Failed to Load Data</div>
          <div className="text-sm">
            Could not load RS probability data files.<br />
            Please ensure the CSV files are available in the DATA folder.
          </div>
        </div>
      </div>
    )}
  </CardContent>
</Card>



              {/* Performance Summary */}
              {rsVariants.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Performance Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {rsVariants.map((variant) => {
                        const paretoPoints = variant.data.filter(p => p.isPareto);
                        const bestMakespan = Math.min(...paretoPoints.map(p => p.makespan));
                        const bestTEC = Math.min(...paretoPoints.map(p => p.tec));
                        const avgExecutionTime = paretoPoints.reduce((sum, p) => sum + p.executionTime, 0) / paretoPoints.length;
                        
                        return (
                          <div key={variant.name} className="p-4 bg-muted rounded-lg">
                            <h4 className="font-medium mb-3" style={{ color: variant.color }}>
                              {variant.name}
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Pareto Points:</span>
                                <span className="font-medium">{paretoPoints.length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Best Makespan:</span>
                                <span className="font-medium">{bestMakespan}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Best TEC:</span>
                                <span className="font-medium">{bestTEC.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Execution Time:</span>
                                <span className="font-medium">{avgExecutionTime.toFixed(2)}s</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                        RS Probability Analysis
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Each RS probability variant produces its own Pareto front showing different trade-offs between 
                        makespan and energy cost. The comparison reveals how the Right Shift strategy probability affects 
                        the solution space, with each variant potentially excelling in different regions of the objective space.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {selectedTest === "tec-gap" && (
            <>
              <Card className="mt-6 shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    TEC Gaps before
                  </CardTitle>
                  <p className="text-blue-600 text-sm mt-1">
                    Comparison between the best TEC values produced by <span className="font-medium">HNSGA-II</span>, <span className="font-medium">HMOGVNS</span>, and <span className="font-medium">HMOSA</span> for the instances where the model was able to find the optimal solution.
                  </p>
                </CardHeader>
              </Card>

            </>
          )}{selectedTest === "tec-gap" && (
            <Card className="mt-6 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  TEC Gaps Comparison
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Performance of different algorithms on benchmark instances
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Jobs</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Mach.</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Inst.</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Optimal TEC</th>
          
                        {/* HNSGA-II */}
                        <th className="px-4 py-2 text-center font-medium text-primary">HNSGA-II Best TEC</th>
                        <th className="px-4 py-2 text-center font-medium text-primary">Gap</th>
          
                        {/* HMOGVNS */}
                        <th className="px-4 py-2 text-center font-medium text-blue-600">HMOGVNS Best TEC</th>
                        <th className="px-4 py-2 text-center font-medium text-blue-600">Gap</th>
          
                        {/* HMOSA */}
                        <th className="px-4 py-2 text-center font-medium text-amber-600">HMOSA Best TEC</th>
                        <th className="px-4 py-2 text-center font-medium text-amber-600">Gap</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      <tr>
                        <td className="px-4 py-2">10</td>
                        <td className="px-4 py-2">5</td>
                        <td className="px-4 py-2">3</td>
                        <td className="px-4 py-2">98,52</td>
                        <td className="px-4 py-2 text-center">139,9</td>
                        <td className="px-4 py-2 text-center">42%</td>
                        <td className="px-4 py-2 text-center">144,6</td>
                        <td className="px-4 py-2 text-center">47%</td>
                        <td className="px-4 py-2 text-center">140,98</td>
                        <td className="px-4 py-2 text-center">43%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2">10</td>
                        <td className="px-4 py-2">5</td>
                        <td className="px-4 py-2">4</td>
                        <td className="px-4 py-2">96,48</td>
                        <td className="px-4 py-2 text-center">142,64</td>
                        <td className="px-4 py-2 text-center">48%</td>
                        <td className="px-4 py-2 text-center">149,88</td>
                        <td className="px-4 py-2 text-center">55%</td>
                        <td className="px-4 py-2 text-center">139,16</td>
                        <td className="px-4 py-2 text-center">44,2%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2">10</td>
                        <td className="px-4 py-2">5</td>
                        <td className="px-4 py-2">6</td>
                        <td className="px-4 py-2">105,27</td>
                        <td className="px-4 py-2 text-center">146,4</td>
                        <td className="px-4 py-2 text-center">39%</td>
                        <td className="px-4 py-2 text-center">166,56</td>
                        <td className="px-4 py-2 text-center">58%</td>
                        <td className="px-4 py-2 text-center">144,61</td>
                        <td className="px-4 py-2 text-center">37,30%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2">10</td>
                        <td className="px-4 py-2">5</td>
                        <td className="px-4 py-2">8</td>
                        <td className="px-4 py-2">94,8</td>
                        <td className="px-4 py-2 text-center">126,64</td>
                        <td className="px-4 py-2 text-center">33,50%</td>
                        <td className="px-4 py-2 text-center">128,56</td>
                        <td className="px-4 py-2 text-center">35,60%</td>
                        <td className="px-4 py-2 text-center">114,42</td>
                        <td className="px-4 py-2 text-center">20,70%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2">10</td>
                        <td className="px-4 py-2">5</td>
                        <td className="px-4 py-2">9</td>
                        <td className="px-4 py-2">111,15</td>
                        <td className="px-4 py-2 text-center">137,48</td>
                        <td className="px-4 py-2 text-center">23,60%</td>
                        <td className="px-4 py-2 text-center">140,08</td>
                        <td className="px-4 py-2 text-center">26,02%</td>
                        <td className="px-4 py-2 text-center">139,56</td>
                        <td className="px-4 py-2 text-center">25%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default TECReductionPage;