import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store } from "../store-performance/types";
import { ActiveSanction } from "../store-performance/types";
import { mapToActiveSanctions } from "@/utils/typeUtils";

interface SanctionPerformanceProps {
  selectedStores: Store[];
  selectedMonth: number;
  selectedYear: number;
}

export const SanctionPerformance = ({
  selectedStores,
  selectedMonth,
  selectedYear,
}: SanctionPerformanceProps) => {
  const [selectedStore, setSelectedStore] = useState<Store | null>(
    selectedStores.length > 0 ? selectedStores[0] : null
  );

  const { data, isLoading } = useQuery<ActiveSanction[]>({
    queryKey: ["sanctions", selectedStore?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_sanctions_report")
        .select("*")
        .eq("store_id", selectedStore?.id);

      if (error) throw error;
      return mapToActiveSanctions(data || []);
    },
    enabled: !!selectedStore,
  });

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Employee Sanctions</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="store" className="space-y-4">
          <TabsList>
            <TabsTrigger value="store">By Store</TabsTrigger>
            <TabsTrigger value="type">By Type</TabsTrigger>
          </TabsList>
          <TabsContent value="store" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedStores.map((store) => (
                <Card
                  key={store.id}
                  className={`cursor-pointer ${
                    selectedStore?.id === store.id
                      ? "border-primary"
                      : "border-border"
                  }`}
                  onClick={() => setSelectedStore(store)}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">
                      {store.name} - {store.city}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {selectedStore && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Active Sanctions for {selectedStore.name}
                </h3>
                {isLoading ? (
                  <div>Loading...</div>
                ) : data && data.length > 0 ? (
                  <div className="space-y-2">
                    {data.map((sanction) => (
                      <Card key={sanction.id} className="p-4">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium">{sanction.employee_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {sanction.sanction_type} - {sanction.sanction_date}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs ${
                                sanction.sanction_type === "SP2"
                                  ? "bg-red-100 text-red-800"
                                  : sanction.sanction_type === "SP1"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {sanction.sanction_type}
                            </span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm">{sanction.violation_details}</p>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 bg-muted rounded-md">
                    No active sanctions found for this store
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          <TabsContent value="type">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Peringatan Tertulis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {data?.filter(s => s.sanction_type === "Peringatan Tertulis").length || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">SP1</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {data?.filter(s => s.sanction_type === "SP1").length || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">SP2</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {data?.filter(s => s.sanction_type === "SP2").length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
