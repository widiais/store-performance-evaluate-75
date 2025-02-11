
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  FileText, 
  FolderCog,
  ClipboardList,
  Wallet
} from "lucide-react";
import * as Tabs2 from "@radix-ui/react-tabs";
import { useNavigate } from 'react-router-dom';

interface SidePanelProps {
  onTabChange: (value: string) => void;
}

interface MenuItem {
  icon: typeof LayoutDashboard;
  label: string;
  value: string;
  route?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const SidePanel = ({ onTabChange }: SidePanelProps) => {
  const navigate = useNavigate();

  const menuSections: MenuSection[] = [
    {
      title: "Main",
      items: [
        {
          icon: LayoutDashboard,
          label: "Dashboard",
          value: "dashboard"
        }
      ]
    },
    {
      title: "Setup",
      items: [
        {
          icon: FolderCog,
          label: "Setup Store",
          value: "setupstore"
        },
        {
          icon: FolderCog,
          label: "Setup CHAMPS",
          value: "setupchamps"
        },
        {
          icon: FolderCog,
          label: "Setup Cleanliness",
          value: "setupcleanliness"
        },
        {
          icon: FolderCog,
          label: "Setup Product Quality",
          value: "setupproductquality"
        },
        {
          icon: FolderCog,
          label: "Setup Service",
          value: "setupservice"
        }
      ]
    },
    {
      title: "Forms",
      items: [
        {
          icon: ClipboardList,
          label: "CHAMPS Form",
          value: "champsform"
        },
        {
          icon: ClipboardList,
          label: "Cleanliness Form",
          value: "cleanlinessform"
        },
        {
          icon: ClipboardList,
          label: "Service Form",
          value: "serviceform"
        },
        {
          icon: ClipboardList,
          label: "Product Quality Form",
          value: "productqualityform"
        },
        {
          icon: ClipboardList,
          label: "ESP Form",
          value: "espform"
        }
      ]
    },
    {
      title: "Reports",
      items: [
        {
          icon: FileText,
          label: "CHAMPS Report",
          value: "champreport",
          route: "/report"
        },
        {
          icon: FileText,
          label: "Cleanliness Report",
          value: "cleanlinessreport",
          route: "/cleanliness-report"
        },
        {
          icon: FileText,
          label: "Service Report",
          value: "servicereport",
          route: "/service-report"
        },
        {
          icon: FileText,
          label: "Product Quality Report",
          value: "productqualityreport",
          route: "/product-quality-report"
        },
        {
          icon: FileText,
          label: "ESP Report",
          value: "espreport",
          route: "/esp-report"
        }
      ]
    },
    {
      title: "Finance",
      items: [
        {
          icon: Wallet,
          label: "Finance Data Form",
          value: "financeform",
          route: "/finance-form"
        },
        {
          icon: FileText,
          label: "Finance Report",
          value: "financereport",
          route: "/finance-report"
        }
      ]
    }
  ];

  const handleTabChange = (value: string) => {
    onTabChange(value);
    
    // Find the menu item and navigate if it has a route
    const menuItem = menuSections.flatMap(section => section.items)
      .find(item => item.value === value);
    
    if (menuItem?.route) {
      navigate(menuItem.route);
    }
  };

  return (
    <div className="h-screen fixed left-0 top-0 w-64 glass-card border-r border-white/10">
      <div className="p-6">
        <h2 className="text-xl font-medium mb-6">Navigation</h2>
        <Tabs 
          defaultValue="dashboard" 
          orientation="vertical" 
          className="w-full"
          onValueChange={handleTabChange}
        >
          <TabsList className="flex flex-col h-auto bg-transparent text-white">
            <Tabs2.List asChild>
              <div className="flex flex-col gap-4">
                {menuSections.map((section) => (
                  <div key={section.title} className="flex flex-col gap-1">
                    <div className="text-xs text-gray-400 uppercase px-2 mb-1">
                      {section.title}
                    </div>
                    {section.items.map((item) => (
                      <TabsTrigger
                        key={item.value}
                        value={item.value}
                        className="w-full justify-start gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </TabsTrigger>
                    ))}
                  </div>
                ))}
              </div>
            </Tabs2.List>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default SidePanel;
