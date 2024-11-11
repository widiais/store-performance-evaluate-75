import { ShoppingCart, Smartphone, Box } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import MonthlyChart from '@/components/MonthlyChart';
import CustomerRequests from '@/components/CustomerRequests';
import SidePanel from '@/components/SidePanel';
import { useState } from 'react';

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
                title="Shop"
                value={68}
                color="#7EBF8E"
                icon={<ShoppingCart className="w-6 h-6" />}
              />
              <MetricCard
                title="Mobile"
                value={52}
                color="#8989DE"
                icon={<Smartphone className="w-6 h-6" />}
              />
              <MetricCard
                title="Other"
                value={85}
                color="#61AAF2"
                icon={<Box className="w-6 h-6" />}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MonthlyChart />
              <CustomerRequests />
            </div>
          </>
        );
      case 'users':
        return (
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-medium mb-2">Users</h1>
              <p className="text-dashboard-muted">Manage your users and their permissions</p>
            </header>
            <div className="dashboard-card">
              <h2 className="text-xl font-medium mb-4">User Management</h2>
              <p className="text-dashboard-muted">This section will contain user management features.</p>
            </div>
          </>
        );
      case 'settings':
        return (
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-medium mb-2">Settings</h1>
              <p className="text-dashboard-muted">Configure your application settings</p>
            </header>
            <div className="dashboard-card">
              <h2 className="text-xl font-medium mb-4">Application Settings</h2>
              <p className="text-dashboard-muted">This section will contain application settings.</p>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <SidePanel onTabChange={setActiveTab} />
      <div className="pl-64">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Index;