import { Calendar, TrendingUp, AlertTriangle } from "lucide-react";

type RackStatus = "healthy" | "warning" | "critical";

interface YearlyData {
  year: string;
  racks: Record<string, RackStatus>;
}

const yearlyRiskData: YearlyData[] = [
  {
    year: "2026",
    racks: {
      A: "healthy",
      B: "healthy",
      C: "warning",
      D: "healthy",
    },
  },
  {
    year: "2027",
    racks: {
      A: "healthy",
      B: "healthy",
      C: "critical",
      D: "healthy",
    },
  },
];

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

export const FutureOutlook = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Future Outlook</h2>
            <p className="text-xs text-muted-foreground">Yearly Risk Assessment</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/30">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <span className="text-xs font-medium text-destructive">Rack C Degradation Predicted</span>
        </div>
      </div>

      {/* Yearly Risk View */}
      <div className="grid grid-cols-2 gap-4">
        {yearlyRiskData.map((yearData) => (
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

      {/* Summary */}
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
              Rack C shows progressive thermal degradation. By 2027, cooling capacity is projected to fall below safe thresholds.
              <span className="text-destructive font-medium"> Recommend proactive maintenance scheduling.</span>
            </p>
          </div>
        </div>
      </div>

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
