
import { Card } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Store, SanctionKPI as SanctionKPIType } from './types';

interface SanctionKPIProps {
  store: Store;
  selectedMonth: string;
  selectedYear: string;
}

export const SanctionKPI = ({ store, selectedMonth, selectedYear }: SanctionKPIProps) => {
  const { data: sanctionKPI } = useQuery<SanctionKPIType>({
    queryKey: ['sanctionKPI', store.id, selectedMonth, selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_sanctions_kpi')
        .select('*')
        .eq('store_id', store.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: Boolean(store.id && selectedMonth && selectedYear)
  });

  if (!sanctionKPI) {
    return (
      <Card key={store.id} className="p-6">
        <h3 className="font-medium text-lg mb-4">{store.name} - {store.city}</h3>
        <p className="text-gray-500">No sanction data available</p>
      </Card>
    );
  }

  return (
    <Card key={store.id} className="p-6">
      <h3 className="font-medium text-lg mb-4">{store.name} - {store.city}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Total Employees</p>
          <p className="text-xl font-medium">{sanctionKPI.total_employees}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Active Warnings</p>
          <p className="text-xl font-medium text-yellow-600">{sanctionKPI.active_peringatan}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Active SP1</p>
          <p className="text-xl font-medium text-orange-600">{sanctionKPI.active_sp1}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Active SP2</p>
          <p className="text-xl font-medium text-red-600">{sanctionKPI.active_sp2}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">KPI Score</p>
          <p className={`text-xl font-medium ${
            sanctionKPI.kpi_score >= 3 ? 'text-green-600' :
            sanctionKPI.kpi_score >= 2 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {sanctionKPI.kpi_score}
          </p>
        </div>
      </div>
    </Card>
  );
};
