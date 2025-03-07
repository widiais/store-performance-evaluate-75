
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Store } from "@/components/store-performance/types";
import { SanctionList } from "@/components/SanctionList";
import { mapToActiveSanctions } from "@/utils/typeUtils";

interface WorkplaceReportProps {
  selectedStores: Store[];
}

export function WorkplaceReport({ selectedStores }: WorkplaceReportProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const selectedMonth = date ? date.getMonth() + 1 : new Date().getMonth() + 1;
  const selectedYear = date ? date.getFullYear() : new Date().getFullYear();

  const firstDayOfMonth = date ? format(startOfMonth(date), 'yyyy-MM-dd') : format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const firstDayOfNextMonth = date ? format(endOfMonth(date), 'yyyy-MM-dd') : format(endOfMonth(new Date()), 'yyyy-MM-dd');

  const { data: sanctionsData = [] } = useQuery({
    queryKey: ["sanctions", selectedMonth, selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_sanctions")
        .select(`
          id,
          input_date,
          pic,
          peringatan_count,
          sp1_count,
          sp2_count,
          status,
          employee_name,
          sanction_type,
          duration_months,
          violation_details,
          submitted_by,
          is_active,
          stores:store_id (
            name,
            city
          )
        `)
        .gte("input_date", firstDayOfMonth)
        .lt("input_date", firstDayOfNextMonth);

      if (error) throw error;
      
      return mapToActiveSanctions(data || []);
    },
  });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Workplace Sanction Report</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Picker Card */}
        <Card>
          <CardHeader>
            <CardTitle>Select Month</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
            />
          </CardContent>
        </Card>

        {/* Sanction List Card */}
        <Card>
          <CardHeader>
            <CardTitle>Sanction Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedStores.map(store => (
              <div key={store.id} className="mb-4">
                <h2 className="text-lg font-semibold">{store.name} - {store.city}</h2>
                <SanctionList
                  sanctions={sanctionsData ? sanctionsData.filter(sanction => sanction.store_name === store.name) : []}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default WorkplaceReport;
