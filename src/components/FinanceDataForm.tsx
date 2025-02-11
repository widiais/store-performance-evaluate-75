
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

const FinanceDataForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pic, setPic] = useState('');
  const [inputDate, setInputDate] = useState('');

  // Fetch stores for template
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

  const handleDownloadTemplate = () => {
    if (!stores) return;

    const workbook = XLSX.utils.book_new();
    
    const templateData = stores.map(store => ({
      'ID Toko': store.id,
      'Nama Toko': store.name,
      'Target COGS': store.cogs_target || 0,
      'COGS Tercapai': '',
      'Total Sales': '',
      'Total Opex': '',
    }));
    
    const ws = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(workbook, ws, "Template");
    
    // Lock ID Toko, Nama Toko, and Target COGS columns using correct ProtectInfo properties
    ws['!protect'] = {
      password: '',
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertColumns: false,
      insertRows: false,
      insertHyperlinks: false,
      deleteColumns: false,
      deleteRows: false,
      selectLockedCells: true,
      selectUnlockedCells: true,
      sort: false,
      autoFilter: false,
      pivotTables: false,
      objects: false,
      scenarios: false
    };

    // Set column protection
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:F100');
    ws['!cols'] = Array(range.e.c + 1).fill({ hidden: false });
    
    // Lock specific columns
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      ['A', 'B', 'C'].forEach(C => {
        const cell = ws[C + (R + 1)];
        if (cell) cell.l = { hidden: false, locked: true };
      });
    }
    
    XLSX.writeFile(workbook, `Finance_Data_Template_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validate and transform data
        const records = jsonData.map((row: any) => ({
          store_id: row['ID Toko'],
          input_date: inputDate,
          pic: pic,
          cogs_achieved: parseFloat(row['COGS Tercapai']),
          total_sales: parseFloat(row['Total Sales']),
          total_opex: parseFloat(row['Total Opex']),
        }));

        // Insert data
        const { error } = await supabase
          .from('financial_records')
          .insert(records);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Financial data has been uploaded successfully.",
        });

        navigate('/finance-report');
      };
      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-purple-900/10 to-pink-900/10">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Finance Data Form
        </h2>

        <div className="glass-card p-6 bg-dashboard-dark/30 rounded-lg border border-dashboard-text/10 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pic">PIC Name</Label>
            <Input
              id="pic"
              value={pic}
              onChange={(e) => setPic(e.target.value)}
              placeholder="Enter PIC name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inputDate">Input Date</Label>
            <Input
              id="inputDate"
              type="date"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-4">
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Download Template
            </Button>

            <div className="relative">
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={!pic || !inputDate}
              />
              <Button
                variant="default"
                className="w-full flex items-center gap-2"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={!pic || !inputDate}
              >
                <Upload className="w-4 h-4" />
                Upload Financial Data
              </Button>
              {(!pic || !inputDate) && (
                <p className="text-sm text-red-500 mt-2">
                  Please fill in PIC name and input date before uploading
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDataForm;
