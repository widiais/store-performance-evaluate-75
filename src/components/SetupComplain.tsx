
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Save } from "lucide-react";

interface ComplaintWeight {
  id: number;
  channel: string;
  weight: number;
}

const SetupComplain = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [weights, setWeights] = useState<ComplaintWeight[]>([]);

  const { data: complaintWeights, isLoading } = useQuery({
    queryKey: ['complaint-weights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complaint_weights')
        .select('*')
        .order('id');
      
      if (error) throw error;
      setWeights(data);
      return data;
    },
  });

  const handleWeightChange = (id: number, newWeight: string) => {
    setWeights(prev => prev.map(weight => 
      weight.id === id ? { ...weight, weight: parseFloat(newWeight) || 0 } : weight
    ));
  };

  const handleSave = async () => {
    try {
      for (const weight of weights) {
        const { error } = await supabase
          .from('complaint_weights')
          .update({ weight: weight.weight })
          .eq('id', weight.id);
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Complaint weights have been updated.",
      });

      queryClient.invalidateQueries({ queryKey: ['complaint-weights'] });
    } catch (error) {
      console.error('Error updating weights:', error);
      toast({
        title: "Error",
        description: "Failed to update complaint weights.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const channelLabels: Record<string, string> = {
    whatsapp: 'WhatsApp',
    social_media: 'Social Media',
    gmaps: 'Google Maps',
    online_order: 'Online Order',
    late_handling: 'Late Handling'
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Complaint Weights Setup</h2>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Channel</TableHead>
              <TableHead>Weight</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weights.map((weight) => (
              <TableRow key={weight.id}>
                <TableCell className="font-medium">
                  {channelLabels[weight.channel]}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={weight.weight}
                    onChange={(e) => handleWeightChange(weight.id, e.target.value)}
                    min="0"
                    step="0.1"
                    className="w-32"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SetupComplain;
