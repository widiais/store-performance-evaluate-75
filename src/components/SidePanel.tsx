import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  FileText, 
  FolderCog,
  ClipboardList,
  Wallet,
  Menu,
  X,
  MessageSquare,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Settings
} from 'lucide-react';
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
  const [expandedSections, setExpandedSections] = useState({
    main: true,
    setup: true,
    forms: true,
    reports: true
  });

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
          value: "dashboard",
          route: "/"
        },
        {
          icon: TrendingUp,
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
          icon: FolderCog,
          label: "Setup Store",
          value: "setupstore",
          route: "/setup-store"
        },
        {
          icon: FolderCog,
          label: "Setup CHAMPS",
          value: "setupchamps",
          route: "/setup-champs"
        },
        {
          icon: FolderCog,
          label: "Setup Cleanliness",
          value: "setupcleanliness",
          route: "/setup-cleanliness"
        },
        {
          icon: FolderCog,
          label: "Setup Product Quality",
          value: "setupproductquality",
          route: "/setup-product-quality"
        },
        {
          icon: FolderCog,
          label: "Setup Service",
          value: "setupservice",
          route: "/setup-service"
        },
        {
          icon: FolderCog,
          label: "Setup Complain",
          value: "setupcomplain",
          route: "/setup-complain"
        }
      ]
    },
    {
      title: "Forms",
      items: [
        {
          icon: ClipboardList,
          label: "CHAMPS Form",
          value: "champsform",
          route: "/champs-form"
        },
        {
          icon: ClipboardList,
          label: "Cleanliness Form",
          value: "cleanlinessform",
          route: "/cleanliness-form"
        },
        {
          icon: ClipboardList,
          label: "Service Form",
          value: "serviceform",
          route: "/service-form"
        },
        {
          icon: ClipboardList,
          label: "Product Quality Form",
          value: "productqualityform",
          route: "/product-quality-form"
        },
        {
          icon: ClipboardList,
          label: "ESP Form",
          value: "espform",
          route: "/esp-form"
        },
        {
          icon: ClipboardList,
          label: "Finance Data Form",
          value: "financeform",
          route: "/finance-form"
        },
        {
          icon: ClipboardList,
          label: "Complaint Form",
          value: "complaintform",
          route: "/complaint-form"
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
      setIsMobileMenuOpen(false);
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

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 transition-transform duration-300 ease-in-out",
          isMobile && !isMobileMenuOpen && "-translate-x-full",
          !isMobile && "translate-x-0"
        )}
      >
        <div className="h-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
                CRS-Store Performance Evaluation
              </h2>
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
            
            <div className="flex flex-col gap-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {menuSections.map((section) => (
                <div key={section.title} className="flex flex-col">
                  <button
                    onClick={() => toggleSection(section.title as keyof typeof expandedSections)}
                    className="flex items-center justify-between text-xs font-medium text-gray-400 uppercase px-2 mb-2 hover:text-gray-600"
                  >
                    <span>{section.title}</span>
                    {expandedSections[section.title.toLowerCase() as keyof typeof expandedSections] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  <div className={cn(
                    "flex flex-col gap-1 transition-all duration-300",
                    !expandedSections[section.title.toLowerCase() as keyof typeof expandedSections] && "hidden"
                  )}>
                    {section.items.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => handleTabChange(item.value)}
                        className="flex items-center gap-3 px-2 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
