import { useState, useEffect } from "react";
import { Sparkles, AlertTriangle, Bolt } from "lucide-react";
import { racks_parameters } from "../../constants/racks_parameters";

interface AnomalyInfo {
  status: "ANOMALY" | "NORMAL";
  message: string;
  confidence: number;
}
interface InsightData {
  rackId: string;
  status: string;
  confidence: number;
  message: string;
}

interface AIInsightProps {
  selectedRack: typeof racks_parameters[0];
  latestTelemetry: Record<string, { value: any; ts: number }>;
}

export const AIInsight = ({ selectedRack, latestTelemetry }: AIInsightProps) => {
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (Object.keys(latestTelemetry).length === 0) return;

    const fetchInsight = async () => {
      const metricsToMonitor = [
        "cpu_util", "power_kw", "ambient_temp_c", 
        "inlet_temp_c", "exhaust_temp_c", "fan_speed_rpm", "humidity"
      ];

      const metricsData: Record<string, number[]> = {};
      let hasAllMetrics = true;

      for (const key of metricsToMonitor) {
        const val = latestTelemetry[key]?.value;
        if (val === undefined) {
          hasAllMetrics = false;
          break;
        }
        const numVal = Number(val);
        metricsData[key] = Array(30).fill(isNaN(numVal) ? 0 : numVal);
      }

      if (!hasAllMetrics) return;

      setIsLoading(true);
      try {
        const res = await fetch('http://127.0.0.1:8000/api/ai/insight/short-term', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rackId: selectedRack.name.replace(/\s+/g, ''),
            metrics: metricsData
          })
        });
        if (res.ok) {
          const data = await res.json();
          setInsight(data);
        } else {
          console.error("Failed to fetch short-term insights");
        }
      } catch (e) {
        console.error("Error fetching short-term insights", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsight();
  }, [latestTelemetry, selectedRack]);

  const isAnomaly = insight?.status !== "NOMINAL" && !!insight;
  return (
    <div className="ai-insight animate-fade-in">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg ${isAnomaly ? "bg-destructive/20" : "bg-success/20"} flex items-center justify-center flex-shrink-0`}>
          {isAnomaly ? (
            <AlertTriangle className="w-4 h-4 text-destructive" />
          ) : isLoading ? (
            <Bolt className="w-4 h-4 text-muted-foreground animate-pulse" />
          ) : (
            <Sparkles className="w-4 h-4 text-success" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isAnomaly ? "text-destructive" : "text-success"}`}>
              {isAnomaly ? "Potential Issue" : "AI Insight"}
            </span>
            <span className="text-xs text-muted-foreground font-mono">• Just now</span>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">
            {isLoading ? "Loading short-term insights..." : (
              insight?.message || "No insights available."
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
