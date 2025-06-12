import type { SalesforceAPI } from "~/integrations/salesforce/api"
import type { SalesforceCommerceClient } from "~/integrations/salesforce/client"
import { getSalesforceAPI } from "~/integrations/salesforce/server/config"

/**
 * Error response from Salesforce Commerce API
 */
interface CommerceAPIError {
  title?: string
  type?: string
  detail?: string
  path?: string
  document?: string
  [key: string]: any
}

/**
 * Custom error class for Commerce API errors
 */
export class CommerceAPIException extends Error {
  status: number
  data: CommerceAPIError

  constructor(message: string, status = 400, data: CommerceAPIError = {}) {
    super(message)
    this.name = "CommerceAPIException"
    this.status = status
    this.data = data
  }
}

/**
 * Creates a commerce function with direct access to API and client
 *
 * @param handler - Function that receives properly typed API, client, and data to execute business logic
 * @returns A function that can be called with data parameters
 */
export function createCommerceFunction<T, R>(
  handler: (api: SalesforceAPI, client: SalesforceCommerceClient, data: T) => Promise<R>,
) {
  return async ({ data }: { data: T }): Promise<R> => {
    try {
      const { api, client } = await getSalesforceAPI()

      // Execute the handler with the properly typed API and client
      const result = await handler(api, client, data)

      // Validate the response for error patterns even if status code is 200
      if (result && typeof result === "object" && "detail" in result && "title" in result) {
        const errorData = result as unknown as CommerceAPIError
        throw new CommerceAPIException(errorData.detail || "An error occurred with the Commerce API", 400, errorData)
      }

      return result
    } catch (error: any) {
      // Handle errors from the API or from our validation
      if (error instanceof CommerceAPIException) {
        throw error
      }

      console.error("Commerce API Error:", error)

      // Check if error is from Salesforce API
      if (error.response?.data) {
        throw new CommerceAPIException(
          error.response.data.detail || "Commerce API Error",
          error.response.status || 500,
          error.response.data,
        )
      }

      // Generic error
      throw new CommerceAPIException(error.message || "An unexpected error occurred", 500)
    }
  }
}
