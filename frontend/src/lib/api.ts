import { API_BASE_URL, ChartData, MOCK_CHART_DATA, MOCK_TRANSITS, TransitData } from "./constants";

/* ── Chart API ────────────────────────────────────────── */

export interface ChartRequest {
  name: string;
  dob: string;
  tob: string | null;
  place: string;
}

export async function fetchChart(data: ChartRequest): Promise<ChartData> {
  const res = await fetch(`${API_BASE_URL}/api/chart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch chart: ${res.statusText}`);
  }
  
  const result = await res.json();
  const chartData = result.chart_data;
  
  const planets: import("./constants").PlanetPlacement[] = [];
  const planetNames = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto", "north node", "chiron"];
  
  for (const p of planetNames) {
    if (chartData[p]) {
      planets.push({
        name: p.charAt(0).toUpperCase() + p.slice(1),
        sign: chartData[p].sign,
        degree: chartData[p].degree,
        house: chartData[p].house || 0,
      });
    }
  }
  
  const houses = (chartData.houses || []).map((h: any) => ({
    house: h.number,
    sign: h.sign,
    degree: h.degree,
  }));

  return {
    chart_id: result.chart_id,
    sun_sign: chartData.sun?.sign || "Aries",
    moon_sign: chartData.moon?.sign || "Aries",
    rising_sign: chartData.rising?.sign || "Aries",
    planets,
    houses,
  };
}

/* ── Transits API ─────────────────────────────────────── */

export async function fetchTransits(chartId: string, date: string): Promise<TransitData[]> {
  const res = await fetch(`${API_BASE_URL}/api/transits?chart_id=${chartId}&date=${date}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch transits: ${res.statusText}`);
  }
  const data = await res.json();
  return data.transits || [];
}

/* ── Chat SSE Stream ──────────────────────────────────── */

export interface ChatSSEEvent {
  type: "text" | "tool_call" | "tool_result" | "done";
  content: string;
}

/**
 * Mock SSE stream that simulates the backend's response pattern.
 * Yields events one at a time for realistic streaming UX.
 */
export async function* streamChat(
  message: string,
  chartId: string | null,
  conversationId: string
): AsyncGenerator<ChatSSEEvent> {
  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      chart_id: chartId,
      conversation_id: conversationId,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to stream chat: ${res.statusText}`);
  }

  if (res.body) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "text") {
              yield { type: "text", content: event.content };
            } else if (event.type === "tool_call") {
              if (event.status === "running") {
                yield { type: "tool_call", content: event.tool };
              } else if (event.status === "done") {
                yield { type: "tool_result", content: event.node };
              }
            } else if (event.type === "done") {
              yield { type: "done", content: "" };
              return;
            } else if (event.type === "error") {
              throw new Error(event.content);
            }
          } catch {
            // Skip malformed events
          }
        }
      }
    }
  }
}
