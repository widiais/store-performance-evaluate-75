
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store } from "./types";
import { OperationalKPI } from "./OperationalKPI";
import { FinancialKPI } from "./FinancialKPI";
import { ComplaintKPI } from "./ComplaintKPI";
import { SanctionKPI } from "./SanctionKPI";

interface StorePerformanceProps {
  selectedStores: Store[];
  selectedMonth: number; // Changed from string to number
  selectedYear: number; // Changed from string to number
}

export const StorePerformance = ({
  selectedStores,
  selectedMonth,
  selectedYear,
}: StorePerformanceProps) => {
  return (
    <Card className="p-4">
      <Tabs defaultValue="operational" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="operational">Operational</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="complaint">Complaint</TabsTrigger>
          <TabsTrigger value="sanction">Sanction Performance</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
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
          <div className="p-4 text-center text-gray-500">
            Audit content will be added soon
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
