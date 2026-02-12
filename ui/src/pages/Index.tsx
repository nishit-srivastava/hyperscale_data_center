import { useState, useEffect, useRef } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricsPanel, AnomalyResponse } from "@/components/dashboard/MetricsPanel";
import { ViewportPanel } from "@/components/dashboard/ViewportPanel";
import { ChartsPanel, ChartDataPoint } from "@/components/dashboard/ChartsPanel";
import { AIInsight } from "@/components/dashboard/AIInsight";
import { DesignSubNav, type DesignView } from "@/components/dashboard/DesignSubNav";
import { FutureOutlook } from "@/components/dashboard/FutureOutlook";
import { racks_parameters } from "@/constants/racks_parameters";
import { userName, password } from "@/constants/creds";

const WS_URL = "ws://172.23.106.87:8080/api/ws/plugins/telemetry";

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

const Index = () => {
  const [activeTab, setActiveTab] = useState<"design" | "sustainability">("design");
  const [designView, setDesignView] = useState<DesignView>("telemetry");
  
  // Telemetry & Data State
  const [token, setToken] = useState<string | null>(null);
  const [latestTelemetry, setLatestTelemetry] = useState<Record<string, { value: any; ts: number }>>({});
  const [anomalyData, setAnomalyData] = useState<AnomalyResponse | null>(null);
  const [selectedRack, setSelectedRack] = useState(racks_parameters.find(r => r.name === "Rack C") || racks_parameters[0]);
  
  // Chart Data State
  const [powerData, setPowerData] = useState<ChartDataPoint[]>([]);
  const [thermalData, setThermalData] = useState<ChartDataPoint[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const latestTelemetryRef = useRef<Record<string, { value: any; ts: number }>>({});

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

  // 2. WebSocket Connection & Data Accumulation
  useEffect(() => {
    if (!token) return;

    let isActive = true; // Prevent race conditions from old connections
    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isActive) return;
      console.log(`✅ WebSocket Connected for ${selectedRack.name}`);
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
      if (!isActive) return; // Ignore messages if we've switched racks

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
        // Update latest telemetry state
        const currentTelemetry = { ...latestTelemetryRef.current, ...parsed };
        latestTelemetryRef.current = currentTelemetry;
        setLatestTelemetry(currentTelemetry);

        // Update Charts
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // Power Chart
        if (parsed.power_kw) {
          setPowerData(prev => {
            const newData = [...prev, { time: timeStr, value: Number(parsed.power_kw.value) }];
            return newData.slice(-20); // Keep last 20 points
          });
        }

        // Thermal Chart
        if (parsed.inlet_temp_c || parsed.exhaust_temp_c) {
          setThermalData(prev => {
            const inlet = Number(currentTelemetry.inlet_temp_c?.value || 0);
            const exhaust = Number(currentTelemetry.exhaust_temp_c?.value || 0);
            
            // Only add if we have valid data
            if (inlet || exhaust) {
              const newData = [...prev, { time: timeStr, inlet, exhaust }];
              return newData.slice(-20);
            }
            return prev;
          });
        }
      }
    };

    ws.onerror = (e) => {
      if (isActive) console.error("❌ WebSocket error", e);
    };
    return () => {
      isActive = false;
      ws.close();
    };
  }, [token, selectedRack]);

  // 3. Anomaly Detection
  useEffect(() => {
    if (Object.keys(latestTelemetry).length === 0) return;

    const checkAnomaly = async () => {
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

      try {
        const res = await fetch('http://127.0.0.1:8000/api/ai/insight/anomaly', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rackId: selectedRack.name.replace(/\s+/g, ''),
            metrics: metricsData
          })
        });
        
        if (res.ok) {
          const data = await res.json();
          setAnomalyData(data);
        }
      } catch (e) {
        console.error("Anomaly check failed", e);
      }
    };

    checkAnomaly();
  }, [latestTelemetry, selectedRack]);

  const handleRackSelect = (rack: typeof racks_parameters[0]) => {
    if (rack.id === selectedRack.id) return; // Prevent reload if same rack clicked
    setSelectedRack(rack);
    setLatestTelemetry({});
    latestTelemetryRef.current = {};
    setPowerData([]);
    setThermalData([]);
    setAnomalyData(null);
  };

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Header */}
      <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left: 3D Viewport */}
        <div className="flex-1 p-4 flex flex-col gap-4">
          {/* Sub Navigation for Design Tab */}
          {activeTab === "design" && (
            <DesignSubNav activeView={designView} onViewChange={setDesignView} />
          )}
          
          <div className="flex-1">
            <ViewportPanel designView={designView} />
          </div>
        </div>

        {/* Right: Metrics & Charts */}
        <div className="w-[420px] border-l border-border/50 flex flex-col overflow-hidden">
          {activeTab === "design" ? (
            <>
              {/* Metrics Table */}
              <div className="flex-1 overflow-y-auto p-4">
                <MetricsPanel 
                  latestTelemetry={latestTelemetry}
                  selectedRack={selectedRack}
                  onRackSelect={handleRackSelect}
                  anomalyData={anomalyData}
                />
              </div>

              {/* AI Insight - Show when in insight or telemetry view */}
              {(designView === "telemetry" || designView === "insight") && (
                <div className="p-4 border-t border-border/50">
                  <AIInsight selectedRack={selectedRack} latestTelemetry={latestTelemetry} />
                </div>
              )}

              {/* Anomaly Alert - Show when in anomalies view */}
              {designView === "anomalies" && (
                <div className="p-4 border-t border-border/50">
                  <div className="ai-insight border-l-destructive" style={{ background: 'linear-gradient(90deg, hsl(var(--destructive) / 0.1), transparent)' }}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                          <path d="M12 9v4"/>
                          <path d="M12 17h.01"/>
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold uppercase tracking-wider text-destructive">
                            Anomaly Detected
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">• Rack C</span>
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          Rack C is experiencing thermal anomaly. Exhaust temperature exceeds safe threshold by 8°C.
                          <span className="text-destructive font-medium"> Immediate attention required.</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Charts */}
              <div className="p-4 border-t border-border/50">
                <ChartsPanel powerData={powerData} thermalData={thermalData} />
              </div>
            </>
          ) : (
            /* Sustainability Tab Content */
            <div className="flex-1 overflow-y-auto p-4">
              <FutureOutlook />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
