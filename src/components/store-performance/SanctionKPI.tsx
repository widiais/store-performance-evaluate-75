
import { Card } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Store, SanctionKPI as SanctionKPIType } from './types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { AlertCircle, Users } from "lucide-react";

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

  const { data: activeSanctions } = useQuery({
    queryKey: ['activeSanctions', store.id, selectedMonth, selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_sanctions_report')
        .select('*')
        .eq('store_id', store.id)
        .eq('is_active', true)
        .order('sanction_date', { ascending: false });

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
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-medium text-lg">{store.name} - {store.city}</h3>
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-gray-500" />
          <span className="text-gray-500">{sanctionKPI.total_employees} Employees</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

      <div className="rounded-lg border">
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
            {activeSanctions && activeSanctions.length > 0 ? (
              activeSanctions.map((sanction) => (
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
      </div>
    </Card>
  );
};
