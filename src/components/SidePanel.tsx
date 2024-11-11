import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Settings, Users } from "lucide-react";

const SidePanel = () => {
  return (
    <div className="h-screen fixed left-0 top-0 w-64 glass-card border-r border-white/10">
      <div className="p-6">
        <h2 className="text-xl font-medium mb-6">Navigation</h2>
        <Tabs defaultValue="dashboard" orientation="vertical" className="w-full">
          <TabsList className="flex flex-col h-auto bg-transparent border-r border-white/10">
            <TabsTrigger 
              value="dashboard" 
              className="w-full justify-start gap-2 data-[state=active]:bg-white/10 text-white hover:text-white/90"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="w-full justify-start gap-2 data-[state=active]:bg-white/10 text-white hover:text-white/90"
            >
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="w-full justify-start gap-2 data-[state=active]:bg-white/10 text-white hover:text-white/90"
            >
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-2 p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Dashboard Overview</h3>
              <p className="text-dashboard-text">
                Welcome to your dashboard. Here you can view all your important metrics and analytics.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-2 p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">User Management</h3>
              <p className="text-dashboard-text">
                Manage your users, view profiles, and handle user-related tasks.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-2 p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Settings Panel</h3>
              <p className="text-dashboard-text">
                Configure your application settings and preferences here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SidePanel;