
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Store } from "./types";

interface SanctionKPIProps {
  selectedStores: Store[];
  selectedMonth: number;
  selectedYear: number;
}

interface SanctionData {
  store_id: number;
  store_name: string;
  store_city: string;
  total_employees: number;
  active_peringatan: number;
  active_sp1: number;
  active_sp2: number;
  kpi_score: number;
}

const StoreSanctionCard = ({ 
  store 
}: { 
  store: Store;
}) => {
  // First get the complete store data to ensure we have total_crew
  const { data: storeData } = useQuery({
    queryKey: ["store-detail", store.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", store.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: sanctions = [] } = useQuery({
    queryKey: ["sanctionData", store.id],
    queryFn: async () => {
      // Get sanctions with basic filtering on store_id and active status
      const { data, error } = await supabase
        .from("employee_sanctions")
        .select()
        .eq("store_id", store.id)
        .eq("is_active", true);

      if (error) throw error;
      return data || [];
    },
  });

  // Calculate active sanctions by type
  const active_peringatan = sanctions.filter(s => s.sanction_type === 'Peringatan Tertulis').length;
  const active_sp1 = sanctions.filter(s => s.sanction_type === 'SP1').length;
  const active_sp2 = sanctions.filter(s => s.sanction_type === 'SP2').length;

  // Calculate total sanction score
  const totalSanctionScore = sanctions.reduce((total, sanction) => {
    switch (sanction.sanction_type) {
      case 'Peringatan Tertulis':
        return total + 1;
      case 'SP1':
        return total + 2;
      case 'SP2':
        return total + 3;
      default:
        return total;
    }
  }, 0);

  // Calculate KPI score based on ratio
  const total_crew = storeData?.total_crew || 0;
  const maxViolationScore = total_crew; // Changed to use total crew
  const kpiScore = maxViolationScore > 0 
    ? Math.max(0, (1 - (totalSanctionScore / maxViolationScore)) * 4)
    : 4;

  const totalActiveSanctions = active_peringatan + active_sp1 + active_sp2;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">{store.name} - {store.city}</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Total Crew</h3>
            <div className="text-2xl font-bold">{total_crew}</div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Active Sanctions</h3>
            <div className="text-2xl font-bold">{totalActiveSanctions}</div>
            <div className="text-sm text-gray-500 mt-1">
              Peringatan: {active_peringatan} |
              SP1: {active_sp1} |
              SP2: {active_sp2}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Violation Score</h3>
            <div className="text-2xl font-bold">{totalSanctionScore}</div>
            <div className="text-sm text-gray-500 mt-1">
              Max allowed: {maxViolationScore.toFixed(1)}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">KPI Score</h3>
            <div className={`text-2xl font-bold ${
              kpiScore >= 3 ? 'text-green-600' :
              kpiScore >= 2 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {kpiScore.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const SanctionKPI = ({ selectedStores }: SanctionKPIProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {selectedStores.map(store => (
        <StoreSanctionCard key={store.id} store={store} />
      ))}
    </div>
  );
};
