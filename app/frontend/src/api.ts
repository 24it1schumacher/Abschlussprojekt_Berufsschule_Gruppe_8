export interface Message {
  id: number;
  text: string;
  createdAt: string;
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Anfrage fehlgeschlagen (HTTP ${response.status}).`);
  }

  return response.json() as Promise<T>;
}

export function checkHealth(): Promise<{ status: string }> {
  return request("/api/health");
}

export function getMessages(): Promise<Message[]> {
  return request("/api/messages");
}

export function createMessage(text: string): Promise<Message> {
  return request("/api/messages", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}
