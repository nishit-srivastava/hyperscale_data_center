import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const powerData = [
  { time: "7:30", value: 2.8 },
  { time: "7:32", value: 2.9 },
  { time: "7:34", value: 3.1 },
  { time: "7:36", value: 3.0 },
  { time: "7:38", value: 3.24 },
];

const thermalData = [
  { time: "7:30", inlet: 30, exhaust: 40 },
  { time: "7:32", inlet: 31, exhaust: 42 },
  { time: "7:34", inlet: 30.5, exhaust: 41 },
  { time: "7:36", inlet: 31.5, exhaust: 43 },
  { time: "7:38", inlet: 31.2, exhaust: 43 },
];

export const ChartsPanel = () => {
  return (
    <div className="space-y-4">
      {/* Power Consumption Chart */}
      <div className="data-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">IT Power Consumption</h3>
          <span className="text-xs font-mono text-muted-foreground">kW</span>
        </div>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={powerData}>
              <defs>
                <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(187, 85%, 53%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(187, 85%, 53%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
              />
              <YAxis 
                domain={[0, 4]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(222, 47%, 8%)',
                  border: '1px solid hsl(217, 33%, 25%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(215, 20%, 55%)' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(187, 85%, 53%)"
                strokeWidth={2}
                fill="url(#powerGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-primary rounded" />
            <span className="text-xs text-muted-foreground">power_kw</span>
          </div>
        </div>
      </div>

      {/* Thermal Conditions Chart */}
      <div className="data-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Thermal Conditions</h3>
          <span className="text-xs font-mono text-muted-foreground">°C</span>
        </div>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={thermalData}>
              <defs>
                <linearGradient id="inletGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="exhaustGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(45, 93%, 58%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(45, 93%, 58%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
              />
              <YAxis 
                domain={[20, 50]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(222, 47%, 8%)',
                  border: '1px solid hsl(217, 33%, 25%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(215, 20%, 55%)' }}
              />
              <Area
                type="monotone"
                dataKey="inlet"
                stroke="hsl(172, 66%, 50%)"
                strokeWidth={2}
                fill="url(#inletGradient)"
              />
              <Area
                type="monotone"
                dataKey="exhaust"
                stroke="hsl(45, 93%, 58%)"
                strokeWidth={2}
                fill="url(#exhaustGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-data-teal rounded" />
            <span className="text-xs text-muted-foreground">Inlet</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-data-amber rounded" />
            <span className="text-xs text-muted-foreground">Exhaust</span>
          </div>
        </div>
      </div>
    </div>
  );
};
