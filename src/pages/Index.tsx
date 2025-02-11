
import { ShoppingCart, Smartphone, Box, UserPlus, Key, Bell, Globe, Shield, Moon } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import MonthlyChart from '@/components/MonthlyChart';
import CustomerRequests from '@/components/CustomerRequests';
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
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      {renderContent()}
    </div>
  );
};

export default Index;
