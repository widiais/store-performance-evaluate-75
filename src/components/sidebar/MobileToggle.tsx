
import { Menu, X } from "lucide-react";

interface MobileToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const MobileToggle = ({ isOpen, onToggle }: MobileToggleProps) => {
  return (
    <button
      onClick={onToggle}
      className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
    >
      {isOpen ? (
        <X className="h-6 w-6 text-gray-600" />
      ) : (
        <Menu className="h-6 w-6 text-gray-600" />
      )}
    </button>
  );
};
