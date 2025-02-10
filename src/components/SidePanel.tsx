
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  Database,
  ClipboardList,
  FileText,
  FolderCog
} from "lucide-react";
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
              <div className="flex flex-col gap-4">
                {/* Main Navigation */}
                <div className="flex flex-col gap-1">
                  <TabsTrigger 
                    value="dashboard" 
                    className="w-full justify-start gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </TabsTrigger>
                </div>

                {/* Setup Section */}
                <div className="flex flex-col gap-1">
                  <div className="text-xs text-gray-400 uppercase px-2 mb-1">Setup</div>
                  <TabsTrigger 
                    value="setupstore" 
                    className="w-full justify-start gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  >
                    <FolderCog className="w-4 h-4" />
                    Setup Store
                  </TabsTrigger>
                  <TabsTrigger 
                    value="setupchamps" 
                    className="w-full justify-start gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  >
                    <FolderCog className="w-4 h-4" />
                    Setup CHAMPS
                  </TabsTrigger>
                  <TabsTrigger 
                    value="setupcleanliness" 
                    className="w-full justify-start gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  >
                    <FolderCog className="w-4 h-4" />
                    Setup Cleanliness
                  </TabsTrigger>
                  <TabsTrigger 
                    value="setupproductquality" 
                    className="w-full justify-start gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  >
                    <FolderCog className="w-4 h-4" />
                    Setup Product Quality
                  </TabsTrigger>
                  <TabsTrigger 
                    value="setupservice" 
                    className="w-full justify-start gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  >
                    <FolderCog className="w-4 h-4" />
                    Setup Service
                  </TabsTrigger>
                </div>

                {/* Forms Section */}
                <div className="flex flex-col gap-1">
                  <div className="text-xs text-gray-400 uppercase px-2 mb-1">Forms</div>
                  <TabsTrigger 
                    value="champsform" 
                    className="w-full justify-start gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  >
                    <ClipboardList className="w-4 h-4" />
                    CHAMPS Form
                  </TabsTrigger>
                  <TabsTrigger 
                    value="espform" 
                    className="w-full justify-start gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  >
                    <ClipboardList className="w-4 h-4" />
                    ESP Form
                  </TabsTrigger>
                </div>

                {/* Reports Section */}
                <div className="flex flex-col gap-1">
                  <div className="text-xs text-gray-400 uppercase px-2 mb-1">Reports</div>
                  <TabsTrigger 
                    value="champreport" 
                    className="w-full justify-start gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  >
                    <FileText className="w-4 h-4" />
                    CHAMPS Report
                  </TabsTrigger>
                  <TabsTrigger 
                    value="espreport" 
                    className="w-full justify-start gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  >
                    <FileText className="w-4 h-4" />
                    ESP Report
                  </TabsTrigger>
                </div>

                {/* Admin Section */}
                <div className="flex flex-col gap-1">
                  <div className="text-xs text-gray-400 uppercase px-2 mb-1">Admin</div>
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
                </div>
              </div>
            </Tabs2.List>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default SidePanel;
