import { queryOptions } from "@tanstack/react-query";
import { getPage } from "~/integrations/salesforce/server/experience";
import { GetPageParams } from "~/integrations/salesforce/types/params";

export const getPageQueryOptions = (params: GetPageParams) => {
  return queryOptions({
    queryKey: ["experince", { ...params }],
    queryFn: async () => getPage({ data: params }),
  });
};
