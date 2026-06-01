import { useState, useCallback } from "react";
import { fetchChart, ChartRequest } from "@/lib/api";
import { useUserStore } from "@/store/useUserStore";
import type { ChartData } from "@/lib/constants";

export function useChartData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { chartData, setChartData, setBirthDetails } = useUserStore();

  const calculateChart = useCallback(
    async (request: ChartRequest): Promise<ChartData | null> => {
      setLoading(true);
      setError(null);

      try {
        setBirthDetails({
          name: request.name,
          dob: request.dob,
          tob: request.tob,
          place: request.place,
        });

        const data = await fetchChart(request);
        setChartData(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to calculate chart"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setBirthDetails, setChartData]
  );

  return { chartData, loading, error, calculateChart };
}
