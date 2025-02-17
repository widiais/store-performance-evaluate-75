
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store } from "./types";
import { OperationalKPI } from "./OperationalKPI";
import { FinancialKPI } from "./FinancialKPI";
import { ComplaintKPI } from "./ComplaintKPI";
import { SanctionKPI } from "./SanctionKPI";
import { AuditKPI } from "./AuditKPI";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface StorePerformanceProps {
  selectedStores: Store[];
  selectedMonth: number;
  selectedYear: number;
}

export const StorePerformance = ({
  selectedStores,
  selectedMonth,
  selectedYear,
}: StorePerformanceProps) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to realtime updates for all relevant tables
    const selectedStoreNames = selectedStores.map(store => store.name);
    
    const channel = supabase
      .channel('store-performance-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public',
          table: 'financial_records_report',
          filter: `store_name=in.(${selectedStoreNames.map(name => `'${name}'`).join(',')})`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['financialData'] });
        }
      )
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public',
          table: 'complaint_records_report',
          filter: `store_name=in.(${selectedStoreNames.map(name => `'${name}'`).join(',')})`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['complaintData'] });
        }
      )
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public',
          table: 'employee_sanctions_kpi',
          filter: `store_name=in.(${selectedStoreNames.map(name => `'${name}'`).join(',')})`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['sanctionData'] });
        }
      )
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public',
          table: 'esp_evaluation_report',
          filter: `store_name=in.(${selectedStoreNames.map(name => `'${name}'`).join(',')})`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['auditData'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedStores, queryClient]);

  return (
    <Card className="p-4">
      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="complaint">Complaint</TabsTrigger>
          <TabsTrigger value="sanction">Sanction</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
        </TabsList>
        <TabsContent value="financial">
          <FinancialKPI
            selectedStores={selectedStores}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </TabsContent>
        <TabsContent value="complaint">
          <ComplaintKPI
            selectedStores={selectedStores}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </TabsContent>
        <TabsContent value="sanction">
          <SanctionKPI
            selectedStores={selectedStores}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </TabsContent>
        <TabsContent value="audit">
          <AuditKPI
            selectedStores={selectedStores}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </TabsContent>
        <TabsContent value="operational">
          <OperationalKPI
            selectedStores={selectedStores}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
};
