
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileSpreadsheet } from 'lucide-react';
import { Store, ComplaintWeight } from '@/types/complaint';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ComplaintExcelRow } from '@/types/excel';
import { calculateTotalComplaints } from '@/utils/complaintCalculations';
import { useNavigate } from 'react-router-dom';

interface FileUploadSectionProps {
  stores: Store[];
  weights: ComplaintWeight[];
  selectedYear: string;
  selectedMonth: string;
}

export const FileUploadSection = ({ 
  stores, 
  weights, 
  selectedYear, 
  selectedMonth 
}: FileUploadSectionProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const downloadTemplate = () => {
    if (!stores) return;

    const worksheet = XLSX.utils.json_to_sheet(stores.map(store => ({
      store_name: store.name,
      regional: store.regional,
      area: store.area,
      whatsapp_count: '',
      social_media_count: '',
      gmaps_count: '',
      online_order_count: '',
      late_handling_count: ''
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, 'complaint_data_template.xlsx');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !stores || !weights) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as ComplaintExcelRow[];

        // Validate data
        const isValid = jsonData.every((row) => {
          return (
            row.store_name &&
            !isNaN(Number(row.whatsapp_count)) &&
            !isNaN(Number(row.social_media_count)) &&
            !isNaN(Number(row.gmaps_count)) &&
            !isNaN(Number(row.online_order_count)) &&
            !isNaN(Number(row.late_handling_count))
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

        // Process each store's data
        for (const row of jsonData) {
          const store = stores.find(s => s.name === row.store_name);
          if (!store) continue;

          // Check for existing record
          const { data: existingRecords } = await supabase
            .from('complaint_records')
            .select('id')
            .eq('store_id', store.id)
            .eq('input_date', inputDate);

          // Delete existing record if found
          if (existingRecords && existingRecords.length > 0) {
            const { error: deleteError } = await supabase
              .from('complaint_records')
              .delete()
              .eq('store_id', store.id)
              .eq('input_date', inputDate);

            if (deleteError) throw deleteError;
          }

          // Calculate total weighted complaints
          const total_weighted_complaints = calculateTotalComplaints(row, weights);

          // Insert new record
          const { error: insertError } = await supabase
            .from('complaint_records')
            .insert({
              store_id: store.id,
              input_date: inputDate,
              whatsapp_count: Number(row.whatsapp_count),
              social_media_count: Number(row.social_media_count),
              gmaps_count: Number(row.gmaps_count),
              online_order_count: Number(row.online_order_count),
              late_handling_count: Number(row.late_handling_count),
              total_weighted_complaints,
            });

          if (insertError) throw insertError;
        }

        toast({
          title: "Success",
          description: "Complaint data has been uploaded successfully.",
        });

        navigate('/complaint-report');
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload complaint data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
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
  );
};
