
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Store } from "./types";

interface FinancialKPIProps {
  selectedStores: Store[];
  selectedMonth: number;
  selectedYear: number;
}

const calculateKPI = (actual: number, target: number): number => {
  if (!target) return 0;
  return Math.min((actual / target) * 4, 4);
};

const calculateOPEXKPI = (totalSales: number, actualOPEX: number, targetOPEXPercentage: number): number => {
  if (!totalSales || !targetOPEXPercentage) return 0;
  const actualOPEXPercentage = (actualOPEX / totalSales) * 100;
  return Math.max(0, Math.min((targetOPEXPercentage / actualOPEXPercentage) * 4, 4));
};

const StoreFinanceCard = ({ 
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

  const { data: financials = [] } = useQuery({
    queryKey: ["financialData", store.id, selectedMonth, selectedYear],
    queryFn: async () => {
      if (!filteredDates?.length) return [];
      
      const { data, error } = await supabase
        .from("financial_records_report")
        .select("*")
        .eq("store_name", store.name)
        .in('input_date', filteredDates.map(d => d.evaluation_date));

      if (error) throw error;
      return data || [];
    },
    enabled: !!filteredDates?.length,
  });

  const latestFinancial = financials[0] || null;

  if (!latestFinancial) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">{store.name} - {store.city}</h2>
        <p className="text-gray-500">No financial data available for this period</p>
      </Card>
    );
  }

  const salesKPI = calculateKPI(latestFinancial.total_sales, latestFinancial.target_sales || 0);
  const cogsKPI = calculateKPI(latestFinancial.cogs_target || 0, latestFinancial.cogs_achieved);
  const productivityKPI = calculateKPI(latestFinancial.total_sales / (latestFinancial.total_crew || 1), 30000000);
  const opexKPI = calculateOPEXKPI(latestFinancial.total_sales, latestFinancial.total_opex, 4);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">{store.name} - {store.city}</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Total Sales</h3>
            <div className="text-2xl font-bold">{latestFinancial.total_sales?.toLocaleString()}</div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Target Sales</h3>
            <div className="text-2xl font-bold">{latestFinancial.target_sales?.toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Sales KPI</p>
            <p className={`text-2xl font-semibold ${
              salesKPI >= 3 ? 'text-green-600' :
              salesKPI >= 2 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {salesKPI.toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">COGS KPI</p>
            <p className={`text-2xl font-semibold ${
              cogsKPI >= 3 ? 'text-green-600' :
              cogsKPI >= 2 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {cogsKPI.toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Productivity KPI</p>
            <p className={`text-2xl font-semibold ${
              productivityKPI >= 3 ? 'text-green-600' :
              productivityKPI >= 2 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {productivityKPI.toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">OPEX KPI</p>
            <p className={`text-2xl font-semibold ${
              opexKPI >= 3 ? 'text-green-600' :
              opexKPI >= 2 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {opexKPI.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const FinancialKPI = ({ selectedStores, selectedMonth, selectedYear }: FinancialKPIProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {selectedStores.map(store => (
        <StoreFinanceCard 
          key={store.id} 
          store={store}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      ))}
    </div>
  );
};
