
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Store } from "./types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { AlertCircle, Users } from "lucide-react";

interface SanctionKPIProps {
  selectedStores: Store[];
  selectedMonth: number;
  selectedYear: number;
}

export const SanctionKPI = ({ selectedStores, selectedMonth, selectedYear }: SanctionKPIProps) => {
  const { data: sanctionData } = useQuery({
    queryKey: ["sanctionData", selectedStores.map(s => s.id), selectedMonth, selectedYear] as const,
    queryFn: async () => {
      if (selectedStores.length === 0) return [];

      const { data, error } = await supabase
        .from("employee_sanctions_kpi")
        .select()
        .in("store_id", selectedStores.map(s => s.id));

      if (error) throw error;
      return data;
    },
  });

  const { data: activeSanctions } = useQuery({
    queryKey: ["activeSanctions", selectedStores.map(s => s.id), selectedMonth, selectedYear] as const,
    queryFn: async () => {
      if (selectedStores.length === 0) return [];

      const { data, error } = await supabase
        .from("employee_sanctions_report")
        .select()
        .in("store_id", selectedStores.map(s => s.id))
        .eq("is_active", true)
        .order("sanction_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4">
      {selectedStores.map(store => {
        const storeData = sanctionData?.find(s => s.store_id === store.id);
        
        if (!storeData) return null;

        return (
          <Card key={store.id} className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-medium text-lg">{store.name} - {store.city}</h3>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-500" />
                <span className="text-gray-500">{storeData.total_employees} Employees</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Active Warnings</p>
                <p className="text-xl font-medium text-yellow-600">{storeData.active_peringatan}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Active SP1</p>
                <p className="text-xl font-medium text-orange-600">{storeData.active_sp1}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Active SP2</p>
                <p className="text-xl font-medium text-red-600">{storeData.active_sp2}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">KPI Score</p>
                <p className={`text-xl font-medium ${
                  storeData.kpi_score >= 3 ? 'text-green-600' :
                  storeData.kpi_score >= 2 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {storeData.kpi_score.toFixed(2)}
                </p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Sanction Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Submitted By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSanctions?.filter(s => s.store_id === store.id).length ? (
                  activeSanctions
                    ?.filter(s => s.store_id === store.id)
                    .map((sanction) => (
                      <TableRow key={sanction.id}>
                        <TableCell className="font-medium">{sanction.employee_name}</TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${sanction.sanction_type === 'SP2' ? 'bg-red-100 text-red-800' :
                              sanction.sanction_type === 'SP1' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'}`}>
                            {sanction.sanction_type}
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(sanction.sanction_date), 'dd MMM yyyy')}</TableCell>
                        <TableCell>{sanction.violation_details}</TableCell>
                        <TableCell>{sanction.submitted_by}</TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      <div className="flex items-center justify-center text-gray-500">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        No active sanctions
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        );
      })}
    </div>
  );
};
