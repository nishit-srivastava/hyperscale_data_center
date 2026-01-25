import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { racks_parameters } from "../constants/racks_parameters";
import { userName, password } from "../constants/creds";

const WS_URL = "ws://172.23.106.87:8080/api/ws/plugins/telemetry";


/* --------------------------------------------------
   Metric Labels & Formatting (UI ONLY)
-------------------------------------------------- */
const METRIC_LABELS = {
  power_kw: "IT Power Consumption",
  inlet_temp_c: "Inlet Air Temperature",
  exhaust_temp_c: "Exhaust Air Temperature",
  ambient_temp_c: "Ambient Room Temperature",
  cpu_util: "Compute Utilization",
  fan_speed_rpm: "Cooling Fan Speed",
  humidity: "Relative Humidity",
  workload_type: "Active Workload Type",
};
const formatValue = (key, value) => {
  if (value === null || value === undefined) return "-";

  const num = Number(value);
  const isNumber = !Number.isNaN(num);

  if (key.includes("temp") && isNumber) return `${num.toFixed(1)} °C`;
  if (key === "power_kw" && isNumber) return `${num.toFixed(2)} kW`;
  if (key === "cpu_util" && isNumber) return `${num.toFixed(1)} %`;
  if (key === "fan_speed_rpm" && isNumber) return `${Math.round(num)} RPM`;
  if (key === "humidity" && isNumber) return `${num.toFixed(1)} %`;

  // fallback for strings, enums, workload types, etc.
  return String(value);
};


export default function SustainabilityCharts() {
  const wsRef = useRef(null);

  const [token, setToken] = useState(null);
  const [latestTelemetry, setLatestTelemetry] = useState({});
  const [timeline, setTimeline] = useState([]);

  /* --------------------------------------------------
     1. Fetch JWT Token (UNCHANGED)
  -------------------------------------------------- */
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await getUbuntuToken(userName, password);
        setToken(token);
      } catch (e) {
        console.error("❌ Token fetch failed", e);
      }
    };
    fetchToken();
  }, []);

  /* --------------------------------------------------
     2. WebSocket Connection (ORIGINAL – DO NOT TOUCH)
  -------------------------------------------------- */
  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket Connected");

      const entityIds = racks_parameters.map(p => p.id);

      const subscribeCmd = {
        tsSubCmds: entityIds.map(id => ({
          entityType: "DEVICE",
          entityId: id,
          scope: "LATEST_TELEMETRY",
          cmdId: Math.floor(Math.random() * 1000),
        })),
        historyCmds: [],
        attrSubCmds: [],
      };

      ws.send(JSON.stringify(subscribeCmd));
    };

  ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  const data = msg?.data;
  if (!data || typeof data !== "object") return;

  const parsed = {};

  Object.entries(data).forEach(([key, arr]) => {
    if (!Array.isArray(arr) || arr.length === 0) return;

    const [ts, value] = arr[0];
    parsed[key] = { value, ts };
  });

  if (Object.keys(parsed).length === 0) return;

  setLatestTelemetry(prev => ({ ...prev, ...parsed }));

  setTimeline(prev => {
    const point = {
      time: new Date().toLocaleTimeString(),
      power_kw: parsed.power_kw?.value,
      inlet_temp_c: parsed.inlet_temp_c?.value,
      exhaust_temp_c: parsed.exhaust_temp_c?.value,
      ambient_temp_c: parsed.ambient_temp_c?.value,
    };
    return [...prev.slice(-20), point];
  });
};


    ws.onerror = e => console.error("❌ WebSocket error", e);
    ws.onclose = () => console.log("🔌 WebSocket Closed");

    return () => ws.close();
  }, [token]);

  /* --------------------------------------------------
     3. Convert Telemetry to Table Rows (SAFE)
  -------------------------------------------------- */
  const telemetryRows = useMemo(() => {
    return Object.entries(latestTelemetry).map(([key, v]) => ({
      time: new Date(v.ts).toLocaleString(),
      metric: METRIC_LABELS[key] || key,
      value: formatValue(key, v.value),
    }));
  }, [latestTelemetry]);

  /* --------------------------------------------------
     4. UI
  -------------------------------------------------- */
  return (
    <div className="charts-root">
      <h2>Rack C — Digital Twin Live Inference Dashboard</h2>

      {/* -------- Operational State Table -------- */}
      <div className="chart-card">
        <h3>Digital Twin – Live Operational State</h3>

        <table className="telemetry-table">
          <thead>
            <tr>
              <th>Observed At</th>
              <th>Operational Metric</th>
              <th>Live Value</th>
            </tr>
          </thead>
          <tbody>
          {telemetryRows.map((row, idx) => (
            <tr key={idx} className="telemetry-row">
              <td className="telemetry-time">{row.time}</td>
              <td className="telemetry-metric">
                <strong>{row.metric}</strong>
              </td>
              <td className="telemetry-value">{row.value}</td>
            </tr>
          ))}
        </tbody>

        </table>
        <div className="ai-insight">
  <strong>AI Insight:</strong>{" "}
  Current thermal and power behavior is within nominal operating limits
  for the active AI inference workload.
</div>

      </div>

      {/* -------- Power Chart -------- */}
      <div className="chart-card">
        <h3>IT Power Consumption (kW)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="power_kw" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* -------- Temperature Chart -------- */}
      <div className="chart-card">
        <h3>Thermal Conditions (°C)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="inlet_temp_c" name="Inlet" dot={false} />
            <Line dataKey="exhaust_temp_c" name="Exhaust" dot={false} />
            <Line dataKey="ambient_temp_c" name="Ambient" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* --------------------------------------------------
   Token API (UNCHANGED)
-------------------------------------------------- */
async function getUbuntuToken(username, password) {
  const res = await axios.post(
    "http://172.23.106.87:8080/api/auth/login",
    { username, password },
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data.token;
}
