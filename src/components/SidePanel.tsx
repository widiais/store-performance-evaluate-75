
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { menuSections } from "@/config/menuItems";
import { MenuSection } from "./sidebar/MenuSection";
import { MobileToggle } from "./sidebar/MobileToggle";

interface SidePanelProps {
  onTabChange: (tab: string) => void;
}

const SidePanel = ({ onTabChange }: SidePanelProps) => {
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
      <MobileToggle 
        isOpen={isSidebarOpen} 
        onToggle={() => setSidebarOpen(!isSidebarOpen)} 
      />

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
              <MenuSection
                key={index}
                section={section}
                isExpanded={expandedSections[section.title.toLowerCase()]}
                onToggle={() => toggleSection(section.title.toLowerCase())}
                onItemClick={handleTabChange}
              />
            ))}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
};

export default SidePanel;
