let isRedirecting = false;

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init);
  
  if (response.status === 401) {
    if (!isRedirecting) {
      isRedirecting = true;
      console.warn("API returned 401. Reloading window...");
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }
  }
  
  return response;
}
