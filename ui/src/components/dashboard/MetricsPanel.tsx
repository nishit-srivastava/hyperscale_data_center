import { 
  Thermometer, 
  Cpu, 
  Wind, 
  Fan, 
  Droplets, 
  Zap,
  Server,
  Activity
} from "lucide-react";

interface Metric {
  id: string;
  label: string;
  value: string;
  unit: string;
  icon: React.ElementType;
  status: "healthy" | "warning" | "critical";
  timestamp: string;
}

const metrics: Metric[] = [
  {
    id: "1",
    label: "Rack ID",
    value: "RackC",
    unit: "",
    icon: Server,
    status: "healthy",
    timestamp: "1/6/2026, 6:48:01 PM",
  },
  {
    id: "2",
    label: "Active Workload Type",
    value: "ai_inference",
    unit: "",
    icon: Activity,
    status: "healthy",
    timestamp: "1/6/2026, 6:48:01 PM",
  },
  {
    id: "3",
    label: "Ambient Room Temperature",
    value: "25.4",
    unit: "°C",
    icon: Thermometer,
    status: "healthy",
    timestamp: "1/6/2026, 6:48:01 PM",
  },
  {
    id: "4",
    label: "Compute Utilization",
    value: "72.0",
    unit: "%",
    icon: Cpu,
    status: "healthy",
    timestamp: "1/6/2026, 6:48:01 PM",
  },
  {
    id: "5",
    label: "Exhaust Air Temperature",
    value: "43.0",
    unit: "°C",
    icon: Wind,
    status: "warning",
    timestamp: "1/6/2026, 6:48:01 PM",
  },
  {
    id: "6",
    label: "Cooling Fan Speed",
    value: "6081",
    unit: "RPM",
    icon: Fan,
    status: "healthy",
    timestamp: "1/6/2026, 6:48:01 PM",
  },
  {
    id: "7",
    label: "Relative Humidity",
    value: "42.2",
    unit: "%",
    icon: Droplets,
    status: "healthy",
    timestamp: "1/6/2026, 6:48:01 PM",
  },
  {
    id: "8",
    label: "Inlet Air Temperature",
    value: "31.2",
    unit: "°C",
    icon: Thermometer,
    status: "healthy",
    timestamp: "1/6/2026, 6:48:01 PM",
  },
  {
    id: "9",
    label: "IT Power Consumption",
    value: "3.24",
    unit: "kW",
    icon: Zap,
    status: "healthy",
    timestamp: "1/6/2026, 6:48:01 PM",
  },
];

const getStatusColor = (status: Metric["status"]) => {
  switch (status) {
    case "healthy":
      return "text-data-green";
    case "warning":
      return "text-data-amber";
    case "critical":
      return "text-data-red";
  }
};

const getStatusBg = (status: Metric["status"]) => {
  switch (status) {
    case "healthy":
      return "bg-data-green/10";
    case "warning":
      return "bg-data-amber/10";
    case "critical":
      return "bg-data-red/10";
  }
};

export const MetricsPanel = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Live Operational State
        </h2>
        <span className="text-xs font-mono text-muted-foreground">
          Last updated: 6:48:01 PM
        </span>
      </div>

      <div className="space-y-2">
        {metrics.map((metric, index) => (
          <div
            key={metric.id}
            className="data-card group animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${getStatusBg(metric.status)} flex items-center justify-center transition-colors`}>
                  <metric.icon className={`w-4 h-4 ${getStatusColor(metric.status)}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground/90">
                    {metric.label}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {metric.timestamp}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`font-mono text-lg font-semibold ${getStatusColor(metric.status)}`}>
                  {metric.value}
                </span>
                {metric.unit && (
                  <span className="text-sm text-muted-foreground ml-1">
                    {metric.unit}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
