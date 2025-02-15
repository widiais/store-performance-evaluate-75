import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import SidePanel from "@/components/SidePanel";
import Index from "./pages/Index";
import SetupChamps from "@/components/SetupChamps";
import SetupService from "@/components/SetupService";
import SetupCleanliness from "@/components/SetupCleanliness";
import SetupProductQuality from "@/components/SetupProductQuality";
import ChampsForm from "@/components/ChampsForm";
import ServiceForm from "@/components/ServiceForm";
import CleanlinessForm from "@/components/CleanlinessForm";
import ProductQualityForm from "@/components/ProductQualityForm";
import EspForm from "@/components/EspForm";
import FinanceDataForm from "@/components/FinanceDataForm";
import ChampReport from "@/components/ChampReport";
import ChampReportDetail from "@/components/ChampReportDetail";
import ServiceReport from "@/components/ServiceReport";
import ServiceReportDetail from "@/components/ServiceReportDetail";
import CleanlinessReport from "@/components/CleanlinessReport";
import CleanlinessReportDetail from "@/components/CleanlinessReportDetail";
import ProductQualityReport from "@/components/ProductQualityReport";
import ProductQualityReportDetail from "@/components/ProductQualityReportDetail";
import EspReport from "@/components/EspReport";
import EspReportDetail from "@/components/EspReportDetail";
import FinanceReport from "@/components/FinanceReport";
import { useState } from "react";
import SetupStore from "./components/SetupStore";
import SetupComplain from "./components/SetupComplain";
import ComplaintForm from "./components/ComplaintForm";
import ComplaintReport from "./components/ComplaintReport";
import ComplaintReportDetail from "./components/ComplaintReportDetail";
import StorePerformance from "./components/StorePerformance";
import FinanceReportDetail from "./components/FinanceReportDetail";
import EmployeeSanctionForm from "@/components/EmployeeSanctionForm";
import SanctionReport from "@/components/SanctionReport";
import SanctionReportDetail from "@/components/SanctionReportDetail";

const queryClient = new QueryClient();

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Toaster />
          <Sonner />
          <Router>
            <div className="min-h-screen flex w-full">
              <SidePanel onTabChange={setActiveTab} />
              <div className="flex-1 md:pl-64">
                <Routes>
                  {/* Main */}
                  <Route path="/" element={<Index />} />
                  <Route path="/store-performance" element={<StorePerformance />} />
                  
                  {/* Setup */}
                  <Route path="/setup-store" element={<SetupStore />} />
                  <Route path="/setup-champs" element={<SetupChamps />} />
                  <Route path="/setup-cleanliness" element={<SetupCleanliness />} />
                  <Route path="/setup-product-quality" element={<SetupProductQuality />} />
                  <Route path="/setup-service" element={<SetupService />} />
                  <Route path="/setup-complain" element={<SetupComplain />} />
                  
                  {/* Forms */}
                  <Route path="/champs-form" element={<ChampsForm />} />
                  <Route path="/cleanliness-form" element={<CleanlinessForm />} />
                  <Route path="/service-form" element={<ServiceForm />} />
                  <Route path="/product-quality-form" element={<ProductQualityForm />} />
                  <Route path="/esp-form" element={<EspForm />} />
                  <Route path="/finance-form" element={<FinanceDataForm />} />
                  <Route path="/complaint-form" element={<ComplaintForm />} />
                  <Route path="/employee-sanction-form" element={<EmployeeSanctionForm />} />
                  
                  {/* Reports */}
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
                  <Route path="/finance-report" element={<FinanceReport />} />
                  <Route path="/finance-report/:id" element={<FinanceReportDetail />} />
                  <Route path="/complaint-report" element={<ComplaintReport />} />  
                  <Route path="/complaint-report/:id" element={<ComplaintReportDetail />} />
                  <Route path="/sanction-report" element={<SanctionReport />} />
                  <Route path="/sanction-report/:id" element={<SanctionReportDetail />} />
                </Routes>
              </div>
            </div>
          </Router>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
