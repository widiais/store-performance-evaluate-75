
import { LucideIcon } from "lucide-react";

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  value: string;
  route?: string;
  resource?: string;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}
