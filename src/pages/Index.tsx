
import { ShoppingCart, Smartphone, Box, UserPlus, Key, Bell, Globe, Shield, Moon } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import MonthlyChart from '@/components/MonthlyChart';
import CustomerRequests from '@/components/CustomerRequests';
import SidePanel from '@/components/SidePanel';
import SetupStore from '@/components/SetupStore';
import SetupChamps from '@/components/SetupChamps';
import SetupCleanliness from '@/components/SetupCleanliness';
import SetupProductQuality from '@/components/SetupProductQuality';
import SetupService from '@/components/SetupService';
import ChampsForm from '@/components/ChampsForm';
import CleanlinessForm from '@/components/CleanlinessForm';
import ServiceForm from '@/components/ServiceForm';
import ProductQualityForm from '@/components/ProductQualityForm';
import EspForm from '@/components/EspForm';
import { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import ChampReport from '@/components/ChampReport';
import ChampReportDetail from '@/components/ChampReportDetail';
import CleanlinessReport from '@/components/CleanlinessReport';
import CleanlinessReportDetail from '@/components/CleanlinessReportDetail';
import ServiceReport from '@/components/ServiceReport';
import ServiceReportDetail from '@/components/ServiceReportDetail';
import ProductQualityReport from '@/components/ProductQualityReport';
import ProductQualityReportDetail from '@/components/ProductQualityReportDetail';
import EspReport from '@/components/EspReport';
import EspReportDetail from '@/components/EspReportDetail';
import { Routes, Route } from 'react-router-dom';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-medium mb-2">Dashboard</h1>
              <p className="text-dashboard-muted">Below is an example dashboard created using charts from this plugin</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <MetricCard
                title="Total Sales"
                value="$45,231.89"
                description="+20.1% from last month"
                icon={ShoppingCart}
              />
              <MetricCard
                title="Active Users"
                value="892"
                description="+180.1% from last month"
                icon={UserPlus}
              />
              <MetricCard
                title="Active Subscriptions"
                value="1,234"
                description="+19% from last month"
                icon={Bell}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <MonthlyChart />
              <CustomerRequests />
            </div>
          </>
        );
      case 'setupstore':
        return <SetupStore />;
      case 'setupchamps':
        return <SetupChamps />;
      case 'setupcleanliness':
        return <SetupCleanliness />;
      case 'setupproductquality':
        return <SetupProductQuality />;
      case 'setupservice':
        return <SetupService />;
      case 'champsform':
        return <ChampsForm />;
      case 'cleanlinessform':
        return <CleanlinessForm />;
      case 'serviceform':
        return <ServiceForm />;
      case 'productqualityform':
        return <ProductQualityForm />;
      case 'espform':
        return <EspForm />;
      case 'champreport':
        return <ChampReport />;
      case 'cleanlinessreport':
        return <CleanlinessReport />;
      case 'servicereport':
        return <ServiceReport />;
      case 'productqualityreport':
        return <ProductQualityReport />;
      case 'espreport':
        return <EspReport />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <SidePanel onTabChange={setActiveTab} />
      <div className="pl-64 p-8">
        <Routes>
          <Route path="/" element={renderContent()} />
          <Route path="/champ-report/:id" element={<ChampReportDetail />} />
          <Route path="/cleanliness-report/:id" element={<CleanlinessReportDetail />} />
          <Route path="/service-report/:id" element={<ServiceReportDetail />} />
          <Route path="/product-quality-report/:id" element={<ProductQualityReportDetail />} />
          <Route path="/esp-report/:id" element={<EspReportDetail />} />
        </Routes>
      </div>
    </div>
  );
};

export default Index;
