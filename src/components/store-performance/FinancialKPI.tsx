
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Store, FinancialRecord } from "./types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface FinancialKPIProps {
  selectedStores: Store[];
  selectedMonth: number;
  selectedYear: number;
}

export const FinancialKPI = ({ selectedStores, selectedMonth, selectedYear }: FinancialKPIProps) => {
  const queryKey = ["financialData", selectedMonth, selectedYear];

  const { data: financialData } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_records_report")
        .select("*")
        .in(
          "store_name",
          selectedStores.map((store) => store.name)
        )
        .filter('input_date', 'in', 
          `(SELECT evaluation_date FROM filter_evaluation_by_month_year(${selectedMonth}, ${selectedYear}))`
        );

      if (error) throw error;
      return data as FinancialRecord[];
    },
    enabled: selectedStores.length > 0
  });

  if (!financialData) {
    return (
      <Card className="p-4">
        <p className="text-center text-gray-500">No financial data available</p>
      </Card>
    );
  }

  const calculateKPIs = (record: FinancialRecord) => {
    const salesKPI = record.total_sales / record.target_sales;
    const cogsKPI = record.cogs_target / record.cogs_achieved;
    const opexKPI = record.total_opex / (record.total_sales * 0.3);
    const productivityKPI = record.total_sales / (record.total_crew * 30000000);

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Sales KPI</TableHead>
                <TableHead>COGS KPI</TableHead>
                <TableHead>OPEX KPI</TableHead>
                <TableHead>Productivity KPI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {financialData?.map((record) => {
                const kpis = calculateKPIs(record);
                return (
                  <TableRow key={record.id}>
                    <TableCell>{record.store_name}</TableCell>
                    <TableCell className={kpis.salesKPI >= 1 ? "text-green-500" : "text-red-500"}>
                      {kpis.salesKPI}
                    </TableCell>
                    <TableCell className={kpis.cogsKPI >= 1 ? "text-green-500" : "text-red-500"}>
                      {kpis.cogsKPI}
                    </TableCell>
                    <TableCell className={kpis.opexKPI <= 1 ? "text-green-500" : "text-red-500"}>
                      {kpis.opexKPI}
                    </TableCell>
                    <TableCell className={kpis.productivityKPI >= 1 ? "text-green-500" : "text-red-500"}>
                      {kpis.productivityKPI}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
