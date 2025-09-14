import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Play } from "lucide-react";
import Navbar from "@/components/Navbar";

import { useState } from "react";



const LandingPage = () => {
  const navigate = useNavigate();

  const [activeVariant, setActiveVariant] = useState(0);

  const [activeIndex, setActiveIndex] = useState(0);

  const variants = [
    {
      title: "PFS (Permutation Flow Shop)",
      infos: [
        "Job Sequence: Same for all machines",
        "Machine Config: Single machine per stage",
        "Machine Type: Identical per stage",
        "Job Allocation: Single factory",
        "Scheduling: NP-hard",
        "Focus: Widely studied, strong algorithms",
      ],
    },
    {
      title: "NPFS (Non-Permutation Flow Shop)",
      infos: [
        "Job Sequence: Can vary per machine",
        "Machine Config: Single machine per stage",
        "Machine Type: Identical per stage",
        "Job Allocation: Single factory",
        "Scheduling: NP-hard, larger search space",
        "Focus: Rich solution space, underexplored",
      ],
    },
    {
      title: "DFS (Distributed Flow Shop)",
      infos: [
        "Job Sequence: Same or different across factories",
        "Machine Config: Multiple machines per stage in each factory",
        "Machine Type: Can differ per factory/stage",
        "Job Allocation: Multiple factories, assignment decisions",
        "Scheduling: NP-hard, compounded by assignments",
        "Focus: Coordination & logistics complexity",
      ],
    },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToGetStarted = () => {
    const element = document.getElementById('get-started');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background ">
      <Navbar />



      {/* Hero Section - Card Style with Intentional Grey Shapes */}
      <section className="py-16 px-6 " style={{ backgroundColor: '#fafafa' }}>
        <div className="max-w-6xl mx-auto px-11">
          <Card className="relative overflow-hidden border-0">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src="/green-flow-shop-pfe/DATA/images/HeroSection.png" 
                alt="Hero Background" 
                className="w-full h-full object-cover" 
              />
              {/* Overlay for better text readability */}
              <div className="absolute inset-0 bg-white/30"></div>
            </div>

            <CardContent className="relative z-10 py-20 px-8 text-center">
              <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                  Green Flow Shop
                </h1>
                <h2 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2">
                <span className="bg-primary text-white px-4 py-1 rounded-md">
                  Scheduling Problem
                </span>
                
              </h2>

                <p className="text-lg text-black/60 max-w-2xl mx-auto leading-relaxed">
                  Optimize manufacturing schedules with environmental considerations using advanced algorithms
                </p>
                <div className="pt-6">
                <Button 
                  size="lg"
                  className="bg-white/10 backdrop-blur-xl border border-white/30
                            shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
                            hover:bg-white/20 hover:border-white/40
                            hover:shadow-[0_8px_40px_0_rgba(31,38,135,0.45)]
                            hover:scale-105
                            text-primary text-lg px-10 py-6 rounded-2xl
                            transition-all duration-300 ease-in-out"
                  onClick={scrollToGetStarted}
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>




                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>


      {/* Flow Shop Explanation Section */}
      <section id="about" style={{ backgroundColor: '#fafafa' }} className="py-20 px-25">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div className="space-y-8">
            {/* Non-permutation Flow Shop Badge */}
            <div className="inline-block">
            <div className="bg-primary/10 text-primary px-2 py-0.5 rounded-sm font-medium text-xs border border-primary/20">
              Non-permutation Flow Shop
            </div>

            </div>
            
            <div className="space-y-6">
              <h3 className="text-4xl font-bold text-foreground">
                What is a Flow Shop?
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                A flow shop is a manufacturing system where jobs flow through machines in the same sequence. 
                In a non-permutation flow shop, jobs can have different sequences on different machines, 
                providing more flexibility and better optimization opportunities.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our platform focuses on bi-objective optimization, simultaneously minimizing makespan 
                (total completion time) and total energy cost (TEC) to achieve sustainable and efficient scheduling.
              </p>
            </div>
          </div>

          {/* Right: Demo Card */}
          <div id="demo" className="relative">
            <Card className="border border-border/20 bg-card/50 backdrop-blur-sm shadow-2xl">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-card-foreground">Flow Shop Simulation</h4>
                  <div className="text-sm text-muted-foreground">3 jobs × 3 machines</div>
                </div>
                
                {/* Gantt Chart Visualization */}
                <div className="space-y-3">
                  {/* <div className="text-sm text-muted-foreground">Simulation Time: 52</div> */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-medium text-muted-foreground w-16">Machine 1</div>
                      <div className="flex gap-1 flex-1 h-8">
                        <div className="bg-primary rounded-md flex-[3] flex items-center justify-center text-xs text-white font-medium">Job 1</div>
                        <div className="bg-accent rounded-md flex-[4] flex items-center justify-center text-xs text-white font-medium">Job 2</div>
                        <div className="bg-primary/60 rounded-md flex-[2] flex items-center justify-center text-xs text-white font-medium">Job 3</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-medium text-muted-foreground w-16">Machine 2</div>
                      <div className="flex gap-1 flex-1 h-8">
                        <div className="bg-accent rounded-md flex-[2] flex items-center justify-center text-xs text-white font-medium">Job 2</div>
                        <div className="bg-primary rounded-md flex-[3] flex items-center justify-center text-xs text-white font-medium">Job 1</div>
                        <div className="bg-destructive/80 rounded-md flex-[3] flex items-center justify-center text-xs text-white font-medium">Job 3</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-medium text-muted-foreground w-16">Machine 3</div>
                      <div className="flex gap-1 flex-1 h-8">
                        <div className="bg-primary/60 rounded-md flex-[2] flex items-center justify-center text-xs text-white font-medium">Job 3</div>
                        <div className="bg-destructive/80 rounded-md flex-[2] flex items-center justify-center text-xs text-white font-medium">Job 1</div>
                        <div className="bg-accent rounded-md flex-[4] flex items-center justify-center text-xs text-white font-medium">Job 2</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 pt-4 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-sm"></div>
                    <span className="text-xs text-muted-foreground">Job 1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-accent rounded-sm"></div>
                    <span className="text-xs text-muted-foreground">Job 2</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-destructive/80 rounded-sm"></div>
                    <span className="text-xs text-muted-foreground">Job 3</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border/30">
                  <div className="text-center space-y-1">
                    <div className="text-3xl font-bold text-primary">24.5</div>
                    <div className="text-sm text-muted-foreground">Cmax (hours)</div>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-3xl font-bold text-accent">$186.2</div>
                    <div className="text-sm text-muted-foreground">TEC (cost)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      
      {/* Variants Section - Enhanced Modern Design */}
      <section id="variants" className="py-20 px-32 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Flow Shop Variants
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore different configurations and their unique characteristics
            </p>
          </div>

          {/* Three Equal Height Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {variants.map((variant, index) => (
              <Card 
                key={index}
                className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl border-0 bg-white rounded-2xl overflow-hidden h-[600px] flex flex-col ${
                  activeIndex === index 
                    ? 'ring-4 ring-primary/30 shadow-2xl scale-105' 
                    : 'ring-2 ring-gray-200/50 hover:ring-primary/20'
                }`}
                onClick={() => setActiveIndex(index)}
              >
                <CardContent className="p-8 flex flex-col h-full">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {variant.title}
                    </h4>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      index === 0 ? 'bg-blue-100 text-blue-700' :
                      index === 1 ? 'bg-emerald-100 text-emerald-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {index === 0 ? 'PFS' : index === 1 ? 'NPFS' : 'DFS'}
                    </div>
                  </div>

                  {/* Characteristics */}
                  <div className="flex-1 space-y-4">
                    {variant.infos.map((info, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-emerald-500' :
                          'bg-purple-500'
                        }`}></div>
                        <p className="text-sm text-gray-700 leading-relaxed">{info}</p>
                      </div>
                    ))}
                  </div>

                  
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Visualization Card */}
          <Card className="border-0 bg-white rounded-2xl shadow-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">
                  {variants[activeIndex].title} Visualization
                </h4>
                <p className="text-gray-600">
                  {activeIndex === 0 && "Same job sequence across all machines"}
                  {activeIndex === 1 && "Different job sequences per machine"}
                  {activeIndex === 2 && "Multiple factories with job assignment decisions"}
                </p>
              </div>

              {/* Enhanced Visualizations */}
              <div className="bg-gray-50 rounded-xl p-6">
                {activeIndex === 0 && (
                  <div className="space-y-4">
                    <div className="text-center text-sm text-gray-600 mb-4">
                      <strong>Permutation Flow Shop:</strong> Jobs follow the same sequence (J1→J2→J3) on all machines
                    </div>
                    <div className="space-y-3">
                      {["Machine 1", "Machine 2", "Machine 3"].map((m, mi) => (
                        <div key={mi} className="flex items-center gap-4">
                          <div className="text-sm font-medium text-gray-700 w-20">{m}</div>
                          <div className="flex gap-2 flex-1 h-10">
                            <div className="bg-blue-500 rounded-lg flex-[3] flex items-center justify-center text-sm text-white font-medium shadow-lg">
                              Job 1
                            </div>
                            <div className="bg-emerald-500 rounded-lg flex-[4] flex items-center justify-center text-sm text-white font-medium shadow-lg">
                              Job 2
                            </div>
                            <div className="bg-purple-500 rounded-lg flex-[2] flex items-center justify-center text-sm text-white font-medium shadow-lg">
                              Job 3
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-center text-xs text-gray-500 mt-4">
                      * Processing times vary, but sequence remains consistent
                    </div>
                  </div>
                )}

                {activeIndex === 1 && (
                  <div className="space-y-4">
                    <div className="text-center text-sm text-gray-600 mb-4">
                      <strong>Non-Permutation Flow Shop:</strong> Each machine can have different job sequences
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-medium text-gray-700 w-20">Machine 1</div>
                        <div className="flex gap-2 flex-1 h-10">
                          <div className="bg-blue-500 rounded-lg flex-[2] flex items-center justify-center text-sm text-white font-medium shadow-lg">
                            Job 1
                          </div>
                          <div className="bg-emerald-500 rounded-lg flex-[3] flex items-center justify-center text-sm text-white font-medium shadow-lg">
                            Job 2
                          </div>
                          <div className="bg-purple-500 rounded-lg flex-[2] flex items-center justify-center text-sm text-white font-medium shadow-lg">
                            Job 3
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-medium text-gray-700 w-20">Machine 2</div>
                        <div className="flex gap-2 flex-1 h-10">
                          <div className="bg-emerald-500 rounded-lg flex-[2] flex items-center justify-center text-sm text-white font-medium shadow-lg">
                            Job 2
                          </div>
                          <div className="bg-blue-500 rounded-lg flex-[3] flex items-center justify-center text-sm text-white font-medium shadow-lg">
                            Job 1
                          </div>
                          <div className="bg-purple-500 rounded-lg flex-[2] flex items-center justify-center text-sm text-white font-medium shadow-lg">
                            Job 3
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-medium text-gray-700 w-20">Machine 3</div>
                        <div className="flex gap-2 flex-1 h-10">
                          <div className="bg-purple-500 rounded-lg flex-[2] flex items-center justify-center text-sm text-white font-medium shadow-lg">
                            Job 3
                          </div>
                          <div className="bg-blue-500 rounded-lg flex-[2] flex items-center justify-center text-sm text-white font-medium shadow-lg">
                            Job 1
                          </div>
                          <div className="bg-emerald-500 rounded-lg flex-[4] flex items-center justify-center text-sm text-white font-medium shadow-lg">
                            Job 2
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center text-xs text-gray-500 mt-4">
                      * Jobs cannot start on next machine until finished on current one
                    </div>
                  </div>
                )}

                {activeIndex === 2 && (
                  <div className="space-y-6">
                    <div className="text-center text-sm text-gray-600 mb-4">
                      <strong>Distributed Flow Shop:</strong> Jobs assigned to different factories with multiple machines
                    </div>
                    
                    {/* Factory Layout */}
                    <div className="grid grid-cols-3 gap-6">
                      {["Factory A", "Factory B", "Factory C"].map((factory, fi) => (
                        <div key={fi} className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-lg">
                          <div className="text-center text-sm font-semibold text-gray-700 mb-3">{factory}</div>
                          <div className="grid grid-cols-2 gap-2">
                            {[1, 2, 3].map((machine) => (
                              <div key={machine} className="bg-gray-100 rounded-lg p-2 text-center">
                                <div className="text-xs font-medium text-gray-600 mb-2">M{machine}</div>
                                <div className="space-y-1">
                                  {fi === 0 && machine === 1 && (
                                    <>
                                      <div className="w-full h-6 bg-blue-500 rounded flex items-center justify-center text-xs text-white font-medium">J1</div>
                                      <div className="w-full h-6 bg-emerald-500 rounded flex items-center justify-center text-xs text-white font-medium">J2</div>
                                      <div className="w-full h-6 bg-purple-500 rounded flex items-center justify-center text-xs text-white font-medium">J3</div>
                                    </>
                                  )}
                                  {fi === 0 && machine === 2 && (
                                    <>
                                      <div className="w-full h-6 bg-emerald-500 rounded flex items-center justify-center text-xs text-white font-medium">J2</div>
                                      <div className="w-full h-6 bg-blue-500 rounded flex items-center justify-center text-xs text-white font-medium">J1</div>
                                      <div className="w-full h-6 bg-purple-500 rounded flex items-center justify-center text-xs text-white font-medium">J3</div>
                                    </>
                                  )}
                                  {fi === 0 && machine === 3 && (
                                    <>
                                      <div className="w-full h-6 bg-purple-500 rounded flex items-center justify-center text-xs text-white font-medium">J3</div>
                                      <div className="w-full h-6 bg-blue-500 rounded flex items-center justify-center text-xs text-white font-medium">J1</div>
                                      <div className="w-full h-6 bg-emerald-500 rounded flex items-center justify-center text-xs text-white font-medium">J2</div>
                                    </>
                                  )}
                                  {fi === 1 && machine === 1 && (
                                    <>
                                      <div className="w-full h-6 bg-emerald-500 rounded flex items-center justify-center text-xs text-white font-medium">J2</div>
                                      <div className="w-full h-6 bg-purple-500 rounded flex items-center justify-center text-xs text-white font-medium">J3</div>
                                      <div className="w-full h-6 bg-blue-500 rounded flex items-center justify-center text-xs text-white font-medium">J1</div>
                                    </>
                                  )}
                                  {fi === 1 && machine === 2 && (
                                    <>
                                      <div className="w-full h-6 bg-blue-500 rounded flex items-center justify-center text-xs text-white font-medium">J1</div>
                                      <div className="w-full h-6 bg-emerald-500 rounded flex items-center justify-center text-xs text-white font-medium">J2</div>
                                      <div className="w-full h-6 bg-purple-500 rounded flex items-center justify-center text-xs text-white font-medium">J3</div>
                                    </>
                                  )}
                                  {fi === 1 && machine === 3 && (
                                    <>
                                      <div className="w-full h-6 bg-purple-500 rounded flex items-center justify-center text-xs text-white font-medium">J3</div>
                                      <div className="w-full h-6 bg-emerald-500 rounded flex items-center justify-center text-xs text-white font-medium">J2</div>
                                      <div className="w-full h-6 bg-blue-500 rounded flex items-center justify-center text-xs text-white font-medium">J1</div>
                                    </>
                                  )}
                                  {fi === 2 && machine === 1 && (
                                    <>
                                      <div className="w-full h-6 bg-purple-500 rounded flex items-center justify-center text-xs text-white font-medium">J3</div>
                                      <div className="w-full h-6 bg-blue-500 rounded flex items-center justify-center text-xs text-white font-medium">J1</div>
                                      <div className="w-full h-6 bg-emerald-500 rounded flex items-center justify-center text-xs text-white font-medium">J2</div>
                                    </>
                                  )}
                                  {fi === 2 && machine === 2 && (
                                    <>
                                      <div className="w-full h-6 bg-blue-500 rounded flex items-center justify-center text-xs text-white font-medium">J1</div>
                                      <div className="w-full h-6 bg-purple-500 rounded flex items-center justify-center text-xs text-white font-medium">J3</div>
                                      <div className="w-full h-6 bg-emerald-500 rounded flex items-center justify-center text-xs text-white font-medium">J2</div>
                                    </>
                                  )}
                                  {fi === 2 && machine === 3 && (
                                    <>
                                      <div className="w-full h-6 bg-emerald-500 rounded flex items-center justify-center text-xs text-white font-medium">J2</div>
                                      <div className="w-full h-6 bg-purple-500 rounded flex items-center justify-center text-xs text-white font-medium">J3</div>
                                      <div className="w-full h-6 bg-blue-500 rounded flex items-center justify-center text-xs text-white font-medium">J1</div>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-center text-xs text-gray-500">
                      * Each factory has 3 machines, jobs are assigned based on optimization criteria
                    </div>
                  </div>
                )}
              </div>

            </CardContent>
          </Card>

          {/* Carousel Navigation - Bottom Center */}
          <div className="flex justify-center space-x-3 mt-8">
            {variants.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  activeIndex === i 
                    ? 'bg-primary scale-125 shadow-lg' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </section>














      {/* Solutions Section - Modern iOS Cards */}
      <section id="solutions" className="py-20 px-6 bg-background" style={{ backgroundColor: '#fafafa' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Solutions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the optimization approach that best fits your manufacturing needs
            </p>
          </div>
          
          <div id="get-started" className="grid md:grid-cols-2 gap-8">
            {/* Single-objective Card */}
            <Card className="group cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl border-0 bg-white rounded-xl overflow-hidden ring-2 ring-primary/10">
              <CardContent className="p-10 space-y-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                    <div className="w-5 h-5 bg-white rounded-lg"></div>
                  </div>
                </div>
                <div className="space-y-4 text-center">
                  <h3 className="text-2xl font-bold text-foreground">
                    Single-objective Flow Shop
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Optimize for a single objective such as makespan or energy consumption
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full border-2 border-border/30 bg-blue-500/5 text-blue-500 rounded-xl font-semibold hover:bg-blue-500/10 hover:text-blue-500"
                  onClick={() => navigate("/single-objective")}
                >
                  Explore Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </CardContent>
            </Card>

            {/* Multi-objective Card */}
            <Card className="group cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl border-0 bg-white rounded-xl overflow-hidden ring-2 ring-primary/10">
              <CardContent className="p-10 space-y-8">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="w-2 h-2 bg-white rounded-sm"></div>
                      <div className="w-2 h-2 bg-white rounded-sm"></div>
                      <div className="w-2 h-2 bg-white rounded-sm"></div>
                      <div className="w-2 h-2 bg-white rounded-sm"></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 text-center">
                  <h3 className="text-2xl font-bold text-foreground">
                    Multi-objective Flow Shop
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Balance multiple objectives including makespan, energy, and sustainability
                  </p>
                </div>
                <Button
                  size="lg"
                  className="w-full bg-primary/10 hover:bg-primary/5 text-primary shadow-lg transition-all duration-300 rounded-xl font-semibold"
                  onClick={() => navigate("/multi-objective")}
                >
                  Explore Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;