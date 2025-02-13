import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Store,
  Award,
  ClipboardCheck,
  Sparkles,
  Coffee,
  FileText,
  ChevronDown,
  ChevronUp,
  Menu,
  MessageSquare,
  X
} from "lucide-react";

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
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [expandedSections, setExpandedSections] = useState({
    setup: true,
    forms: true,
    reports: true
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuSections: MenuSection[] = [
    {
      title: "Main",
      items: [
        {
          icon: LayoutDashboard,
          label: "Dashboard",
          value: "dashboard",
          route: "/"
        },
        {
          icon: Store,
          label: "Store Performance",
          value: "storeperformance",
          route: "/store-performance"
        }
      ]
    },
    {
      title: "Setup",
      items: [
        {
          icon: Store,
          label: "Setup Store",
          value: "setupstore",
          route: "/setup-store"
        },
        {
          icon: Award,
          label: "Setup CHAMPS",
          value: "setupchamps",
          route: "/setup-champs"
        },
        {
          icon: ClipboardCheck,
          label: "Setup Service",
          value: "setupservice",
          route: "/setup-service"
        },
        {
          icon: Sparkles,
          label: "Setup Cleanliness",
          value: "setupcleanliness",
          route: "/setup-cleanliness"
        },
        {
          icon: Coffee,
          label: "Setup Product Quality",
          value: "setupproductquality",
          route: "/setup-product-quality"
        }
      ]
    },
    {
      title: "Forms",
      items: [
        {
          icon: Award,
          label: "CHAMPS Form",
          value: "champsform",
          route: "/champs-form"
        },
        {
          icon: ClipboardCheck,
          label: "Service Form",
          value: "serviceform",
          route: "/service-form"
        },
        {
          icon: Sparkles,
          label: "Cleanliness Form",
          value: "cleanlinessform",
          route: "/cleanliness-form"
        },
        {
          icon: Coffee,
          label: "Product Quality Form",
          value: "productqualityform",
          route: "/product-quality-form"
        },
        {
          icon: FileText,
          label: "ESP Form",
          value: "espform",
          route: "/esp-form"
        },
        {
          icon: FileText,
          label: "Finance Form",
          value: "financeform",
          route: "/finance-form"
        }
      ]
    },
    {
      title: "Reports",
      items: [
        {
          icon: Award,
          label: "CHAMPS Report",
          value: "champsreport",
          route: "/report"
        },
        {
          icon: ClipboardCheck,
          label: "Service Report",
          value: "servicereport",
          route: "/service-report"
        },
        {
          icon: Sparkles,
          label: "Cleanliness Report",
          value: "cleanlinessreport",
          route: "/cleanliness-report"
        },
        {
          icon: Coffee,
          label: "Product Quality Report",
          value: "productqualityreport",
          route: "/product-quality-report"
        },
        {
          icon: FileText,
          label: "ESP Report",
          value: "espreport",
          route: "/esp-report"
        },
        {
          icon: FileText,
          label: "Finance Report",
          value: "financereport",
          route: "/finance-report"
        },
        {
          icon: MessageSquare,
          label: "Complaint Report",
          value: "complaintreport",
          route: "/complaint-report"
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
      setSidebarOpen(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section.toLowerCase()]: !prev[section.toLowerCase()]
    }));
  };

  return (
    <>
      {/* Burger Menu Button - Fixed Position */}
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6 text-gray-600" />
        ) : (
          <Menu className="h-6 w-6 text-gray-600" />
        )}
      </button>

      {/* Black Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <ScrollArea className="h-full py-6">
          <div className="px-3 py-2">
            <h2 className="mb-6 px-4 text-lg font-semibold tracking-tight">
              CRS-Store
            </h2>
            
            {menuSections.map((section, index) => (
              <div key={index} className="mb-4">
                <button
                  onClick={() => toggleSection(section.title as keyof typeof expandedSections)}
                  className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  {section.title}
                  {expandedSections[section.title.toLowerCase() as keyof typeof expandedSections] ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                
                {expandedSections[section.title.toLowerCase() as keyof typeof expandedSections] && (
                  <div className="mt-1 space-y-1">
                    {section.items.map((item, itemIndex) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={itemIndex}
                          variant="ghost"
                          className="w-full justify-start gap-2"
                          onClick={() => handleTabChange(item.value)}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
};

export default SidePanel;
