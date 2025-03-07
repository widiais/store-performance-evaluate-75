import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { EmployeeSanctionRecord } from '@/integrations/supabase/client-types';
import { mapToEmployeeSanctionRecords } from "@/utils/typeUtils";

const WorkplaceReportDetail = () => {
  const { storeId } = useParams<{ storeId: string }>();

  const { data: sanctions, isLoading } = useQuery<EmployeeSanctionRecord[]>({
    queryKey: ["workplace-sanctions", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_sanctions")
        .select("*")
        .eq("store_id", storeId);

      if (error) throw error;
      return mapToEmployeeSanctionRecords(data || []);
    },
  });

  if (isLoading) {
    return <div>Loading sanctions...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Workplace Sanction Details</h1>
      {storeId && <h2 className="text-xl mb-4">Store ID: {storeId}</h2>}

      <Table>
        <TableCaption>List of employee sanctions</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Employee Name</TableHead>
            <TableHead>Sanction Type</TableHead>
            <TableHead>Sanction Date</TableHead>
            <TableHead>Violation Details</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sanctions?.map((sanction) => (
            <TableRow key={sanction.id}>
              <TableCell>{sanction.employee_name}</TableCell>
              <TableCell>{sanction.sanction_type}</TableCell>
              <TableCell>{format(new Date(sanction.sanction_date), 'yyyy-MM-dd')}</TableCell>
              <TableCell>{sanction.violation_details}</TableCell>
              <TableCell>
                {sanction.is_active ? (
                  <Badge variant="outline">Active</Badge>
                ) : (
                  <Badge>Inactive</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WorkplaceReportDetail;
