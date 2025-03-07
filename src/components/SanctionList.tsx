
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ActiveSanction } from "@/components/store-performance/types";

interface SanctionListProps {
  sanctions: ActiveSanction[];
}

export function SanctionList({ sanctions }: SanctionListProps) {
  const getSanctionColor = (type: string) => {
    switch (type) {
      case 'Peringatan Tertulis':
        return 'bg-yellow-100 text-yellow-800';
      case 'SP1':
        return 'bg-orange-100 text-orange-800';
      case 'SP2':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (sanctions.length === 0) {
    return <p className="text-sm text-gray-500">No sanctions for this period.</p>;
  }

  return (
    <div className="space-y-3">
      {sanctions.map((sanction) => (
        <div key={sanction.id} className="p-3 text-sm border border-gray-200 rounded-md">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-medium">{sanction.employee_name}</p>
              <Badge className={getSanctionColor(sanction.sanction_type)}>
                {sanction.sanction_type}
              </Badge>
            </div>
            <span className="text-gray-500">{new Date(sanction.sanction_date).toLocaleDateString()}</span>
          </div>
          <p className="text-gray-600 text-sm">{sanction.violation_details}</p>
        </div>
      ))}
    </div>
  );
}
