import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Store, FinancialRecord } from "./types";

interface FinancialKPIProps {
  selectedStores: Store[];
  selectedMonth: number;
  selectedYear: number;
}

export const FinancialKPI = ({ selectedStores, selectedMonth, selectedYear }: FinancialKPIProps) => {
  const { data: financialData } = useQuery({
    queryKey: ["financialData", selectedStores, selectedMonth, selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_records_report")
        .select("*")
        .in(
          "store_id",
          selectedStores.map((store) => store.id)
        )
        .eq("month", selectedMonth)
        .eq("year", selectedYear);

      if (error) throw error;
      return data as FinancialRecord[];
    },
  });

  const calculateKPIs = (record: FinancialRecord) => {
    const salesKPI = record.total_sales / record.target_sales;
    const cogsKPI = record.cogs_target / record.cogs_achieved;
    const opexKPI = record.total_opex / (record.total_sales * 0.3); // Assuming 30% target
    const productivityKPI = record.total_sales / (record.total_crew * 30000000); // Assuming 30M per crew target

    return {
      salesKPI: Number(salesKPI.toFixed(2)),
      cogsKPI: Number(cogsKPI.toFixed(2)),
      opexKPI: Number(opexKPI.toFixed(2)),
      productivityKPI: Number(productivityKPI.toFixed(2)),
    };
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-4 h-[600px]">
        <div className="overflow-auto" style={{ maxHeight: "550px" }}>
          <table className="w-full">
            <thead>
              <tr>
                <th>Store</th>
                <th>Sales KPI</th>
                <th>COGS KPI</th>
                <th>OPEX KPI</th>
                <th>Productivity KPI</th>
              </tr>
            </thead>
            <tbody>
              {financialData?.map((record) => {
                const kpis = calculateKPIs(record);
                return (
                  <tr key={record.id}>
                    <td>{record.store_name}</td>
                    <td className={kpis.salesKPI >= 1 ? "text-green-500" : "text-red-500"}>
                      {kpis.salesKPI}
                    </td>
                    <td className={kpis.cogsKPI >= 1 ? "text-green-500" : "text-red-500"}>
                      {kpis.cogsKPI}
                    </td>
                    <td className={kpis.opexKPI <= 1 ? "text-green-500" : "text-red-500"}>
                      {kpis.opexKPI}
                    </td>
                    <td className={kpis.productivityKPI >= 1 ? "text-green-500" : "text-red-500"}>
                      {kpis.productivityKPI}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}; 