import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function ComplaintForm() {
  const [selectedStore, setSelectedStore] = useState("");
  const [complaintType, setComplaintType] = useState("");
  const [complaintChannel, setComplaintChannel] = useState("");
  const [description, setDescription] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [handlingStatus, setHandlingStatus] = useState("pending");

  const { data: stores } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("id, name, city")
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from("complaint_records")
        .insert([
          {
            store_name: selectedStore,
            complaint_type: complaintType,
            complaint_channel: complaintChannel,
            description,
            customer_name: customerName,
            customer_contact: customerContact,
            handling_status: handlingStatus,
            input_date: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

      // Reset form
      setSelectedStore("");
      setComplaintType("");
      setComplaintChannel("");
      setDescription("");
      setCustomerName("");
      setCustomerContact("");
      setHandlingStatus("pending");

      alert("Complaint berhasil disimpan!");
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat menyimpan complaint");
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Form Complaint</h1>
        
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Store Selection */}
            <div className="space-y-2">
              <Label htmlFor="store">Store</Label>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih store" />
                </SelectTrigger>
                <SelectContent>
                  {stores?.map((store) => (
                    <SelectItem key={store.id} value={store.name}>
                      {store.name} - {store.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Complaint Type */}
            <div className="space-y-2">
              <Label htmlFor="complaintType">Jenis Complaint</Label>
              <Select value={complaintType} onValueChange={setComplaintType}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis complaint" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="cleanliness">Cleanliness</SelectItem>
                  <SelectItem value="facility">Facility</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Complaint Channel */}
            <div className="space-y-2">
              <Label htmlFor="complaintChannel">Channel Complaint</Label>
              <Select value={complaintChannel} onValueChange={setComplaintChannel}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih channel complaint" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="gmaps">Google Maps</SelectItem>
                  <SelectItem value="online_order">Online Order</SelectItem>
                  <SelectItem value="direct">Direct</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi Complaint</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Masukkan deskripsi complaint"
                className="min-h-[100px]"
              />
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nama Customer</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Masukkan nama customer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerContact">Kontak Customer</Label>
                <Input
                  id="customerContact"
                  value={customerContact}
                  onChange={(e) => setCustomerContact(e.target.value)}
                  placeholder="Masukkan kontak customer"
                />
              </div>
            </div>

            {/* Handling Status */}
            <div className="space-y-2">
              <Label htmlFor="handlingStatus">Status Penanganan</Label>
              <Select value={handlingStatus} onValueChange={setHandlingStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status penanganan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full">
              Simpan Complaint
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
} 