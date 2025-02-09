
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Settings, Users, Database } from "lucide-react";
import SetupStore from "./SetupStore";
import * as Tabs2 from "@radix-ui/react-tabs";

interface SidePanelProps {
  onTabChange: (value: string) => void;
}

const SidePanel = ({ onTabChange }: SidePanelProps) => {
  return (
    <div className="h-screen fixed left-0 top-0 w-64 glass-card border-r border-white/10">
      <div className="p-6">
        <h2 className="text-xl font-medium mb-6">Navigation</h2>
        <Tabs 
          defaultValue="dashboard" 
          orientation="vertical" 
          className="w-full"
          onValueChange={onTabChange}
        >
          <TabsList className="flex flex-col h-auto bg-transparent text-white">
            <Tabs2.List asChild>
              <div className="flex flex-col gap-1">
                <TabsTrigger 
                  value="dashboard" 
                  className="w-full justify-start gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="w-full justify-start gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                >
                  <Users className="w-4 h-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="w-full justify-start gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
                <TabsTrigger 
                  value="datasetup" 
                  className="w-full justify-start gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                >
                  <Database className="w-4 h-4" />
                  Data Setup
                </TabsTrigger>
              </div>
            </Tabs2.List>
          </TabsList>
          <TabsContent value="datasetup">
            <div className="space-y-2">
              <Tabs2.List asChild>
                <div className="flex flex-col gap-1">
                  <TabsTrigger 
                    value="setupstore" 
                    className="w-full justify-start gap-2 pl-6 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  >
                    Setup Store
                  </TabsTrigger>
                  <TabsTrigger 
                    value="setupchamps" 
                    className="w-full justify-start gap-2 pl-6 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  >
                    Setup CHAMPS
                  </TabsTrigger>
                  <TabsTrigger 
                    value="champsform" 
                    className="w-full justify-start gap-2 pl-6 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  >
                    CHAMPS Form
                  </TabsTrigger>
                  <TabsTrigger 
                    value="champreport" 
                    className="w-full justify-start gap-2 pl-6 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  >
                    CHAMPS Report
                  </TabsTrigger>
                  <TabsTrigger 
                    value="espform" 
                    className="w-full justify-start gap-2 pl-6 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  >
                    ESP Form
                  </TabsTrigger>
                  <TabsTrigger 
                    value="espreport" 
                    className="w-full justify-start gap-2 pl-6 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  >
                    ESP Report
                  </TabsTrigger>
                </div>
              </Tabs2.List>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SidePanel;
