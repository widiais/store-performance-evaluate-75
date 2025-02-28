
import { 
  UserPlus, 
  Shield,
  LayoutDashboard,
  Store,
  Award,
  Sparkles,
  Coffee,
  LineChart,
  UtensilsCrossed,
  HeartHandshake,
  MessageSquare,
  Star,
  ClipboardCheck,
  DollarSign,
  AlertTriangle,
  Lock,
  UserCheck
} from "lucide-react";
import type { MenuSection } from "@/types/menu";

export const menuSections: MenuSection[] = [
  {
    title: "Main",
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        value: "dashboard",
        route: "/",
        resource: "dashboard"
      },
      {
        icon: LineChart,
        label: "Store Performance",
        value: "store-performance",
        route: "/store-performance",
        resource: "store-performance"
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
        route: "/users",
        resource: "user-management"
      },
      {
        icon: UserCheck,
        label: "User Register",
        value: "user-register",
        route: "/user-register",
        resource: "user-register"
      },
      {
        icon: Shield,
        label: "Role Management",
        value: "role-management",
        route: "/roles",
        resource: "role-management"
      },
      {
        icon: Lock,
        label: "Change Password",
        value: "change-password",
        route: "/change-password",
        resource: "change-password"
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
        route: "/setup-store",
        resource: "setup-store"
      },
      {
        icon: Star,
        label: "CHAMPS",
        value: "setup-champs",
        route: "/setup-champs",
        resource: "setup-champs"
      },
      {
        icon: Sparkles,
        label: "Cleanliness",
        value: "setup-cleanliness",
        route: "/setup-cleanliness",
        resource: "setup-cleanliness"
      },
      {
        icon: HeartHandshake,
        label: "Service",
        value: "setup-service",
        route: "/setup-service",
        resource: "setup-service"
      },
      {
        icon: UtensilsCrossed,
        label: "Product Quality",
        value: "setup-product-quality",
        route: "/setup-product-quality",
        resource: "setup-product-quality"
      },
      {
        icon: MessageSquare,
        label: "Complaint",
        value: "setup-complain",
        route: "/setup-complain",
        resource: "setup-complain"
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
        route: "/champs-form",
        resource: "champs-form"
      },
      {
        icon: Sparkles,
        label: "Cleanliness",
        value: "cleanliness-form",
        route: "/cleanliness-form",
        resource: "cleanliness-form"
      },
      {
        icon: HeartHandshake,
        label: "Service",
        value: "service-form",
        route: "/service-form",
        resource: "service-form"
      },
      {
        icon: UtensilsCrossed,
        label: "Product Quality",
        value: "product-quality-form",
        route: "/product-quality-form",
        resource: "product-quality-form"
      },
      {
        icon: ClipboardCheck,
        label: "ESP",
        value: "esp-form",
        route: "/esp-form",
        resource: "esp-form"
      },
      {
        icon: DollarSign,
        label: "Finance",
        value: "finance-form",
        route: "/finance-form",
        resource: "finance-form"
      },
      {
        icon: MessageSquare,
        label: "Complaint",
        value: "complaint-form",
        route: "/complaint-form",
        resource: "complaint-form"
      },
      {
        icon: AlertTriangle,
        label: "Employee Sanction",
        value: "employee-sanction-form",
        route: "/employee-sanction-form",
        resource: "employee-sanction-form"
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
        route: "/report",
        resource: "champs-report"
      },
      {
        icon: Sparkles,
        label: "Cleanliness",
        value: "cleanliness-report",
        route: "/cleanliness-report",
        resource: "cleanliness-report"
      },
      {
        icon: HeartHandshake,
        label: "Service",
        value: "service-report",
        route: "/service-report",
        resource: "service-report"
      },
      {
        icon: UtensilsCrossed,
        label: "Product Quality",
        value: "product-quality-report",
        route: "/product-quality-report",
        resource: "product-quality-report"
      },
      {
        icon: ClipboardCheck,
        label: "ESP",
        value: "esp-report",
        route: "/esp-report",
        resource: "esp-report"
      },
      {
        icon: DollarSign,
        label: "Finance",
        value: "finance-report",
        route: "/finance-report",
        resource: "finance-report"
      },
      {
        icon: MessageSquare,
        label: "Complaint",
        value: "complaint-report",
        route: "/complaint-report",
        resource: "complaint-report"
      },
      {
        icon: AlertTriangle,
        label: "Employee Sanction",
        value: "sanction-report",
        route: "/sanction-report",
        resource: "sanction-report"
      },
      {
        icon: Store,
        label: "Workplace Evaluation",
        value: "workplace-report",
        route: "/workplace-report",
        resource: "workplace-report"
      }
    ]
  }
];
