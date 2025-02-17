import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { FileSpreadsheet } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Store {
  id: number;
  name: string;
  city: string;
  cogs_target: number;
}

const getCurrentYearMonth = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: (now.getMonth() + 1).toString().padStart(2, '0')
  };
};

const FinanceDataForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pic, setPic] = useState('');
  const { year: currentYear, month: currentMonth } = getCurrentYearMonth();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const { data: stores } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('id, name, city, cogs_target')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const downloadTemplate = () => {
    if (!stores) return;

    const worksheet = XLSX.utils.json_to_sheet(stores.map(store => ({
      store_name: store.name,
      store_city: store.city,
      cogs_target: store.cogs_target,
      cogs_achieved: '',
      total_sales: '',
      total_opex: '',
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, 'finance_data_template.xlsx');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !stores) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const isValid = jsonData.every((row: any) => {
          return (
            row.store_name &&
            !isNaN(Number(row.cogs_achieved)) &&
            !isNaN(Number(row.total_sales)) &&
            !isNaN(Number(row.total_opex))
          );
        });

        if (!isValid) {
          toast({
            title: "Invalid Data",
            description: "Please make sure all required fields are filled correctly.",
            variant: "destructive",
          });
          return;
        }

        const inputDate = `${selectedYear}-${selectedMonth}-01`;

        for (const row of jsonData) {
          const store = stores.find(s => s.name === row.store_name);
          if (!store) continue;

          const { data: existingRecords } = await supabase
            .from('financial_records')
            .select('id')
            .eq('store_id', store.id)
            .eq('input_date', inputDate);

          if (existingRecords && existingRecords.length > 0) {
            const { error: deleteError } = await supabase
              .from('financial_records')
              .delete()
              .eq('store_id', store.id)
              .eq('input_date', inputDate);

            if (deleteError) throw deleteError;
          }

          const { error: insertError } = await supabase
            .from('financial_records')
            .insert({
              store_id: store.id,
              input_date: inputDate,
              pic,
              cogs_achieved: Number(row.cogs_achieved),
              total_sales: Number(row.total_sales),
              total_opex: Number(row.total_opex),
            });

          if (insertError) throw insertError;
        }

        toast({
          title: "Success",
          description: "Financial data has been uploaded successfully.",
        });

        navigate('/finance-report');
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload financial data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear - i);

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    const monthName = new Date(2024, i, 1).toLocaleString('default', { month: 'long' });
    return { value: month, label: monthName };
  });

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">
          Upload Financial Data
        </h2>

        <div className="glass-card p-6 bg-white rounded-lg border border-gray-200 shadow-sm space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="year" className="text-gray-700 mb-1.5 block">
                Year
              </Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="month" className="text-gray-700 mb-1.5 block">
                Month
              </Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pic" className="text-gray-700 mb-1.5 block">
                PIC (Person In Charge)
              </Label>
              <Input
                id="pic"
                value={pic}
                onChange={(e) => setPic(e.target.value)}
                placeholder="Enter PIC name"
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <Button
              onClick={downloadTemplate}
              variant="outline"
              className="w-full sm:w-auto border-gray-200 hover:bg-gray-100"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Download Template
            </Button>

            <div>
              <Label htmlFor="file" className="text-gray-700 mb-1.5 block">
                Upload Excel File
              </Label>
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="bg-white border-gray-200 text-gray-900"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDataForm;
