// Data service for integrating with real data from DATA folder

export interface ProcessingTimesData {
  jobs: number;
  machines: number;
  processingTimes: number[][];
  energyPrices: {
    "6CW": number[];
    "6CWD": number[];
    "6CWI": number[];
  };
}

export interface ParetoPoint {
  makespan: number;
  tec: number;
  pareto: boolean;
  executionTime: number;
}

export interface ParetoData {
  algorithm: string;
  points: ParetoPoint[];
}

export interface MetricsData {
  instance: number;
  machines: number;
  jobs: number;
  algorithm: string;
  igd: number;
  gd: number;
  sns: number;
  nps: number;
  exec_time: number;
}

// Domination function
export function dominates(fitness1: [number, number], fitness2: [number, number]): boolean {
  return fitness1[0] <= fitness2[0] && fitness1[1] <= fitness2[1] && 
         (fitness1[0] < fitness2[0] || fitness1[1] < fitness2[1]);
}

// Load processing times from Gap file
export async function loadProcessingTimes(jobs: number, machines: number, instance: number): Promise<ProcessingTimesData> {
  try {
    const gapFile = `VFR${jobs}_${machines}_${instance}_Gap.txt`;
    const response = await fetch(`./DATA/new_data/${gapFile}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load processing times: ${response.statusText}`);
    }
    
    const text = await response.text();
    const lines = text.trim().split('\n');
    
    // Parse header (first line contains total time)
    const totalTime = parseInt(lines[0]);
    
    // Parse processing times (remaining lines)
    const processingTimes: number[][] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].trim().split(/\s+/).map(v => parseInt(v));
      const row: number[] = new Array(machines).fill(0);
      
      for (let j = 0; j < values.length; j += 2) {
        const machineId = values[j];
        const processingTime = values[j + 1];
        if (machineId < machines) {
          row[machineId] = processingTime;
        }
      }
      processingTimes.push(row);
    }
    
    // Energy prices for 6CW profile (standard)
    const energyPrices = {
      "6CW": [0.08, 0.12, 0.08, 0.12, 0.08, 0.04],
      "6CWD": [0.12, 0.08, 0.04, 0.08, 0.12, 0.08],
      "6CWI": [0.04, 0.08, 0.12, 0.08, 0.12, 0.08]
    };
    
    return {
      jobs,
      machines,
      processingTimes,
      energyPrices
    };
  } catch (error) {
    console.error('Error loading processing times:', error);
    // Return mock data as fallback
    return generateMockProcessingTimes(jobs, machines, instance);
  }
}

// Load Pareto front data from CSV files with correct file naming logic
export async function loadParetoData(jobs: number, machines: number, instance: number): Promise<ParetoData[]> {
  const algorithms = [
    { 
      name: 'HNSGA-II', 
      folder: 'NSGA_Pareto_rate1',
      getFileName: (m: number, j: number, pricePeriod: string, inst: number) => 
        `M${m}_J${j}_config_${pricePeriod}_${inst}.csv`
    },
    { 
      name: 'HMOGVNS', 
      folder: 'VNS_Pareto_rate1',
      getFileName: (m: number, j: number, pricePeriod: string, inst: number) => 
        `M${m}_J${j}_config_${pricePeriod}_${inst-1}.csv`
    },
    { 
      name: 'HMOSA', 
      folder: 'SA_Pareto_rate1',
      getFileName: (m: number, j: number, pricePeriod: string, inst: number) => 
        `M${m}_J${j}_config_${pricePeriod}_${inst%10}.csv`
    }
  ];
  
  const results: ParetoData[] = [];
  
  for (const algorithm of algorithms) {
    try {
      const fileName = algorithm.getFileName(machines, jobs, '6CW', instance);
      const response = await fetch(`./DATA/${algorithm.folder}/${fileName}`);
      
      if (!response.ok) {
        console.warn(`Failed to load ${algorithm.name} data: ${response.statusText}`);
        continue;
      }
      
      const text = await response.text();
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',');
      
      const points: ParetoPoint[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const point: ParetoPoint = {
          makespan: parseFloat(values[0]),
          tec: parseFloat(values[1]),
          pareto: values[2].toLowerCase() === 'true',
          executionTime: parseFloat(values[3])
        };
        points.push(point);
      }
      
      // Filter Pareto points and remove dominated ones (following Python logic)
      const paretoPoints = points.filter(p => p.pareto);
      const nonDominatedPoints = filterDominatedPoints(paretoPoints);
      
      results.push({
        algorithm: algorithm.name,
        points: nonDominatedPoints
      });
      
    } catch (error) {
      console.error(`Error loading ${algorithm.name} data:`, error);
    }
  }
  
  return results;
}

// Load sensitivity analysis data for different price profiles
export async function loadSensitivityAnalysisData(jobs: number, machines: number, instance: number): Promise<ParetoData[]> {
  const priceProfiles = [
    { name: 'HNSGA-II-6CW', folder: 'NSGA_Pareto_rate1', suffix: '6CW' },
    { name: 'HNSGA-II-6CWD', folder: 'NSGA_Pareto_rate1', suffix: '6CWD' },
    { name: 'HNSGA-II-6CWI', folder: 'NSGA_Pareto_rate1', suffix: '6CWI' }
  ];
  
  const results: ParetoData[] = [];
  
  for (const profile of priceProfiles) {
    try {
      const fileName = `M${machines}_J${jobs}_config_${profile.suffix}_${instance}.csv`;
      const response = await fetch(`./DATA/${profile.folder}/${fileName}`);
      
      if (!response.ok) {
        console.warn(`Failed to load ${profile.name} data: ${response.statusText}`);
        continue;
      }
      
      const text = await response.text();
      const lines = text.trim().split('\n');
      
      const points: ParetoPoint[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const point: ParetoPoint = {
          makespan: parseFloat(values[0]),
          tec: parseFloat(values[1]),
          pareto: values[2].toLowerCase() === 'true',
          executionTime: parseFloat(values[3])
        };
        points.push(point);
      }
      
      // Filter Pareto points and remove dominated ones
      const paretoPoints = points.filter(p => p.pareto);
      const nonDominatedPoints = filterDominatedPoints(paretoPoints);
      
      results.push({
        algorithm: profile.name,
        points: nonDominatedPoints
      });
      
    } catch (error) {
      console.error(`Error loading ${profile.name} data:`, error);
    }
  }
  
  return results;
}

// Filter out dominated points from Pareto front (following Python logic)
function filterDominatedPoints(points: ParetoPoint[]): ParetoPoint[] {
  const nonDominated: ParetoPoint[] = [];
  
  for (let i = 0; i < points.length; i++) {
    const point1 = points[i];
    let dominated = false;
    
    for (let j = 0; j < points.length; j++) {
      if (i === j) continue;
      
      const point2 = points[j];
      if (dominates([point2.makespan, point2.tec], [point1.makespan, point1.tec])) {
        dominated = true;
        break;
      }
    }
    
    if (!dominated) {
      nonDominated.push(point1);
    }
  }
  
  return nonDominated;
}

// Load real metrics data from Excel file (converted to JSON)
export async function loadMetricsData(jobs: number, machines: number, instance: number): Promise<MetricsData[]> {
  try {
    // Load the metrics data from the Excel file (converted to JSON)
    const response = await fetch('./DATA/MH_comparison/metrics_results.json');
    
    if (!response.ok) {
      console.warn('Failed to load metrics data, using mock data');
      return generateMockMetricsData(jobs, machines, instance);
    }
    
    const allMetrics: MetricsData[] = await response.json();
    
    // Filter metrics for the specific configuration
    const filteredMetrics = allMetrics.filter(metric => 
      metric.jobs === jobs && 
      metric.machines === machines && 
      metric.instance === instance
    );
    
    return filteredMetrics;
  } catch (error) {
    console.error('Error loading metrics data:', error);
    return generateMockMetricsData(jobs, machines, instance);
  }
}

// Mock data generators for fallback
function generateMockProcessingTimes(jobs: number, machines: number, instance: number): ProcessingTimesData {
  const processingTimes: number[][] = [];
  const seed = jobs * machines * instance;
  
  for (let job = 0; job < jobs; job++) {
    const row: number[] = [];
    for (let machine = 0; machine < machines; machine++) {
      const processingTime = Math.floor(((seed + job + machine) % 20)) + 5;
      row.push(processingTime);
    }
    processingTimes.push(row);
  }
  
  return {
    jobs,
    machines,
    processingTimes,
    energyPrices: {
      "6CW": [0.08, 0.12, 0.08, 0.12, 0.08, 0.04],
      "6CWD": [0.12, 0.08, 0.04, 0.08, 0.12, 0.08],
      "6CWI": [0.04, 0.08, 0.12, 0.08, 0.12, 0.08]
    }
  };
}

function generateMockMetricsData(jobs: number, machines: number, instance: number): MetricsData[] {
  const algorithms = ['HNSGA-II', 'HMOSA', 'HMOVNS'];
  const baseIGD = 0.005 + (instance * 0.002);
  const baseGD = 1.5 + (instance * 0.5);
  const baseSNS = 0.79 - (instance * 0.01);
  const baseNPS = 90 + (instance * 5);
  const baseExec = 3 + (instance * 1);
  
  return algorithms.map((algorithm, index) => ({
    instance,
    machines,
    jobs,
    algorithm,
    igd: baseIGD + (index * 0.005),
    gd: baseGD + (index * 2),
    sns: baseSNS - (index * 0.02),
    nps: baseNPS - (index * 20),
    exec_time: baseExec + (index * 2)
  }));
}
