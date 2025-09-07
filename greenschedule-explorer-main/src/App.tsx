import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MultiObjectiveMenuPage from "./pages/MultiObjectiveMenuPage";
import SensitivityAnalysisPage from "./pages/SensitivityAnalysisPage";
import TECReductionPage from "./pages/TECReductionPage";
import HybridMHsComparisonPage from "./pages/HybridMHsComparisonPage";
import NotFound from "./pages/NotFound";
import SolutionRepresentationPage from "./pages/SolutionRepresentationPage";
import ConstructiveHeuristicsPage from "./pages/ConstructiveHeuristicsPage";
import MVNDComparisonPage from "./pages/MVNDComparisonPage";
import ILPModelTestsPage from "./pages/ILPModelTestsPage";
import MORLPage from "./pages/MORLPage";
import SATestsMenuPage from "./pages/SATestsMenuPage";
import SARestartPage from "./pages/SARestartPage";
import SAWeightsPage from "./pages/SAWeightsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/multi-objective" element={<MultiObjectiveMenuPage />} />
          <Route path="/multi-objective/sensitivity" element={<SensitivityAnalysisPage />} />
          <Route path="/multi-objective/tec-reduction" element={<TECReductionPage />} />
          <Route path="/multi-objective/comparison" element={<HybridMHsComparisonPage />} />
          <Route path="/multi-objective/solution-representation" element={<SolutionRepresentationPage />} />
          <Route path="/multi-objective/constructive-heuristics" element={<ConstructiveHeuristicsPage />} />
          <Route path="/multi-objective/mvnd" element={<MVNDComparisonPage />} />
          <Route path="/multi-objective/ilp" element={<ILPModelTestsPage />} />
          <Route path="/multi-objective/morl" element={<MORLPage />} />
          <Route path="/multi-objective/sa-tests" element={<SATestsMenuPage />} />
          <Route path="/multi-objective/sa-tests/restart" element={<SARestartPage />} />
          <Route path="/multi-objective/sa-tests/weights" element={<SAWeightsPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
