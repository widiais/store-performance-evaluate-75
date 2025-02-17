
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Store } from "./types";

interface SanctionKPIProps {
  selectedStores: Store[];
  selectedMonth: number;
  selectedYear: number;
}

const StoreSanctionCard = ({ 
  store 
}: { 
  store: Store;
}) => {
  const { data: sanctions = [] } = useQuery({
    queryKey: ["sanctionData", store.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_sanctions_report")
        .select()
        .eq("store_id", store.id)
        .eq("is_active", true)
        .order("sanction_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

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

  // Calculate KPI score based on crew count
  const calculateKPIScore = () => {
    if (!store.total_crew) return 0;

    const violationRatio = totalSanctionScore / store.total_crew;
    const maxViolationRatio = 0.5; // 50% of total crew
    return Math.max(0, (1 - (violationRatio / maxViolationRatio)) * 4);
  };

  const kpiScore = calculateKPIScore();

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">{store.name} - {store.city}</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Total Crew</h3>
            <div className="text-2xl font-bold">{store.total_crew}</div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Total Score</h3>
            <div className="text-2xl font-bold">{totalSanctionScore}</div>
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
