import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Store {
  id: number;
  name: string;
  city: string;
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

const SanctionPerformance = () => {
  const { data: sanctionData } = useQuery({
    queryKey: ["sanctionData"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_sanctions_kpi")
        .select("*")
        .order("store_name", { ascending: true });

      if (error) throw error;
      return (data || []) as SanctionKPI[];
    },
  });

  const { data: activeSanctions } = useQuery({
    queryKey: ["activeSanctions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_sanctions_report")
        .select("*")
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Sanction Performance</h1>
      <div className="grid grid-cols-2 gap-4">
        {/* KPI Summary Card */}
        <Card className="p-4 h-[600px]">
          <h3 className="font-semibold mb-4">KPI Summary</h3>
          <div className="overflow-auto" style={{ maxHeight: "550px" }}>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">Store</th>
                  <th className="text-center p-2">Total Karyawan</th>
                  <th className="text-center p-2">Peringatan</th>
                  <th className="text-center p-2">SP1</th>
                  <th className="text-center p-2">SP2</th>
                  <th className="text-center p-2">KPI Score</th>
                </tr>
              </thead>
              <tbody>
                {sanctionData?.map((record) => {
                  const kpiScore = calculateSanctionKPI(record);
                  return (
                    <tr key={record.id} className="border-t">
                      <td className="p-2">{record.store_name}</td>
                      <td className="text-center p-2">{record.total_employees}</td>
                      <td className="text-center p-2 text-yellow-500">{record.active_peringatan}</td>
                      <td className="text-center p-2 text-orange-500">{record.active_sp1}</td>
                      <td className="text-center p-2 text-red-500">{record.active_sp2}</td>
                      <td className={`text-center p-2 ${kpiScore >= 3 ? "text-green-500" : "text-red-500"}`}>
                        {kpiScore.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Active Sanctions Detail Card */}
        <Card className="p-4 h-[600px]">
          <h3 className="font-semibold mb-4">Detail Sanksi Aktif</h3>
          <div className="overflow-auto" style={{ maxHeight: "550px" }}>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">Store</th>
                  <th className="text-left p-2">Nama Karyawan</th>
                  <th className="text-center p-2">Jenis Sanksi</th>
                  <th className="text-center p-2">Tanggal</th>
                  <th className="text-left p-2">Detail Pelanggaran</th>
                </tr>
              </thead>
              <tbody>
                {activeSanctions?.map((sanction) => (
                  <tr key={sanction.id} className="border-t">
                    <td className="p-2">{sanctionData?.find(s => s.store_id === sanction.store_id)?.store_name}</td>
                    <td className="p-2">{sanction.employee_name}</td>
                    <td className={`text-center p-2 ${getSanctionColor(sanction.sanction_type)}`}>
                      {sanction.sanction_type}
                    </td>
                    <td className="text-center p-2">{new Date(sanction.sanction_date).toLocaleDateString('id-ID')}</td>
                    <td className="p-2 max-w-[200px] truncate" title={sanction.violation_details}>
                      {sanction.violation_details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SanctionPerformance; 