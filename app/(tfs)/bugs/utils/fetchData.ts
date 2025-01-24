// utils/fetchData.ts
export async function fetchData(url: string) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch data: ${response.statusText}`);
      }
      return response.json();
    } catch (error:any) {
      throw new Error(error.message || "An unknown error occurred.");
    }
  }
  