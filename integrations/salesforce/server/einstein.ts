const config = {
  siteId: process.env.EXPO_PUBLIC_EINSTEIN_SITE,
  host: process.env.EXPO_PUBLIC_EINSTEIN_HOST,
  id: process.env.EXPO_PUBLIC_EINSTEIN_ID,
}

export const getProductRecs = async ({
  data,
}: {
  data: {
    recId: string
    products?: { id: string }[]
  }
}) => {
  // Validate required environment variables
  if (!config.host || !config.id || !config.siteId) {
    throw new Error("Missing required Einstein API configuration. Please check your environment variables.")
  }

  try {
    const response = await fetch(`${config.host}/v3/personalization/recs/${config.siteId}/${data.recId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cq-client-id": config.id,
      },
      body: JSON.stringify({
        products: data.products,
      }),
    })

    if (!response.ok) {
      throw new Error(`Einstein API request failed: ${response.status} ${response.statusText}`)
    }

    const responseData = await response.json()
    return responseData
  } catch (error) {
    console.error("Einstein API Error:", error)
    throw error
  }
}
