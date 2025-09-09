import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const ProblemDataPage = () => {
  const navigate = useNavigate();

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
              <h1 className="text-2xl font-bold text-foreground">Problem Data</h1>
              <p className="text-muted-foreground">Benchmark, energy considerations, and parameters</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8 max-w-6xl mx-auto">
        {/* Scheme */}
        <Card>
          <CardHeader>
            <CardTitle>Problem Overview</CardTitle>
          </CardHeader>
          <CardContent >
            <div className="flex flex-col items-center gap-4">
              <div className="px-4 py-2 rounded-md bg-muted text-sm font-medium">VRF benchmark</div>
              {/* Down arrow with head */}
              <svg width="140" height="60" viewBox="0 0 140 60" className="text-purple-600">
                <defs>
                  <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                    <polygon points="0 0, 8 4, 0 8" fill="currentColor" />
                  </marker>
                </defs>
                <path d="M70 0 L70 50" stroke="currentColor" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
              </svg>
              <div className="px-4 py-2 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-sm font-medium">
                Energy Considerations
              </div>
              <div className="flex items-start justify-between gap-16 mt-2 w-full max-w-md">
                {/* Elbow left */}
                <svg width="160" height="80" viewBox="0 0 160 80" className="text-purple-600">
                  <defs>
                    <marker id="arrowhead2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                      <polygon points="0 0, 8 4, 0 8" fill="currentColor" />
                    </marker>
                  </defs>
                  <path d="M80 0 L20 0 L20 60" stroke="currentColor" strokeWidth="2" fill="none" markerEnd="url(#arrowhead2)" />
                </svg>
                {/* Elbow right */}
                <svg width="160" height="80" viewBox="0 0 160 80" className="text-purple-600">
                  <defs>
                    <marker id="arrowhead3" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                      <polygon points="0 0, 8 4, 0 8" fill="currentColor" />
                    </marker>
                  </defs>
                  <path d="M80 0 L140 0 L140 60" stroke="currentColor" strokeWidth="2" fill="none" markerEnd="url(#arrowhead3)" />
                </svg>
              </div>
              <div className="flex items-start justify-between gap-16 w-full max-w-md -mt-6">
                <div className="px-4 py-2 rounded-md bg-muted text-sm font-medium">Time related parameters</div>
                <div className="px-4 py-2 rounded-md bg-muted text-sm font-medium">Pricing Parameters</div>
              </div>
            </div>

           {/* Button with spacing below last div */}
            <div className="flex justify-end mt-6">
            <a href="/DATA/new_data.zip" download>
                <Button
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                Download Data
                </Button>
            </a>
            </div>
          </CardContent>
        </Card>


        <Card className="shadow-card">
                    <CardHeader>
                        <CardTitle>Example PS File - Instance 4 with 10 jobs and 10 machines</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-gray-900 font-mono p-4 rounded-lg overflow-auto text-sm">
                        {/* Filename */}
                        <div className="text-white mb-4 font-semibold">VFR10_10_4_Gap.txt</div>

                        {/* File content with aligned columns */}
                        <div className="text-green-500 space-y-1">
                            {/* First line */}
                            <div className="grid grid-cols-[auto_auto] gap-x-4">
                            10 10
                            
                            </div>
                            
                            {/* Data rows */}
                            <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-x-2">
                            <span>0</span><span>96</span><span>1</span><span>77</span><span>2</span><span>39</span><span>3</span><span>67</span><span>4</span><span>55</span><span>5</span><span>52</span><span>6</span><span>45</span><span>7</span><span>42</span><span>8</span><span>56</span><span>9</span><span>37</span>
                            </div>
                            <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-x-2">
                            <span>0</span><span>97</span><span>1</span><span>78</span><span>2</span><span>39</span><span>3</span><span>89</span><span>4</span><span>21</span><span>5</span><span>24</span><span>6</span><span>13</span><span>7</span><span>52</span><span>8</span><span>18</span><span>9</span><span>67</span>
                            </div>
                            <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-x-2">
                            <span>0</span><span>22</span><span>1</span><span>82</span><span>2</span><span>67</span><span>3</span><span>80</span><span>4</span><span>98</span><span>5</span><span>85</span><span>6</span><span>73</span><span>7</span><span>71</span><span>8</span><span>7</span><span>9</span><span>60</span>
                            </div>
                            <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-x-2">
                            <span>0</span><span>30</span><span>1</span><span>98</span><span>2</span><span>73</span><span>3</span><span>22</span><span>4</span><span>67</span><span>5</span><span>9</span><span>6</span><span>62</span><span>7</span><span>93</span><span>8</span><span>87</span><span>9</span><span>98</span>
                            </div>
                            <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-x-2">
                            <span>0</span><span>31</span><span>1</span><span>40</span><span>2</span><span>7</span><span>3</span><span>3</span><span>4</span><span>68</span><span>5</span><span>13</span><span>6</span><span>45</span><span>7</span><span>73</span><span>8</span><span>26</span><span>9</span><span>24</span>
                            </div>
                            <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-x-2">
                            <span>0</span><span>55</span><span>1</span><span>91</span><span>2</span><span>65</span><span>3</span><span>55</span><span>4</span><span>73</span><span>5</span><span>21</span><span>6</span><span>1</span><span>7</span><span>98</span><span>8</span><span>24</span><span>9</span><span>20</span>
                            </div>
                            <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-x-2">
                            <span>0</span><span>9</span><span>1</span><span>46</span><span>2</span><span>17</span><span>3</span><span>44</span><span>4</span><span>21</span><span>5</span><span>7</span><span>6</span><span>29</span><span>7</span><span>14</span><span>8</span><span>35</span><span>9</span><span>10</span>
                            </div>
                            <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-x-2">
                            <span>0</span><span>46</span><span>1</span><span>42</span><span>2</span><span>10</span><span>3</span><span>7</span><span>4</span><span>4</span><span>5</span><span>30</span><span>6</span><span>24</span><span>7</span><span>12</span><span>8</span><span>73</span><span>9</span><span>81</span>
                            </div>
                            <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-x-2">
                            <span>0</span><span>5</span><span>1</span><span>8</span><span>2</span><span>61</span><span>3</span><span>96</span><span>4</span><span>81</span><span>5</span><span>35</span><span>6</span><span>25</span><span>7</span><span>44</span><span>8</span><span>2</span><span>9</span><span>33</span>
                            </div>
                            <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-x-2">
                            <span>0</span><span>23</span><span>1</span><span>24</span><span>2</span><span>14</span><span>3</span><span>84</span><span>4</span><span>62</span><span>5</span><span>60</span><span>6</span><span>18</span><span>7</span><span>17</span><span>8</span><span>92</span><span>9</span><span>3</span>
                            </div>
                        </div>
                        </div>
                    </CardContent>
                </Card>
        
                <Card className="shadow-card">
                <CardHeader>
                    <CardTitle>Example Extended Data - Instance 4 with 10 jobs and 10 machines</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-gray-900 font-mono p-4 rounded-lg overflow-auto text-sm text-green-500">
                    {/* Filename */}
                    <div className="text-white mb-2">VFR10_10_4_Gap__6CW.txt</div>

                    {/* Time horizon */}
                    2264 <br/>

                    {/* Period start */}
                    1 190 567 1133 1510 1699 <br/>

                    {/* Period end */}
                    189 566 1132 1509 1698 2264 <br/>

                    {/* Prices */}
                    0.08 0.12 0.08 0.12 0.08 0.04
                    </div>
                </CardContent>
                </Card>


        {/* Example of Extended Data */}
        {/* <Card className="shadow-card">
            <CardHeader>
                <CardTitle>Example of Extended Data: 10 jobs, 5 machines, instance 1</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4 text-sm font-medium">Time Horizon: 2052</div>

                <div className="mb-2 text-xs font-medium">Period Start:</div>
                <div className="flex gap-2 flex-wrap">
                { [1, 172, 514, 1027, 1369, 1540].map((start, idx) => {
                    const colors = ['bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200', 'bg-pink-200', 'bg-teal-200'];
                    return (
                    <div
                        key={idx}
                        className={`${colors[idx]} px-2 py-1 rounded cursor-pointer hover:scale-105 transition-transform`}
                        title={`Period ${idx + 1} Start: ${start}`}
                    >
                        {start}
                    </div>
                    );
                })}
                </div>

                <div className="mt-2 mb-2 text-xs font-medium">Period End:</div>
                <div className="flex gap-2 flex-wrap">
                { [171, 513, 1026, 1368, 1539, 2052].map((end, idx) => {
                    const colors = ['bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200', 'bg-pink-200', 'bg-teal-200'];
                    return (
                    <div
                        key={idx}
                        className={`${colors[idx]} px-2 py-1 rounded cursor-pointer hover:scale-105 transition-transform`}
                        title={`Period ${idx + 1} End: ${end}`}
                    >
                        {end}
                    </div>
                    );
                })}
                </div>

                <div className="mt-2 mb-2 text-xs font-medium">Price:</div>
                <div className="flex gap-2 flex-wrap">
                { [0.08, 0.12, 0.08, 0.12, 0.08, 0.04].map((price, idx) => {
                    let color = 'bg-gray-200';
                    if (price === 0.08) color = 'bg-orange-300';
                    else if (price === 0.12) color = 'bg-red-400';
                    else if (price === 0.04) color = 'bg-green-300';

                    return (
                    <div
                        key={idx}
                        className={`${color} px-2 py-1 rounded cursor-pointer hover:scale-105 transition-transform`}
                        title={`Price: ${price}`}
                    >
                        {price.toFixed(2)}
                    </div>
                    );
                })}
                </div>
            </CardContent>
            </Card> */}


        {/* Electricity Prices Histogram (reuse from ProcessingTimesChart visual style) */}
        <Card>
          <CardHeader>
            <CardTitle>Electricity Prices Histogram</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="flex gap-2">
                {[{p:0.08,c:'#f97316',d:'H/12'},{p:0.12,c:'#ef4444',d:'H/6'},{p:0.08,c:'#f97316',d:'H/4'},{p:0.12,c:'#ef4444',d:'H/6'},{p:0.08,c:'#f97316',d:'H/12'},{p:0.04,c:'#22c55e',d:'H/4'}].map((x,i)=> (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className="rounded-t flex items-end justify-center text-white text-xs font-medium px-1"
                      style={{
                        height: `${(x.p/0.12)*120+20}px`,
                        width: x.d === 'H/12' ? '30px' : x.d === 'H/6' ? '60px' : '90px',
                        backgroundColor: x.c
                      }}
                    >
                      {x.p}
                    </div>
                    <div className="mt-2 text-xs text-center" style={{ width: x.d === 'H/12' ? '30px' : x.d === 'H/6' ? '60px' : '90px' }}>
                      <div className="font-medium">{`P${i+1}`}</div>
                      <div className="text-muted-foreground text-xs">{x.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links to sub-pages */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="group cursor-pointer border-purple-300/40 hover:border-purple-400 hover:shadow-[0_8px_30px_rgb(127,90,240,0.25)] transition-all duration-300 transform hover:scale-[1.02]">
            <CardContent className="p-8 text-center space-y-6 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-300">Sensitivity Analysis</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Show how the distribution of the prices affects the solution quality</p>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={() => navigate('/multi-objective/sensitivity')}>
                Explore
              </Button>
            </CardContent>
          </Card>

          <Card className="group cursor-pointer border-purple-300/40 hover:border-purple-400 hover:shadow-[0_8px_30px_rgb(127,90,240,0.25)] transition-all duration-300 transform hover:scale-[1.02]">
            <CardContent className="p-8 text-center space-y-6 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-300">Additional data (PS and PB)</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Machine consumption scenarios with PS/PB rates and comparisons</p>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={() => navigate('/multi-objective/data/additional')}>
                Explore
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProblemDataPage;


