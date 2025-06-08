import { useQuery } from "@tanstack/react-query";
import { getCategoryQueryOptions } from "~/integrations/salesforce/options/products";

export default function useRootCategories() {
  return useQuery(
    getCategoryQueryOptions({
      id: "root",
      levels: 2,
    }),
  );
}
