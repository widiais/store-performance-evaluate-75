
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import ChampReport from "@/components/ChampReport";
import ChampReportDetail from "@/components/ChampReportDetail";
import CleanlinessReport from "@/components/CleanlinessReport";
import CleanlinessReportDetail from "@/components/CleanlinessReportDetail";
import ServiceReport from "@/components/ServiceReport";
import ServiceReportDetail from "@/components/ServiceReportDetail";
import ProductQualityReport from "@/components/ProductQualityReport";
import ProductQualityReportDetail from "@/components/ProductQualityReportDetail";
import EspReport from "@/components/EspReport";
import EspReportDetail from "@/components/EspReportDetail";
import FinanceDataForm from "@/components/FinanceDataForm";
import FinanceReport from "@/components/FinanceReport";
import { ThemeProvider } from "./components/ui/theme-provider";
import SidePanel from "@/components/SidePanel";
import { useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Toaster />
          <Sonner />
          <Router>
            <div className="min-h-screen flex">
              <SidePanel onTabChange={setActiveTab} />
              <div className="pl-64 md:pl-64 w-full">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/report" element={<ChampReport />} />
                  <Route path="/report/:id" element={<ChampReportDetail />} />
                  <Route path="/cleanliness-report" element={<CleanlinessReport />} />
                  <Route path="/cleanliness-report/:id" element={<CleanlinessReportDetail />} />
                  <Route path="/service-report" element={<ServiceReport />} />
                  <Route path="/service-report/:id" element={<ServiceReportDetail />} />
                  <Route path="/product-quality-report" element={<ProductQualityReport />} />
                  <Route path="/product-quality-report/:id" element={<ProductQualityReportDetail />} />
                  <Route path="/esp-report" element={<EspReport />} />
                  <Route path="/esp-report/:id" element={<EspReportDetail />} />
                  <Route path="/finance-form" element={<FinanceDataForm />} />
                  <Route path="/finance-report" element={<FinanceReport />} />
                </Routes>
              </div>
            </div>
          </Router>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
