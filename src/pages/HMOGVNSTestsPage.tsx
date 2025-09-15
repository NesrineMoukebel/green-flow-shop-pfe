import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Calculator, BarChart3, Settings2 } from "lucide-react";

const HMOGVNSTestsPage = () => {
  const navigate = useNavigate();


  const operatorColors: Record<string, string> = {
    "Machine sequence swap": "bg-purple-100/30 text-purple-700 p-2",
    "Three-machine sequence reordering": "bg-pink-100/30 text-pink-700 p-2",
    "Subsequence inversion": "bg-blue-100/30 text-blue-700 p-2"
  };
  
  const possibleOrders: string[][] = [
    ["Machine sequence swap", "Three-machine sequence reordering", "Subsequence inversion"],
    ];
  // shaking procedures
  const shakingProcedures = [
    { name: "Machine sequence swap (N5)", hammingDistance: 33.87463127, deltaCmax: 22.57155314, deltaTEC: 2.14953597 },
    { name: "Three-machine sequence reordering (N6)", hammingDistance: 73.02831858, deltaCmax: 40.09341339, deltaTEC: 4.19394308 },
    { name: "Subsequence inversion (N7)", hammingDistance: 117.5676991, deltaCmax: 40.43796059, deltaTEC: 5.065323166 }
  ];

  const exampleResults = [
    { procedure: "Machine sequence swap", before: { cmax: 741, tec: 224.56 }, after: { cmax: 742, tec: 223.92 } },
    { procedure: "Three-machine sequence reordering", before: { cmax: 741, tec: 224.56 }, after: { cmax: 1070, tec: 208.04000000000005 } },
    { procedure: "Subsequence inversion", before: { cmax: 741, tec: 224.56 }, after: { cmax: 1171, tec: 202.16000000000008 } }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar - Matching ProblemDataPage style */}
      <div className="w-80 h-screen bg-card border-r border-border p-6 overflow-y-auto sticky top-0">
        {/* Logo Section */}
        <img 
          src="../DATA/images/LOGO.png" 
          alt="Bi-Optima Logo" 
          className="px-auto h-20 w-auto hover:scale-105 transition-transform duration-200 cursor-pointer mb-6" 
          onClick={() => navigate("/")}
        />
        
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">HMOGVNS Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground leading-relaxed">
              <p className="mb-3">
                Analysis of shaking procedures used in HMOGVNS algorithm and their impact on solution quality.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Key Information */}
        <Card className="mt-6 shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Key Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium text-accent">Shaking Procedures</div>
              <div className="text-muted-foreground">Three different neighborhood structures used for diversification</div>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium text-accent">Hamming Distance</div>
              <div className="text-muted-foreground">Measures the difference between two solutions</div>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium text-accent">Delta Metrics</div>
              <div className="text-muted-foreground">Percentage change in Cmax and TEC after applying operators</div>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium text-accent">Solution Quality</div>
              <div className="text-muted-foreground">Impact of each shaking procedure on makespan and energy consumption</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center gap-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/multi-objective/meta")}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Components
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">HMOGVNS Tests</h1>
                <p className="text-gray-600 mt-1">Shaking procedures analysis and performance evaluation</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8 max-w-6xl mx-auto">

        <Card>
                  <CardHeader>
                    <CardTitle>Shaking procedures</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2 text-sm">
                      {possibleOrders.map((seq, i) => (
                        <div key={i} className="flex flex-wrap items-center gap-2 font-mono">
                          
                          {seq.map((op, j) => (
                            <span
                            key={j}
                            className={`inline-block px-3 py-1 rounded-xl text-xs font-semibold border transform transition-transform duration-200 hover:scale-105 ${operatorColors[op]}`}
                          >
                            {op}
                          </span>
                          
                          
                            
                          ))}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
          {/* Hamming Distance Formula Card */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Hamming Distance Formula
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-lg">
                <div className="text-white mb-4 font-semibold">Hamming Distance Calculation</div>
                <div className="space-y-2">
                  <div>H(S₁, S₂) = Σᵢ₌₁ⁿ |S₁[i] - S₂[i]|</div>
                  <div className="text-gray-400 text-sm mt-4">
                    Where:
                    <br />• S₁, S₂ are two solutions
                    <br />• n is the number of positions
                    <br />• H(S₁, S₂) represents the total difference between solutions
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shaking Procedures Results Table */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Shaking Procedures Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  The table below shows the results of the three shaking procedures applied in M-VND. 
                  Delta Cmax and Delta TEC represent the percentage change in the schedule's fitness 
                  (makespan and total energy consumption) after applying each operator.
                </p>
              </div>
              
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Shaking Procedure</TableHead>
                      <TableHead className="font-semibold text-center">Hamming Distance</TableHead>
                      <TableHead className="font-semibold text-center">Delta Cmax (%)</TableHead>
                      <TableHead className="font-semibold text-center">Delta TEC (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shakingProcedures.map((procedure, index) => (
                      <TableRow key={index} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{procedure.name}</TableCell>
                        <TableCell className="text-center">{procedure.hammingDistance.toFixed(8)}</TableCell>
                        <TableCell className="text-center">{procedure.deltaCmax.toFixed(8)}</TableCell>
                        <TableCell className="text-center">{procedure.deltaTEC.toFixed(8)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Cmax and TEC Changes Example */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-primary" />
                Example of Cmax and TEC Changes for Each Operator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Before */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3 text-gray-800">Before:</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono">
                    <div>Cmax = 741</div>
                    <div>TEC = 224.56</div>
                  </div>
                </div>

                {/* After - Shaking */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3 text-blue-800">After Shaking:</h4>
                  <div className="space-y-4">
                    {exampleResults.map((result, index) => (
                      <div key={index} className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono">
                        <div className="text-white font-semibold mb-2">{result.procedure}:</div>
                        <div>Cmax = {result.after.cmax}</div>
                        <div>TEC = {result.after.tec}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HMOGVNSTestsPage;
