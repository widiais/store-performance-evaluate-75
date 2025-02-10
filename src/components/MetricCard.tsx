
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

const MetricCard = ({ title, value, description, icon: Icon }: MetricCardProps) => {
  return (
    <div className="p-6 bg-card rounded-lg border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-2xl font-bold mb-2">{value}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default MetricCard;
