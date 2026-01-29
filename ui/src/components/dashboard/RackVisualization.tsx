import { Eye } from "lucide-react";

interface RackVisualizationProps {
  highlightedRack?: string | null;
  rackStatuses?: Record<string, "healthy" | "warning" | "critical">;
  zoom?: boolean;
}

const getRackColor = (status: "healthy" | "warning" | "critical" | "neutral") => {
  switch (status) {
    case "healthy":
      return {
        main: "hsl(142, 76%, 36%)",
        light: "hsl(142, 76%, 45%)",
        dark: "hsl(142, 76%, 25%)",
      };
    case "warning":
      return {
        main: "hsl(45, 93%, 47%)",
        light: "hsl(45, 93%, 58%)",
        dark: "hsl(45, 93%, 35%)",
      };
    case "critical":
      return {
        main: "hsl(0, 84%, 50%)",
        light: "hsl(0, 84%, 60%)",
        dark: "hsl(0, 84%, 35%)",
      };
    default:
      return {
        main: "hsl(217, 33%, 25%)",
        light: "hsl(217, 33%, 35%)",
        dark: "hsl(217, 33%, 15%)",
      };
  }
};

export const RackVisualization = ({ 
  highlightedRack = null, 
  rackStatuses = {},
  zoom = false 
}: RackVisualizationProps) => {
  const racks = [
    { id: "A", x: 40, label: "Rack A" },
    { id: "B", x: 120, label: "Rack B" },
    { id: "C", x: 200, label: "Rack C" },
    { id: "D", x: 280, label: "Rack D" },
  ];

  const getStatus = (rackId: string) => {
    if (rackStatuses[rackId]) return rackStatuses[rackId];
    if (highlightedRack === rackId) return "critical";
    if (highlightedRack && highlightedRack !== rackId) return "neutral";
    return "neutral";
  };

  return (
    <div className="relative">
      <svg
        viewBox="0 0 400 300"
        className={`w-[600px] h-[450px] opacity-90 transition-transform duration-500 ${zoom ? 'scale-110' : ''}`}
      >
        {/* Floor Grid */}
        <defs>
          <linearGradient id="glowGradientRed" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(0, 84%, 50%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(0, 84%, 50%)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="hsl(0, 84%, 50%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="glowGradientGreen" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(142, 76%, 45%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(142, 76%, 45%)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(142, 76%, 45%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="glowGradientAmber" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(45, 93%, 58%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(45, 93%, 58%)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(45, 93%, 58%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="glowGradientCyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(187, 85%, 53%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(187, 85%, 53%)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(187, 85%, 53%)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="200" cy="270" rx="180" ry="25" fill="hsl(222, 47%, 4%)" opacity="0.5" />

        {/* Racks */}
        {racks.map((rack, index) => {
          const status = getStatus(rack.id);
          const colors = getRackColor(status);
          const isHighlighted = highlightedRack === rack.id || rackStatuses[rack.id];
          const glowId = status === "critical" ? "glowGradientRed" : 
                        status === "warning" ? "glowGradientAmber" :
                        status === "healthy" ? "glowGradientGreen" : "glowGradientCyan";
          
          return (
            <g key={rack.id} className={`transition-all duration-300 ${isHighlighted ? 'animate-pulse' : ''}`}>
              {/* Main Rack Body - Front Face */}
              <path
                d={`M ${rack.x} 120 L ${rack.x} 250 L ${rack.x + 60} 265 L ${rack.x + 60} 135 Z`}
                fill={colors.main}
                stroke={colors.light}
                strokeWidth="1"
                className="transition-colors duration-300"
              />

              {/* Main Rack Body - Side Face */}
              <path
                d={`M ${rack.x + 60} 135 L ${rack.x + 60} 265 L ${rack.x + 80} 255 L ${rack.x + 80} 125 Z`}
                fill={colors.dark}
                stroke={colors.light}
                strokeWidth="1"
                className="transition-colors duration-300"
              />

              {/* Main Rack Body - Top Face */}
              <path
                d={`M ${rack.x} 120 L ${rack.x + 20} 105 L ${rack.x + 80} 125 L ${rack.x + 60} 135 Z`}
                fill={colors.light}
                stroke={colors.light}
                strokeWidth="1"
                className="transition-colors duration-300"
              />

              {/* Server Units - LED indicators */}
              {[0, 1, 2, 3, 4].map((i) => (
                <g key={i}>
                  <line
                    x1={rack.x + 5}
                    y1={135 + i * 22}
                    x2={rack.x + 55}
                    y2={145 + i * 22}
                    stroke={colors.dark}
                    strokeWidth="1"
                  />
                  <circle
                    cx={rack.x + 10}
                    cy={140 + i * 22}
                    r="2"
                    fill={status === "critical" ? "hsl(0, 84%, 60%)" : "hsl(142, 76%, 45%)"}
                    className="animate-pulse"
                    style={{ animationDelay: `${(index * 5 + i) * 100}ms` }}
                  />
                  <circle
                    cx={rack.x + 18}
                    cy={141 + i * 22}
                    r="2"
                    fill={status === "critical" ? "hsl(0, 84%, 60%)" : 
                          status === "warning" ? "hsl(45, 93%, 58%)" : "hsl(187, 85%, 53%)"}
                    className="animate-pulse"
                    style={{ animationDelay: `${(index * 5 + i) * 100 + 50}ms` }}
                  />
                </g>
              ))}

              {/* Glow effect on edge */}
              {isHighlighted && (
                <line
                  x1={rack.x}
                  y1="120"
                  x2={rack.x + 60}
                  y2="135"
                  stroke={`url(#${glowId})`}
                  strokeWidth="3"
                  opacity="0.8"
                />
              )}

              {/* Rack Label */}
              <text
                x={rack.x + 30}
                y="285"
                textAnchor="middle"
                fill="hsl(215, 20%, 65%)"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
              >
                {rack.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Labels */}
      <div className="absolute top-8 right-8 glass-panel px-3 py-2 flex items-center gap-2">
        <Eye className="w-4 h-4 text-primary" />
        <span className="text-xs font-mono">
          {highlightedRack ? `Rack ${highlightedRack} • Zone A` : "All Racks • Zone A"}
        </span>
      </div>
    </div>
  );
};
