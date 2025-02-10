
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ServiceReport = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: reports, isLoading } = useQuery({
    queryKey: ['serviceReports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_evaluation_report')
        .select('*')
        .order('evaluation_date', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Report List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store Name</TableHead>
                <TableHead>Store City</TableHead>
                <TableHead>PIC</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports?.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.store_name}</TableCell>
                  <TableCell>{report.store_city}</TableCell>
                  <TableCell>{report.pic}</TableCell>
                  <TableCell>{new Date(report.evaluation_date).toLocaleDateString()}</TableCell>
                  <TableCell>{report.total_score}%</TableCell>
                  <TableCell>
                    <Badge variant={report.status === 'completed' ? 'success' : 'warning'}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" onClick={() => navigate(`/service-report/${report.id}`)}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceReport;
