import { useEffect, useMemo, useRef, useState } from "react";
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
import { racks_parameters } from "../../constants/racks_parameters";
import { userName, password } from "../../constants/creds";

interface Metric {
  id: string;
  label: string;
  value: string;
  unit: string;
  icon: React.ElementType;
  status: "healthy" | "warning" | "critical";
  timestamp: string;
}

const WS_URL = "ws://172.23.106.87:8080/api/ws/plugins/telemetry";

const METRIC_DEFS = [
  { id: "1", label: "Rack ID", key: "rack_id", unit: "", icon: Server },
  { id: "2", label: "Active Workload Type", key: "workload_type", unit: "", icon: Activity },
  { id: "3", label: "Ambient Room Temperature", key: "ambient_temp_c", unit: "°C", icon: Thermometer },
  { id: "4", label: "Compute Utilization", key: "cpu_util", unit: "%", icon: Cpu },
  { id: "5", label: "Exhaust Air Temperature", key: "exhaust_temp_c", unit: "°C", icon: Wind },
  { id: "6", label: "Cooling Fan Speed", key: "fan_speed_rpm", unit: "RPM", icon: Fan },
  { id: "7", label: "Relative Humidity", key: "humidity", unit: "%", icon: Droplets },
  { id: "8", label: "Inlet Air Temperature", key: "inlet_temp_c", unit: "°C", icon: Thermometer },
  { id: "9", label: "IT Power Consumption", key: "power_kw", unit: "kW", icon: Zap },
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

const calculateStatus = (key: string, value: any): Metric["status"] => {
  const num = Number(value);
  if (isNaN(num)) return "healthy";

  switch (key) {
    case "inlet_temp_c":
      if (num > 40) return "critical";
      if (num > 35) return "warning";
      return "healthy";
    case "exhaust_temp_c":
      if (num > 60) return "critical";
      if (num > 50) return "warning";
      return "healthy";
    case "cpu_util":
      if (num > 95) return "critical";
      if (num > 85) return "warning";
      return "healthy";
    case "humidity":
      if (num > 80 || num < 20) return "critical";
      if (num > 70 || num < 30) return "warning";
      return "healthy";
    default:
      return "healthy";
  }
};

async function getUbuntuToken(username: string, password: string): Promise<string> {
  const res = await fetch("http://172.23.106.87:8080/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Failed to fetch token");
  const data = await res.json();
  return data.token;
}

export const MetricsPanel = () => {
  const [token, setToken] = useState<string | null>(null);
  const [latestTelemetry, setLatestTelemetry] = useState<Record<string, { value: any; ts: number }>>({});
  const [selectedRack, setSelectedRack] = useState(racks_parameters.find(r => r.name === "Rack C") || racks_parameters[0]);
  const wsRef = useRef<WebSocket | null>(null);

  // 1. Fetch Token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const t = await getUbuntuToken(userName, password);
        setToken(t);
      } catch (e) {
        console.error("❌ Token fetch failed", e);
      }
    };
    fetchToken();
  }, []);

  // 2. WebSocket Connection
  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket Connected");
      const subscribeCmd = {
        tsSubCmds: [{
          entityType: "DEVICE",
          entityId: selectedRack.id,
          scope: "LATEST_TELEMETRY",
          cmdId: Math.floor(Math.random() * 1000),
        }],
        historyCmds: [],
        attrSubCmds: [],
      };
      ws.send(JSON.stringify(subscribeCmd));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const data = msg?.data;
      if (!data || typeof data !== "object") return;

      const parsed: Record<string, { value: any; ts: number }> = {};
      Object.entries(data).forEach(([key, arr]: [string, any]) => {
        if (!Array.isArray(arr) || arr.length === 0) return;
        const [ts, value] = arr[0];
        parsed[key] = { value, ts };
      });

      if (Object.keys(parsed).length > 0) {
        setLatestTelemetry(prev => ({ ...prev, ...parsed }));
      }
    };

    ws.onerror = (e) => console.error("❌ WebSocket error", e);
    return () => ws.close();
  }, [token, selectedRack]);

  // 3. Map Telemetry to Metrics
  const metrics = useMemo(() => {
    return METRIC_DEFS.map((def) => {
      const telemetry = latestTelemetry[def.key];
      const rawValue = def.key === "rack_id" ? selectedRack.name : telemetry?.value;
      const timestamp = telemetry?.ts ? new Date(telemetry.ts).toLocaleString() : new Date().toLocaleString();
      
      let displayValue = rawValue ?? "-";
      const numValue = Number(rawValue);
      if (!isNaN(numValue) && rawValue !== null && rawValue !== undefined && rawValue !== "" && def.key !== "rack_id" && def.key !== "workload_type") {
        displayValue = def.unit === "RPM" ? Math.round(numValue).toString() : numValue.toFixed(2);
      }

      return {
        ...def,
        value: String(displayValue),
        status: calculateStatus(def.key, rawValue),
        timestamp,
      };
    });
  }, [latestTelemetry, selectedRack]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Live Operational State
        </h2>
        <span className="text-xs font-mono text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>

      {/* Rack Selector */}
      <div className="flex gap-2 p-1 bg-muted/30 rounded-lg overflow-x-auto">
        {racks_parameters.map((rack) => (
          <button
            key={rack.name}
            onClick={() => {
              setSelectedRack(rack);
              setLatestTelemetry({}); // Clear previous telemetry
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              selectedRack.name === rack.name
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {rack.name}
          </button>
        ))}
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
