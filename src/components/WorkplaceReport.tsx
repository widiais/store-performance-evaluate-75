
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const WorkplaceReport = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['workplace-stores'],
    queryFn: async () => {
      // First get the stores with sanctions
      const { data: sanctionedStores, error: storesError } = await supabase
        .from('employee_sanctions_kpi')
        .select('*, stores!inner(*)')
        .not('active_peringatan', 'eq', 0)
        .or('active_sp1.gt.0,active_sp2.gt.0');

      if (storesError) throw storesError;
      return sanctionedStores || [];
    },
  });

  const filteredStores = stores.filter(store => 
    store.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.store_city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-6">Workplace Evaluation Report</h2>
          <div className="flex justify-between items-center mb-4">
            <Input
              placeholder="Search stores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store Name</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Total Crew</TableHead>
                <TableHead>Total Sanction Score</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStores.map((store) => {
                const totalSanctionScore = 
                  (store.active_peringatan || 0) + 
                  ((store.active_sp1 || 0) * 2) + 
                  ((store.active_sp2 || 0) * 3);

                return (
                  <TableRow key={store.store_id}>
                    <TableCell className="font-medium">{store.store_name}</TableCell>
                    <TableCell>{store.stores?.area || '-'}</TableCell>
                    <TableCell>{store.stores?.regional || '-'}</TableCell>
                    <TableCell>{store.total_employees || 0}</TableCell>
                    <TableCell>{totalSanctionScore}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/workplace-report/${store.store_id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Detail
                      </Button>
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

export default WorkplaceReport;
