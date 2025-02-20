import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { 
  UserPlus, 
  Shield,
  ChevronRight,
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
  X,
  LineChart,
  UtensilsCrossed,
  HeartHandshake,
  ShieldCheck,
  DollarSign,
  ClipboardList,
  Star,
  AlertTriangle,
  LogOut
} from "lucide-react";

interface SidePanelProps {
  onTabChange: (tab: string) => void;
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
  const { signOut, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    main: false,
    setup: false,
    forms: false,
    reports: false
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
          icon: LineChart,
          label: "Store Performance",
          value: "store-performance",
          route: "/store-performance"
        }
      ]
    },
    {
      title: "Company Policy",
      items: [
        {
          icon: UserPlus,
          label: "User Management",
          value: "user-management",
          route: "/users"
        },
        {
          icon: Shield,
          label: "Role Management",
          value: "role-management",
          route: "/roles"
        }
      ]
    },
    {
      title: "Setup",
      items: [
        {
          icon: Store,
          label: "Store",
          value: "setup-store",
          route: "/setup-store"
        },
        {
          icon: Star,
          label: "CHAMPS",
          value: "setup-champs",
          route: "/setup-champs"
        },
        {
          icon: Sparkles,
          label: "Cleanliness",
          value: "setup-cleanliness",
          route: "/setup-cleanliness"
        },
        {
          icon: HeartHandshake,
          label: "Service",
          value: "setup-service",
          route: "/setup-service"
        },
        {
          icon: UtensilsCrossed,
          label: "Product Quality",
          value: "setup-product-quality",
          route: "/setup-product-quality"
        },
        {
          icon: MessageSquare,
          label: "Complaint",
          value: "setup-complain",
          route: "/setup-complain"
        }
      ]
    },
    {
      title: "Forms",
      items: [
        {
          icon: Star,
          label: "CHAMPS",
          value: "champs-form",
          route: "/champs-form"
        },
        {
          icon: Sparkles,
          label: "Cleanliness",
          value: "cleanliness-form",
          route: "/cleanliness-form"
        },
        {
          icon: HeartHandshake,
          label: "Service",
          value: "service-form",
          route: "/service-form"
        },
        {
          icon: UtensilsCrossed,
          label: "Product Quality",
          value: "product-quality-form",
          route: "/product-quality-form"
        },
        {
          icon: ClipboardCheck,
          label: "ESP",
          value: "esp-form",
          route: "/esp-form"
        },
        {
          icon: DollarSign,
          label: "Finance",
          value: "finance-form",
          route: "/finance-form"
        },
        {
          icon: MessageSquare,
          label: "Complaint",
          value: "complaint-form",
          route: "/complaint-form"
        },
        {
          icon: AlertTriangle,
          label: "Employee Sanction",
          value: "employee-sanction-form",
          route: "/employee-sanction-form"
        }
      ]
    },
    {
      title: "Reports",
      items: [
        {
          icon: Star,
          label: "CHAMPS",
          value: "champs-report",
          route: "/report"
        },
        {
          icon: Sparkles,
          label: "Cleanliness",
          value: "cleanliness-report",
          route: "/cleanliness-report"
        },
        {
          icon: HeartHandshake,
          label: "Service",
          value: "service-report",
          route: "/service-report"
        },
        {
          icon: UtensilsCrossed,
          label: "Product Quality",
          value: "product-quality-report",
          route: "/product-quality-report"
        },
        {
          icon: ClipboardCheck,
          label: "ESP",
          value: "esp-report",
          route: "/esp-report"
        },
        {
          icon: DollarSign,
          label: "Finance",
          value: "finance-report",
          route: "/finance-report"
        },
        {
          icon: MessageSquare,
          label: "Complaint",
          value: "complaint-report",
          route: "/complaint-report"
        },
        {
          icon: AlertTriangle,
          label: "Employee Sanction",
          value: "sanction-report",
          route: "/sanction-report"
        },
        {
          icon: Store,
          label: "Workplace Evaluation",
          value: "workplace-report",
          route: "/workplace-report"
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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <>
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

      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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
            <div className="flex flex-col items-center mb-6">
              <img 
                src="/public/lovable-uploads/labbaik.png" 
                alt="Labllaik Chicken Logo" 
                className="w-auto h-16 object-contain mb-4"
              />
              <h2 className="text-lg font-semibold tracking-tight text-center">
                CRS-Store Evaluate Performance
              </h2>
            </div>
            
            {menuSections.map((section, index) => (
              <div key={index} className="mb-4">
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  {section.title}
                  {expandedSections[section.title] ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                
                {expandedSections[section.title] && (
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

            <div className="mt-auto pt-4 px-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={signOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </ScrollArea>
      </aside>
    </>
  );
};

export default SidePanel;
