import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Store } from "./types";

interface SanctionKPIProps {
  selectedStores: Store[];
  selectedMonth: number;
  selectedYear: number;
}

interface SanctionKPI {
  id: number;
  store_id: number;
  store_name: string;
  store_city: string;
  total_employees: number;
  active_peringatan: number;
  active_sp1: number;
  active_sp2: number;
  kpi_score: number;
}

interface ActiveSanction {
  id: number;
  employee_name: string;
  sanction_type: string;
  sanction_date: string;
  violation_details: string;
  submitted_by: string;
  store_id: number;
  is_active: boolean;
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
      return (data || []) as SanctionKPI[];
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
      return (data || []) as ActiveSanction[];
    },
  });

  const calculateSanctionKPI = (record: SanctionKPI) => {
    const peringatanWeight = record.active_peringatan * 0.5;
    const sp1Weight = record.active_sp1 * 1;
    const sp2Weight = record.active_sp2 * 2;
    
    const totalWeight = peringatanWeight + sp1Weight + sp2Weight;
    const maxWeight = record.total_employees * 2;
    
    const kpiScore = 4 * (1 - totalWeight / maxWeight);
    return Math.max(0, Math.min(4, kpiScore));
  };

  const getSanctionColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'peringatan':
        return 'text-yellow-500';
      case 'sp1':
        return 'text-orange-500';
      case 'sp2':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-medium text-lg mb-4">Ringkasan KPI Sanksi</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store</TableHead>
              <TableHead className="text-center">Total Karyawan</TableHead>
              <TableHead className="text-center">Peringatan</TableHead>
              <TableHead className="text-center">SP1</TableHead>
              <TableHead className="text-center">SP2</TableHead>
              <TableHead className="text-center">KPI Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sanctionData?.map((record) => {
              const kpiScore = calculateSanctionKPI(record);
              return (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.store_name}</TableCell>
                  <TableCell className="text-center">{record.total_employees}</TableCell>
                  <TableCell className="text-center text-yellow-500">{record.active_peringatan}</TableCell>
                  <TableCell className="text-center text-orange-500">{record.active_sp1}</TableCell>
                  <TableCell className="text-center text-red-500">{record.active_sp2}</TableCell>
                  <TableCell className={`text-center ${kpiScore >= 3 ? "text-green-600" : "text-red-600"}`}>
                    {kpiScore.toFixed(2)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium text-lg mb-4">Detail Sanksi Aktif</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store</TableHead>
              <TableHead>Nama Karyawan</TableHead>
              <TableHead className="text-center">Jenis Sanksi</TableHead>
              <TableHead className="text-center">Tanggal</TableHead>
              <TableHead>Detail Pelanggaran</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeSanctions?.map((sanction) => (
              <TableRow key={sanction.id}>
                <TableCell>{sanctionData?.find(s => s.store_id === sanction.store_id)?.store_name}</TableCell>
                <TableCell>{sanction.employee_name}</TableCell>
                <TableCell className={`text-center ${getSanctionColor(sanction.sanction_type)}`}>
                  {sanction.sanction_type}
                </TableCell>
                <TableCell className="text-center">
                  {format(new Date(sanction.sanction_date), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell className="max-w-[300px] truncate" title={sanction.violation_details}>
                  {sanction.violation_details}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
