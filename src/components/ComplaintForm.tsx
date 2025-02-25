
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentYearMonth } from '@/utils/dateUtils';
import { FileUploadSection } from './complaint/FileUploadSection';
import { DateSelectionSection } from './complaint/DateSelectionSection';
import type { Store, ComplaintWeight } from '@/types/complaint';

const ComplaintForm = () => {
  const { year: currentYear, month: currentMonth } = getCurrentYearMonth();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const { data: stores } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('id, name, city, regional, area')
        .order('name');
      
      if (error) throw error;
      return data as Store[];
    },
  });

  const { data: weights } = useQuery({
    queryKey: ['complaint-weights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complaint_weights')
        .select('channel, weight');
      
      if (error) throw error;
      return data as ComplaintWeight[];
    },
  });

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">
          Upload Complaint Data
        </h2>

        <div className="glass-card p-6 bg-white rounded-lg border border-gray-200 shadow-sm space-y-6">
          <DateSelectionSection
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
          />

          {stores && weights && (
            <FileUploadSection
              stores={stores}
              weights={weights}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm;
