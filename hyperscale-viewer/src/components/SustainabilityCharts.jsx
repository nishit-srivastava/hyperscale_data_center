import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts'

const sampleEnergy = [
  { name: 'Rack A', PUE: 1.2, Power_kW: 120 },
  { name: 'Rack B', PUE: 1.35, Power_kW: 200 },
  { name: 'Rack C', PUE: 1.1, Power_kW: 95 },
  { name: 'Rack D', PUE: 1.4, Power_kW: 240 },
]

export default function SustainabilityCharts({ telemetry = [] }) {
  const carbonTimeline = useMemo(() => {
    return telemetry.slice(0, 12).map((t, i) => ({ month: t.time || i, CO2: t.CO2 || t.co2 || Math.round(Math.random()*150) }))
  }, [telemetry])

  return (
    <div className="charts-root">
      <h2>Key Sustainability Metrics</h2>

      <div className="chart-card">
        <h3>Power Usage & PUE (sample)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={sampleEnergy} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="Power_kW" name="Power (kW)" />
            <Bar yAxisId="right" dataKey="PUE" name="PUE" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>CO₂ Emissions Trend (live)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={carbonTimeline} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="CO2" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
