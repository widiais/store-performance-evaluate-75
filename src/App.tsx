import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import ChampReport from "@/components/ChampReport";
import ChampReportDetail from "@/components/ChampReportDetail";
import EspReport from "@/components/EspReport";
import EspReportDetail from "@/components/EspReportDetail";
import { ThemeProvider } from "./components/ui/theme-provider";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/report" element={<ChampReport />} />
            <Route path="/report/:id" element={<ChampReportDetail />} />
            <Route path="/esp-report" element={<EspReport />} />
            <Route path="/esp-report/:id" element={<EspReportDetail />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
