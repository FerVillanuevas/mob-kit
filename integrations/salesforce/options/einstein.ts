import { queryOptions } from "@tanstack/react-query";
import { getProductRecs } from "~/integrations/salesforce/server/einstein";
import { EinsteinResponse } from "~/integrations/salesforce/types/api";

export default function getProductRecsQueryOptions(params: {
  recId: string;
  products?: { id: string }[];
}) {
  return queryOptions<EinsteinResponse>({
    queryKey: ["recs", { ...params }],
    queryFn: async () => getProductRecs({ data: params }),
  });
}
