
import { useState } from 'react';
import { Store } from './types';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StoreSelectProps {
  selectedStores: Store[];
  onStoreSelect: (store: Store) => void;
  onRemoveStore: (storeId: number) => void;
}

export const StoreSelect = ({ selectedStores, onStoreSelect, onRemoveStore }: StoreSelectProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const { data: stores = [] } = useQuery<Store[]>({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('id, name, city')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  const filteredStores = stores.filter(store => 
    !selectedStores.some(s => s.id === store.id) &&
    (store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     store.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search store..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          className="pl-10"
        />
      </div>

      {selectedStores.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedStores.map((store) => (
            <div
              key={store.id}
              className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full"
            >
              <span className="text-sm">
                {store.name} - {store.city}
              </span>
              <button
                onClick={() => onRemoveStore(store.id)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showDropdown && searchTerm && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
          <ScrollArea className="h-[200px]">
            {filteredStores.length > 0 ? (
              filteredStores.map((store) => (
                <div
                  key={store.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    onStoreSelect(store);
                    setSearchTerm('');
                    setShowDropdown(false);
                  }}
                >
                  {store.name} - {store.city}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500">No stores found</div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
