
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  FileText, 
  FolderCog,
  ClipboardList,
  Wallet,
  Menu,
  X
} from "lucide-react";
import * as Tabs2 from "@radix-ui/react-tabs";
import { useNavigate } from 'react-router-dom';
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    const menuItem = menuSections.flatMap(section => section.items)
      .find(item => item.value === value);
    
    if (menuItem?.route) {
      navigate(menuItem.route);
    }
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const sidebarContent = (
    <div className="h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium">Navigation</h2>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          )}
        </div>
        <Tabs 
          defaultValue="dashboard" 
          orientation="vertical" 
          className="w-full"
          onValueChange={handleTabChange}
        >
          <TabsList className="flex flex-col h-auto bg-transparent text-white">
            <Tabs2.List asChild>
              <div className="flex flex-col gap-4 max-h-[calc(100vh-200px)] overflow-y-auto">
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

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 glass-card border-r border-white/10 transition-transform duration-300 ease-in-out",
          isMobile && !isMobileMenuOpen && "-translate-x-full",
          !isMobile && "translate-x-0"
        )}
      >
        {sidebarContent}
      </div>

      {/* Overlay for mobile */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default SidePanel;
