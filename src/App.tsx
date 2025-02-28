
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import SidePanel from "@/components/SidePanel";
import Auth from "@/pages/Auth";
import Index from "./pages/Index";
import UserManagement from "@/pages/users/UserManagement";
import UserRegister from "@/pages/users/UserRegister";
import RoleManagement from "@/pages/roles/RoleManagement";
import ChangeMyPassword from "@/pages/users/ChangeMyPassword";
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
import WorkplaceReport from "@/components/WorkplaceReport";
import WorkplaceReportDetail from "@/components/WorkplaceReportDetail";

const queryClient = new QueryClient();

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: {
    resource: string;
    action: 'create' | 'read' | 'update' | 'delete';
  };
}

const ProtectedRoute = ({ children, requiredPermission }: ProtectedRouteProps) => {
  const { user, loading, hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredPermission && !hasPermission(requiredPermission.resource, requiredPermission.action)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

function AppContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user } = useAuth();

  return (
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen flex w-full">
          {user && <SidePanel onTabChange={setActiveTab} />}
          <div className={user ? "flex-1 md:pl-64" : "flex-1"}>
            <Routes>
              <Route path="/auth" element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              } />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />

              <Route path="/users" element={
                <ProtectedRoute requiredPermission={{ resource: 'users', action: 'read' }}>
                  <UserManagement />
                </ProtectedRoute>
              } />

              <Route path="/user-register" element={
                <ProtectedRoute requiredPermission={{ resource: 'user-register', action: 'read' }}>
                  <UserRegister />
                </ProtectedRoute>
              } />

              <Route path="/roles" element={
                <ProtectedRoute requiredPermission={{ resource: 'roles', action: 'read' }}>
                  <RoleManagement />
                </ProtectedRoute>
              } />

              <Route path="/change-password" element={
                <ProtectedRoute>
                  <ChangeMyPassword />
                </ProtectedRoute>
              } />
              
              <Route path="/store-performance" element={<StorePerformance />} />
              
              <Route path="/setup-store" element={<SetupStore />} />
              <Route path="/setup-champs" element={<SetupChamps />} />
              <Route path="/setup-cleanliness" element={<SetupCleanliness />} />
              <Route path="/setup-product-quality" element={<SetupProductQuality />} />
              <Route path="/setup-service" element={<SetupService />} />
              <Route path="/setup-complain" element={<SetupComplain />} />
              
              <Route path="/champs-form" element={<ChampsForm />} />
              <Route path="/cleanliness-form" element={<CleanlinessForm />} />
              <Route path="/service-form" element={<ServiceForm />} />
              <Route path="/product-quality-form" element={<ProductQualityForm />} />
              <Route path="/esp-form" element={<EspForm />} />
              <Route path="/finance-form" element={<FinanceDataForm />} />
              <Route path="/complaint-form" element={<ComplaintForm />} />
              <Route path="/employee-sanction-form" element={<EmployeeSanctionForm />} />
              
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
              <Route path="/workplace-report" element={<WorkplaceReport />} />
              <Route path="/workplace-report/:id" element={<WorkplaceReportDetail />} />
            </Routes>
          </div>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
