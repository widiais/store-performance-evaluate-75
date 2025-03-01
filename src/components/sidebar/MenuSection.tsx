
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { MenuSection as MenuSectionType } from "@/types/menu";
import { useMenuAccess } from "@/hooks/useMenuAccess";
import { useNavigate } from "react-router-dom";

interface MenuSectionProps {
  section: MenuSectionType;
  isExpanded: boolean;
  onToggle: () => void;
  onItemClick: (value: string) => void;
}

export const MenuSection = ({ 
  section, 
  isExpanded, 
  onToggle, 
  onItemClick 
}: MenuSectionProps) => {
  const { canAccessMenu, isSuperAdmin } = useMenuAccess();
  const navigate = useNavigate();

  // If super admin, show all items, otherwise filter by permission
  const sectionItems = isSuperAdmin() 
    ? section.items 
    : section.items.filter(item => !item.resource || canAccessMenu(item.resource));

  if (sectionItems.length === 0) return null;

  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-lg"
      >
        {section.title}
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      
      {isExpanded && (
        <div className="mt-1 space-y-1">
          {sectionItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => onItemClick(item.value)}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};
