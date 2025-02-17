
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Store } from "./types";

interface AuditKPIProps {
  selectedStores: Store[];
  selectedMonth: number;
  selectedYear: number;
}

const StoreAuditCard = ({ 
  store, 
  selectedMonth,
  selectedYear
}: { 
  store: Store;
  selectedMonth: number;
  selectedYear: number;
}) => {
  const { data: filteredDates } = useQuery({
    queryKey: ['filteredDates', selectedMonth, selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('filter_evaluation_by_month_year', {
        target_month: selectedMonth,
        target_year: selectedYear
      });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: audits = [] } = useQuery({
    queryKey: ["auditData", store.id, selectedMonth, selectedYear],
    queryFn: async () => {
      if (!filteredDates?.length) return [];
      
      const { data, error } = await supabase
        .from("esp_evaluation_report")
        .select("*")
        .eq("store_name", store.name)
        .in('evaluation_date', filteredDates.map(d => d.evaluation_date));

      if (error) throw error;
      return data || [];
    },
    enabled: !!filteredDates?.length,
  });

  const latestAudit = audits[0] || null;

  if (!latestAudit) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">{store.name} - {store.city}</h2>
        <p className="text-gray-500">No audit data available for this period</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">{store.name} - {store.city}</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg

-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Final Score</h3>
            <div className={`text-2xl font-bold ${
              latestAudit.final_score >= 90 ? 'text-green-600' :
              latestAudit.final_score >= 80 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {latestAudit.final_score}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">KPI Score</h3>
            <div className={`text-2xl font-bold ${
              latestAudit.kpi_score >= 3 ? 'text-green-600' :
              latestAudit.kpi_score >= 2 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {latestAudit.kpi_score}
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-lg mb-2">Total Score</h3>
          <div className="text-2xl font-bold">
            {latestAudit.total_score}
          </div>
        </div>
      </div>
    </Card>
  );
};

export const AuditKPI = ({ selectedStores, selectedMonth, selectedYear }: AuditKPIProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {selectedStores.map(store => (
        <StoreAuditCard 
          key={store.id} 
          store={store}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      ))}
    </div>
  );
};
