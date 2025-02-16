
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Store } from './store-performance/types';
import { StoreSelect } from './store-performance/StoreSelect';
import { StorePerformance as StorePerformanceComponent } from './store-performance';
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "./ui/button";
import * as XLSX from 'xlsx';

const StorePerformance = () => {
  const [selectedStores, setSelectedStores] = useState<Store[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  const exportToExcel = () => {
    // This is a placeholder function - you'll need to pass the actual data
    const data = [
      ["Store", "KPI Score", "Month", "Year"],
      // Add your actual data here
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Store Performance");
    
    XLSX.writeFile(wb, `store-performance-${selectedMonth}-${selectedYear}.xlsx`);
  };

  return (
    <div className="p-6">
      <div className="space-y-4">
        <Card className="p-6">
          <div className="flex flex-col gap-4">
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

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handlePrevMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{months[selectedMonth - 1]}</span>
                  <span className="font-medium">{selectedYear}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleNextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Button 
                variant="outline" 
                onClick={exportToExcel}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export ke Excel
              </Button>
            </div>
          </div>
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
