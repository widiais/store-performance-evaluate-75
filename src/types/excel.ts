
export interface ComplaintExcelRow {
  store_name: string;
  whatsapp_count: number;
  social_media_count: number;
  gmaps_count: number;
  online_order_count: number;
  late_handling_count: number;
}

export interface FinanceExcelRow {
  store_name: string;
  cogs_achieved: number;
  total_sales: number;
  total_opex: number;
}
