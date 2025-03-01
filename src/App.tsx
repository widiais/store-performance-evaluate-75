
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
import MontazUserManagement from "@/pages/montaz/MontazUserManagement";
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
  const { user, loading, hasPermission, needsProfileCompletion } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (needsProfileCompletion()) {
        // Redirect Montaz users with incomplete profiles to the Montaz Users page
        // Only allow them to access the montaz-users page or logout
        const path = window.location.pathname;
        if (path !== '/montaz-users' && path !== '/auth') {
          navigate('/montaz-users');
        }
      }
    }
  }, [user, loading, navigate, needsProfileCompletion]);

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

  // For Montaz users with incomplete profiles, only allow access to the Montaz Users page
  if (needsProfileCompletion() && requiredPermission?.resource !== 'montaz-users') {
    return <Navigate to="/montaz-users" />;
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
  const { user, needsProfileCompletion } = useAuth();

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

              <Route path="/montaz-users" element={
                <ProtectedRoute requiredPermission={{ resource: 'montaz-users', action: 'read' }}>
                  <MontazUserManagement />
                </ProtectedRoute>
              } />

              <Route path="/change-password" element={
                <ProtectedRoute>
                  <ChangeMyPassword />
                </ProtectedRoute>
              } />
              
              <Route path="/store-performance" element={
                <ProtectedRoute>
                  <StorePerformance />
                </ProtectedRoute>
              } />
              
              <Route path="/setup-store" element={
                <ProtectedRoute>
                  <SetupStore />
                </ProtectedRoute>
              } />
              <Route path="/setup-champs" element={
                <ProtectedRoute>
                  <SetupChamps />
                </ProtectedRoute>
              } />
              <Route path="/setup-cleanliness" element={
                <ProtectedRoute>
                  <SetupCleanliness />
                </ProtectedRoute>
              } />
              <Route path="/setup-product-quality" element={
                <ProtectedRoute>
                  <SetupProductQuality />
                </ProtectedRoute>
              } />
              <Route path="/setup-service" element={
                <ProtectedRoute>
                  <SetupService />
                </ProtectedRoute>
              } />
              <Route path="/setup-complain" element={
                <ProtectedRoute>
                  <SetupComplain />
                </ProtectedRoute>
              } />
              
              <Route path="/champs-form" element={
                <ProtectedRoute>
                  <ChampsForm />
                </ProtectedRoute>
              } />
              <Route path="/cleanliness-form" element={
                <ProtectedRoute>
                  <CleanlinessForm />
                </ProtectedRoute>
              } />
              <Route path="/service-form" element={
                <ProtectedRoute>
                  <ServiceForm />
                </ProtectedRoute>
              } />
              <Route path="/product-quality-form" element={
                <ProtectedRoute>
                  <ProductQualityForm />
                </ProtectedRoute>
              } />
              <Route path="/esp-form" element={
                <ProtectedRoute>
                  <EspForm />
                </ProtectedRoute>
              } />
              <Route path="/finance-form" element={
                <ProtectedRoute>
                  <FinanceDataForm />
                </ProtectedRoute>
              } />
              <Route path="/complaint-form" element={
                <ProtectedRoute>
                  <ComplaintForm />
                </ProtectedRoute>
              } />
              <Route path="/employee-sanction-form" element={
                <ProtectedRoute>
                  <EmployeeSanctionForm />
                </ProtectedRoute>
              } />
              
              <Route path="/report" element={
                <ProtectedRoute>
                  <ChampReport />
                </ProtectedRoute>
              } />
              <Route path="/report/:id" element={
                <ProtectedRoute>
                  <ChampReportDetail />
                </ProtectedRoute>
              } />
              <Route path="/cleanliness-report" element={
                <ProtectedRoute>
                  <CleanlinessReport />
                </ProtectedRoute>
              } />
              <Route path="/cleanliness-report/:id" element={
                <ProtectedRoute>
                  <CleanlinessReportDetail />
                </ProtectedRoute>
              } />
              <Route path="/service-report" element={
                <ProtectedRoute>
                  <ServiceReport />
                </ProtectedRoute>
              } />
              <Route path="/service-report/:id" element={
                <ProtectedRoute>
                  <ServiceReportDetail />
                </ProtectedRoute>
              } />
              <Route path="/product-quality-report" element={
                <ProtectedRoute>
                  <ProductQualityReport />
                </ProtectedRoute>
              } />
              <Route path="/product-quality-report/:id" element={
                <ProtectedRoute>
                  <ProductQualityReportDetail />
                </ProtectedRoute>
              } />
              <Route path="/esp-report" element={
                <ProtectedRoute>
                  <EspReport />
                </ProtectedRoute>
              } />
              <Route path="/esp-report/:id" element={
                <ProtectedRoute>
                  <EspReportDetail />
                </ProtectedRoute>
              } />
              <Route path="/finance-report" element={
                <ProtectedRoute>
                  <FinanceReport />
                </ProtectedRoute>
              } />
              <Route path="/finance-report/:id" element={
                <ProtectedRoute>
                  <FinanceReportDetail />
                </ProtectedRoute>
              } />
              <Route path="/complaint-report" element={
                <ProtectedRoute>
                  <ComplaintReport />
                </ProtectedRoute>
              } />  
              <Route path="/complaint-report/:id" element={
                <ProtectedRoute>
                  <ComplaintReportDetail />
                </ProtectedRoute>
              } />
              <Route path="/sanction-report" element={
                <ProtectedRoute>
                  <SanctionReport />
                </ProtectedRoute>
              } />
              <Route path="/sanction-report/:id" element={
                <ProtectedRoute>
                  <SanctionReportDetail />
                </ProtectedRoute>
              } />
              <Route path="/workplace-report" element={
                <ProtectedRoute>
                  <WorkplaceReport />
                </ProtectedRoute>
              } />
              <Route path="/workplace-report/:id" element={
                <ProtectedRoute>
                  <WorkplaceReportDetail />
                </ProtectedRoute>
              } />
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
