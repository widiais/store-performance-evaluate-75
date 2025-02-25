
import { ComplaintWeight } from '@/types/complaint';

export const calculateTotalComplaints = (row: any, weights: ComplaintWeight[]) => {
  const getWeight = (channel: string) => {
    const weight = weights.find(w => w.channel.toLowerCase() === channel.toLowerCase());
    return weight ? weight.weight : 1;
  };

  return (
    row.whatsapp_count * getWeight('whatsapp') +
    row.social_media_count * getWeight('social_media') +
    row.gmaps_count * getWeight('gmaps') +
    row.online_order_count * getWeight('online_order') +
    row.late_handling_count * getWeight('late_handling')
  );
};
