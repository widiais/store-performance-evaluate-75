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
import SetupStore from "@/components/SetupStore";
import SetupChamps from "@/components/SetupChamps";
import SetupCleanliness from "@/components/SetupCleanliness";
import SetupProductQuality from "@/components/SetupProductQuality";
import SetupService from "@/components/SetupService";
import ChampsForm from "@/components/ChampsForm";
import CleanlinessForm from "@/components/CleanlinessForm";
import ServiceForm from "@/components/ServiceForm";
import ProductQualityForm from "@/components/ProductQualityForm";
import EspForm from "@/components/EspForm";

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
                  <Route path="/setup-store" element={<SetupStore />} />
                  <Route path="/setup-champs" element={<SetupChamps />} />
                  <Route path="/setup-cleanliness" element={<SetupCleanliness />} />
                  <Route path="/setup-product-quality" element={<SetupProductQuality />} />
                  <Route path="/setup-service" element={<SetupService />} />
                  <Route path="/champs-form" element={<ChampsForm />} />
                  <Route path="/cleanliness-form" element={<CleanlinessForm />} />
                  <Route path="/service-form" element={<ServiceForm />} />
                  <Route path="/product-quality-form" element={<ProductQualityForm />} />
                  <Route path="/esp-form" element={<EspForm />} />
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
