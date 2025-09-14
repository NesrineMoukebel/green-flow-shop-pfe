import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Cpu, Target, Settings } from "lucide-react";
import Navbar from "@/components/Navbar";
import MultiObjectiveSidebar from "@/components/MultiObjectiveSidebar";

const MultiObjectivePage = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="flex">
        {/* Sidebar */}
        <MultiObjectiveSidebar />

        {/* Main Dashboard Content */}
        <div className="flex-1 overflow-auto">
          {/* Dashboard Header */}
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="px-8 py-6">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Multi-Objective Analysis Dashboard
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Comprehensive analysis tools for multi-objective optimization of non-permutation flow shop scheduling
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              {/* Overview Section */}
              <Card className="shadow-lg border-0 mb-8">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <BarChart3 className="w-5 h-5" />
                    Multi-Objective Optimization Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-gray-700 leading-relaxed space-y-4">
                    <p>
                      The multi-objective analysis section provides comprehensive tools for optimizing 
                      the non-permutation flow shop scheduling problem with simultaneous consideration 
                      of makespan and energy consumption objectives.
                    </p>
                    <p>
                      This dashboard offers various analysis modules to explore different aspects of 
                      the optimization problem, from problem data visualization to advanced algorithm 
                      comparisons and Pareto front analysis.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <Target className="w-5 h-5" />
                      Optimization Objectives
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span><strong>Makespan:</strong> Minimize total completion time</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span><strong>Energy Cost:</strong> Minimize total energy consumption</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span><strong>Pareto Front:</strong> Trade-off analysis between objectives</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100">
                    <CardTitle className="flex items-center gap-2 text-emerald-800">
                      <Cpu className="w-5 h-5" />
                      Algorithms Available
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span><strong>HNSGA-II:</strong> Hybrid Non-dominated Sorting GA</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span><strong>HMOSA:</strong> Hybrid Multi-objective SA</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span><strong>HMOGVNS:</strong> Hybrid Multi-objective GVNS</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Getting Started */}
              <Card className="shadow-lg border-0 mt-8">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Settings className="w-5 h-5" />
                    Getting Started
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-gray-700 space-y-3">
                    <p>
                      Select any analysis option from the sidebar to begin exploring the multi-objective 
                      optimization results. Each section provides different insights:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li><strong>Problem Data:</strong> Explore benchmark datasets and problem parameters</li>
                      <li><strong>Solution Representation:</strong> Visualize schedule Gantt charts</li>
                      <li><strong>Metaheuristics Components:</strong> Analyze algorithm components and heuristics</li>
                      <li><strong>ILP Model Tests:</strong> Compare with optimal solutions</li>
                      <li><strong>MORL:</strong> Multi-objective reinforcement learning results</li>
                      <li><strong>Hybrid MHs Comparison:</strong> Comprehensive algorithm performance analysis</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiObjectivePage;