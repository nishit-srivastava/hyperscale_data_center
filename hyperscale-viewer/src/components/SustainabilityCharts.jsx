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

export default function SustainabilityCharts() {
  const wsRef = useRef(null);

  const [token, setToken] = useState(null);
  const [latestTelemetry, setLatestTelemetry] = useState({});
  const [timeline, setTimeline] = useState([]);

  /* --------------------------------------------------
     1. Fetch JWT Token
  -------------------------------------------------- */
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await getUbuntuToken(userName, password);
        setToken(token);
      } catch (e) {
        console.error("Token fetch failed", e);
      }
    };
    fetchToken();
  }, []);

  /* --------------------------------------------------
     2. Open WebSocket & Subscribe
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
          cmdId: Math.floor(Math.random() * 1000)
        
        })),
        historyCmds: [],
        attrSubCmds: [],
      };

      ws.send(JSON.stringify(subscribeCmd));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const data = msg?.data;
      if (!data) return;

      /*
        data format:
        {
          power_kw: [[ts, value]],
          inlet_temp_c: [[ts, value]],
          ...
        }
      */

      const parsed = {};
      Object.entries(data).forEach(([key, arr]) => {
        parsed[key] = {
          value: arr[0][1],
          ts: arr[0][0],
        };
      });

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

    ws.onerror = e => console.error("WS error", e);
    ws.onclose = () => console.log("❌ WebSocket Closed");

    return () => ws.close();
  }, [token]);

  /* --------------------------------------------------
     3. Convert telemetry to table rows
  -------------------------------------------------- */
  const telemetryRows = useMemo(() => {
    return Object.entries(latestTelemetry).map(([key, v]) => ({
      key,
      value: v.value,
      time: new Date(v.ts).toLocaleString(),
    }));
  }, [latestTelemetry]);

  /* --------------------------------------------------
     4. UI
  -------------------------------------------------- */
  return (
    <div className="charts-root">
      <h2>Rack Telemetry – Live</h2>

      {/* -------- Latest Telemetry Table -------- */}
      <div className="chart-card">
        <h3>Latest Telemetry</h3>
        <table className="telemetry-table">
          <thead>
            <tr>
              <th>Last Update</th>
              <th>Key</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {telemetryRows.map(row => (
              <tr key={row.key}>
                <td>{row.time}</td>
                <td>{row.key}</td>
                <td>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* -------- Power Chart -------- */}
      <div className="chart-card">
        <h3>Power Usage (kW)</h3>
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
        <h3>Temperature (°C)</h3>
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
   Token API
-------------------------------------------------- */
async function getUbuntuToken(username, password) {
  const res = await axios.post(
    "http://172.23.106.87:8080/api/auth/login",
    { username, password },
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data.token;
}
