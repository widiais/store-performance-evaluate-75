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
      <Tabs defaultValue="operational" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="operational">Operational</TabsTrigger>
          <TabsTrigger value="financial">Finance</TabsTrigger>
          <TabsTrigger value="complaint">Complaint</TabsTrigger>
          <TabsTrigger value="sanction">Sanction</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>
        <TabsContent value="operational">
          <OperationalKPI
            selectedStores={selectedStores}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </TabsContent>
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
        <TabsContent value="overview">
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
            <div className="max-w-[800px] w-full text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                Disini saya juga masih bingung mau nampilin apa
              </h2>
            </div>
            <div className="w-full max-w-[800px]">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 997.86122 450.8081" 
                role="img" 
                className="w-full h-auto"
              >
                <rect x="871.99152" y="181.55804" width="30.15944" height="104.39806" fill="#f2f2f2"/>
                <polygon points="922.068 266.317 848.715 179.052 701.475 180.398 612.156 267.396 613.961 268.556 613.316 268.556 613.316 449.513 921.871 449.513 921.871 268.556 922.068 266.317" fill="#f2f2f2"/>
                <polygon points="848.792 179.238 757.154 286.674 757.154 449.513 921.871 449.513 921.871 266.236 848.792 179.238" fill="#e6e6e6"/>
              </svg>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
