import { Card } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Store, SanctionKPI as SanctionKPIType } from './types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parse, endOfMonth } from 'date-fns';
import { AlertCircle, Users } from "lucide-react";

interface SanctionKPIProps {
  selectedStores: Store[];
  selectedMonth: string;
  selectedYear: string;
}

export const SanctionKPI: React.FC<SanctionKPIProps> = ({
  selectedStores,
  selectedMonth,
  selectedYear,
}) => {
  const { data: sanctionData = [] } = useQuery<SanctionKPIType[]>({
    queryKey: ['sanctionKPI', selectedStores.map(s => s.id), selectedMonth, selectedYear],
    queryFn: async () => {
      if (selectedStores.length === 0) return [];
      
      const startDate = `${selectedYear}-${selectedMonth}-01`;
      const monthDate = parse(startDate, 'yyyy-MM-dd', new Date());
      const endDate = format(endOfMonth(monthDate), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('employee_sanctions_kpi')
        .select('*')
        .in('store_name', selectedStores.map(s => s.name))
        .gte('input_date', startDate)
        .lte('input_date', endDate);
      
      if (error) throw error;
      return data || [];
    },
    enabled: selectedStores.length > 0
  });

  const { data: activeSanctions } = useQuery({
    queryKey: ['activeSanctions', selectedStores.map(s => s.id), selectedMonth, selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_sanctions_report')
        .select('*')
        .in('store_id', selectedStores.map(s => s.id))
        .eq('is_active', true)
        .order('sanction_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: Boolean(selectedStores.length > 0 && selectedMonth && selectedYear)
  });

  if (selectedStores.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="font-medium text-lg mb-4">Sanction KPI</h3>
        <p className="text-gray-500">No stores selected</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="font-medium text-lg mb-4">Sanction KPI</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Store</TableHead>
            <TableHead>Total Employees</TableHead>
            <TableHead>Active Warnings</TableHead>
            <TableHead>Active SP1</TableHead>
            <TableHead>Active SP2</TableHead>
            <TableHead>KPI Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {selectedStores.map(store => {
            const storeData = sanctionData.find(d => d.store_name === store.name);
            if (!storeData) return null;

            return (
              <TableRow key={store.id}>
                <TableCell className="font-medium">{store.name}</TableCell>
                <TableCell>{storeData.total_employees}</TableCell>
                <TableCell>{storeData.active_peringatan}</TableCell>
                <TableCell>{storeData.active_sp1}</TableCell>
                <TableCell>{storeData.active_sp2}</TableCell>
                <TableCell className={storeData.kpi_score >= 3 ? 'text-green-600' : 'text-red-600'}>
                  {storeData.kpi_score}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
};
