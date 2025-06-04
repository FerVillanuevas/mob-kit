import { getSalesforceAPI } from "~/integrations/salesforce/server/config";
import { SearchSuggestionsParams } from "~/integrations/salesforce/types/params";

export const getSearchSuggestions = async ({
  data,
}: {
  data: SearchSuggestionsParams;
}) => {
  const { api } = await getSalesforceAPI();
  const shopperSearch = await api.shopperSearch();
  return await shopperSearch.getSearchSuggestions({
    parameters: data,
  });
};
