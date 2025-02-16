
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Store, EspRecord, SanctionKPI } from './store-performance/types';
import { StoreSelect } from './store-performance/StoreSelect';
import { StorePerformance as StorePerformanceComponent } from './store-performance';

const StorePerformance = () => {
  const [selectedStores, setSelectedStores] = useState<Store[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  return (
    <div className="p-6">
      <div className="space-y-4">
        <Card className="p-6">
          <StoreSelect
            selectedStores={selectedStores}
            onStoreSelect={(store) => {
              setSelectedStores(prev => {
                const isSelected = prev.some(s => s.id === store.id);
                if (isSelected) {
                  return prev.filter(s => s.id !== store.id);
                } else {
                  if (prev.length >= 10) {
                    alert('Maximum 10 stores can be selected');
                    return prev;
                  }
                  return [...prev, store];
                }
              });
            }}
            onRemoveStore={(storeId) => {
              setSelectedStores(prev => prev.filter(s => s.id !== storeId));
            }}
          />
        </Card>

        <StorePerformanceComponent
          selectedStores={selectedStores}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      </div>
    </div>
  );
};

export default StorePerformance;
