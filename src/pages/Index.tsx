import { ShoppingCart, Smartphone, Box } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import MonthlyChart from '@/components/MonthlyChart';
import CustomerRequests from '@/components/CustomerRequests';
import SidePanel from '@/components/SidePanel';

const Index = () => {
  return (
    <div className="min-h-screen">
      <SidePanel />
      <div className="pl-64">
        <div className="p-8">
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
        </div>
      </div>
    </div>
  );
};

export default Index;