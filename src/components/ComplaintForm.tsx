
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { FileSpreadsheet, Upload } from 'lucide-react';
import { format } from 'date-fns';

interface Store {
  id: number;
  name: string;
  city: string;
  regional: number;
  area: number;
}

interface ComplaintWeight {
  channel: string;
  weight: number;
}

interface ComplaintRecord {
  store_name: string;
  regional: number;
  area: number;
  whatsapp_count: number;
  social_media_count: number;
  gmaps_count: number;
  online_order_count: number;
}

const ComplaintForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pic, setPic] = useState('');
  const [inputDate, setInputDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: stores } = useQuery<Store[]>({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('id, name, city, regional, area')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: weights } = useQuery<ComplaintWeight[]>({
    queryKey: ['complaint-weights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complaint_weights')
        .select('channel, weight');
      
      if (error) throw error;
      return data || [];
    },
  });

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
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, 'complaint_data_template.xlsx');
  };

  const calculateTotalComplaints = (record: ComplaintRecord, weights: ComplaintWeight[]) => {
    const weightMap = Object.fromEntries(weights.map(w => [w.channel, w.weight]));
    
    return (
      record.whatsapp_count * (weightMap.whatsapp || 1) +
      record.social_media_count * (weightMap.social_media || 1.5) +
      record.gmaps_count * (weightMap.gmaps || 2) +
      record.online_order_count * (weightMap.online_order || 2)
    );
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
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as ComplaintRecord[];

        // Validate data
        const isValid = jsonData.every((row) => {
          return (
            row.store_name &&
            !isNaN(Number(row.whatsapp_count)) &&
            !isNaN(Number(row.social_media_count)) &&
            !isNaN(Number(row.gmaps_count)) &&
            !isNaN(Number(row.online_order_count))
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

        // Process and upload records
        const records = jsonData.map(row => {
          const store = stores.find(s => s.name === row.store_name);
          if (!store) throw new Error(`Store not found: ${row.store_name}`);

          const total_weighted_complaints = calculateTotalComplaints(row, weights);

          return {
            store_id: store.id,
            input_date: inputDate,
            whatsapp_count: Number(row.whatsapp_count),
            social_media_count: Number(row.social_media_count),
            gmaps_count: Number(row.gmaps_count),
            online_order_count: Number(row.online_order_count),
            total_weighted_complaints,
          };
        });

        const { error } = await supabase
          .from('complaint_records')
          .insert(records);

        if (error) throw error;

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
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">
          Upload Complaint Data
        </h2>

        <div className="glass-card p-6 bg-white rounded-lg border border-gray-200 shadow-sm space-y-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="date" className="text-gray-700 mb-1.5 block">
                Input Date
              </Label>
              <Input
                id="date"
                type="date"
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                className="bg-white border-gray-200 text-gray-900"
                required
              />
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

export default ComplaintForm;
