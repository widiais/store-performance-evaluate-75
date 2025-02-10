
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, Save, X, Ban } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Store {
  id: number;
  name: string;
  city: string;
}

interface Question {
  id: number;
  question: string;
  points: number;
}

interface QuestionState extends Question {
  status: 'none' | 'cross' | 'exclude';
}

interface StoreSelectProps {
  selectedStore: Store | null;
  onStoreSelect: (store: Store | null) => void;
  stores: Store[];
}

const StoreSelect = ({ selectedStore, onStoreSelect, stores }: StoreSelectProps) => {
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (selectedStore) {
      setSearchValue(`${selectedStore.name} - ${selectedStore.city}`);
    } else {
      setSearchValue("");
    }
  }, [selectedStore]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    if (!value.trim()) {
      onStoreSelect(null);
      return;
    }

    const storeMatch = stores.find(
      store => `${store.name} - ${store.city}` === value
    );

    if (storeMatch) {
      onStoreSelect(storeMatch);
    }
  };

  return (
    <div className="relative w-full">
      <Input
        type="text"
        list="store-list"
        value={searchValue}
        onChange={handleInputChange}
        placeholder="Select or type store name..."
        className="w-full bg-dashboard-dark/50 border-dashboard-text/20"
      />
      <datalist id="store-list">
        {stores.map((store) => (
          <option key={store.id} value={`${store.name} - ${store.city}`} />
        ))}
      </datalist>
    </div>
  );
};

const ProductQualityForm = () => {
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [pic, setPic] = useState<string>("");
  const [questions, setQuestions] = useState<QuestionState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: stores = [], isLoading: isLoadingStores } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('id, name, city')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: fetchedQuestions = [] } = useQuery({
    queryKey: ['product-quality-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_quality_questions')
        .select('id, question, points')
        .order('id');
      
      if (error) throw error;
      return (data || []).map(q => ({ ...q, status: 'none' as const }));
    },
  });

  useEffect(() => {
    if (fetchedQuestions.length > 0) {
      setQuestions(fetchedQuestions);
    }
  }, [fetchedQuestions]);

  const handleQuestionStatusChange = (questionId: number, status: 'none' | 'cross' | 'exclude') => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return { ...q, status: q.status === status ? 'none' : status };
      }
      return q;
    }));
  };

  const calculateScores = () => {
    const initialTotal = questions.reduce((sum, q) => sum + q.points, 0);
    const excludedPoints = questions
      .filter(q => q.status === 'exclude')
      .reduce((sum, q) => sum + q.points, 0);
    const crossedPoints = questions
      .filter(q => q.status === 'cross')
      .reduce((sum, q) => sum + q.points, 0);
    
    const adjustedTotal = initialTotal - excludedPoints;
    const earnedPoints = adjustedTotal - crossedPoints;
    const percentage = (earnedPoints /