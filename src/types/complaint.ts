
export interface Store {
  id: number;
  name: string;
  city: string;
  regional: number;
  area: number;
}

export interface ComplaintWeight {
  channel: string;
  weight: number;
}

export interface MonthYear {
  year: string;
  month: string;
}
