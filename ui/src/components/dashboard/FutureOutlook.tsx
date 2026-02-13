import { useState, useEffect } from "react";
import { Calendar, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";

type RackStatus = "healthy" | "warning" | "critical";

interface YearlyData {
  year: string;
  racks: Record<string, RackStatus>;
}

interface SustainabilityResponse {
  yearly_risks: YearlyData[];
  risk_analysis: string;
}

const getStatusColor = (status: RackStatus) => {
  switch (status) {
    case "healthy":
      return "bg-data-green";
    case "warning":
      return "bg-data-amber";
    case "critical":
      return "bg-data-red";
  }
};

const getStatusBgColor = (status: RackStatus) => {
  switch (status) {
    case "healthy":
      return "bg-data-green/20 border-data-green/50";
    case "warning":
      return "bg-data-amber/20 border-data-amber/50";
    case "critical":
      return "bg-data-red/20 border-data-red/50";
  }
};

const getStatusLabel = (status: RackStatus) => {
  switch (status) {
    case "healthy":
      return "Normal";
    case "warning":
      return "At Risk";
    case "critical":
      return "Critical";
  }
};

interface FutureOutlookProps {
  latestTelemetry: Record<string, { value: any; ts: number }>;
}

export const FutureOutlook = ({ latestTelemetry }: FutureOutlookProps) => {
  const [data, setData] = useState<SustainabilityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!latestTelemetry || Object.keys(latestTelemetry).length === 0) return;

    const fetchSustainabilityRisk = async () => {
      const metricsToMonitor = [
        "cpu_util", "power_kw", "ambient_temp_c", 
        "inlet_temp_c", "exhaust_temp_c", "fan_speed_rpm", "humidity"
      ];

      const metricsData: Record<string, number[]> = {};

      for (const key of metricsToMonitor) {
        const val = latestTelemetry[key]?.value;
        const numVal = val !== undefined ? Number(val) : 0;
        metricsData[key] = Array(30).fill(isNaN(numVal) ? 0 : numVal);
      }

      setIsLoading(true);
      try {
        const res = await fetch('http://localhost:8000/api/ai/sustainability/risk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            racks: ["A", "B", "C", "D"],
            metrics: metricsData
          })
        });
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (e) {
        console.error("Error fetching sustainability risk", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSustainabilityRisk();
  }, [latestTelemetry]);

  const yearlyRisks = data?.yearly_risks || [];
  const riskAnalysis = data?.risk_analysis;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : (
              <TrendingUp className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold">Future Outlook</h2>
            <p className="text-xs text-muted-foreground">Yearly Risk Assessment</p>
          </div>
        </div>
        {riskAnalysis && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/30">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-xs font-medium text-destructive">Degradation Predicted</span>
          </div>
        )}
      </div>

      {/* Yearly Risk View */}
      {yearlyRisks.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {yearlyRisks.map((yearData) => (
            <div key={yearData.year} className="data-card">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-lg font-semibold">{yearData.year}</span>
              </div>
              
              <div className="space-y-3">
                {Object.entries(yearData.racks).map(([rackId, status]) => (
                  <div
                    key={rackId}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${getStatusBgColor(status)}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(status)} ${status === 'critical' ? 'animate-pulse' : ''}`} />
                      <span className="font-medium">Rack {rackId}</span>
                    </div>
                    <span className={`text-xs font-mono px-2 py-1 rounded ${
                      status === 'healthy' ? 'bg-data-green/30 text-data-green' :
                      status === 'warning' ? 'bg-data-amber/30 text-data-amber' :
                      'bg-data-red/30 text-data-red'
                    }`}>
                      {getStatusLabel(status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          {isLoading ? (
            <p>Analyzing telemetry data...</p>
          ) : (
            <p>Waiting for telemetry data...</p>
          )}
        </div>
      )}

      {/* Summary */}
      {riskAnalysis && (
        <div className="ai-insight">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-destructive">
                  Risk Analysis
                </span>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {riskAnalysis}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-data-green" />
          <span className="text-xs text-muted-foreground">Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-data-amber" />
          <span className="text-xs text-muted-foreground">At Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-data-red" />
          <span className="text-xs text-muted-foreground">Critical</span>
        </div>
      </div>
    </div>
  );
};
