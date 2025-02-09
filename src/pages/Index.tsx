
import { ShoppingCart, Smartphone, Box, UserPlus, Key, Bell, Globe, Shield, Moon } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import MonthlyChart from '@/components/MonthlyChart';
import CustomerRequests from '@/components/CustomerRequests';
import SidePanel from '@/components/SidePanel';
import SetupStore from '@/components/SetupStore';
import SetupChamps from '@/components/SetupChamps';
import ChampsForm from '@/components/ChampsForm';
import { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import ChampReport from '@/components/ChampReport';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

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
              />
              <MetricCard
                title="Mobile"
                value={52}
                color="#8989DE"
              />
              <MetricCard
                title="Other"
                value={85}
                color="#61AAF2"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="dashboard-card">
                <div className="flex items-center gap-3 mb-4">
                  <UserPlus className="w-5 h-5 text-blue-400" />
                  <h2 className="text-xl font-medium">Active Users</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 glass-card">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">JD</div>
                      <div>
                        <p className="font-medium">John Doe</p>
                        <p className="text-sm text-gray-400">Administrator</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 glass-card">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">AS</div>
                      <div>
                        <p className="font-medium">Alice Smith</p>
                        <p className="text-sm text-gray-400">Editor</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400">Active</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="dashboard-card">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-medium">Permissions</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 glass-card">
                    <div>
                      <p className="font-medium">Admin Access</p>
                      <p className="text-sm text-gray-400">Full system access</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-3 glass-card">
                    <div>
                      <p className="font-medium">Editor Access</p>
                      <p className="text-sm text-gray-400">Content management</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="dashboard-card">
                <div className="flex items-center gap-3 mb-4">
                  <Bell className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-xl font-medium">Notifications</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-400">Receive email updates</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-400">Receive push notifications</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
              <div className="dashboard-card">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-5 h-5 text-green-400" />
                  <h2 className="text-xl font-medium">Preferences</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Language</p>
                      <p className="text-sm text-gray-400">Select your language</p>
                    </div>
                    <select className="bg-transparent border border-white/10 rounded-md px-2 py-1">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-gray-400">Toggle dark mode</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      case 'setupstore':
        return <SetupStore />;
      case 'setupchamps':
        return <SetupChamps />;
      case 'champsform':
        return <ChampsForm />;
      case 'champreport':
        return <ChampReport onSelectReport={setSelectedReportId} selectedReportId={selectedReportId} />;
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

