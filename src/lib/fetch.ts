export async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    
    // Add null check for the response
    if (data === null || data === undefined) {
      throw new Error(`API returned null/undefined for ${url}`);
    }
    
    return data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`fetchApi error for ${url}: ${error.message}`);
    }
    throw new Error(`fetchApi error for ${url}: ${String(error)}`);
  }
}
