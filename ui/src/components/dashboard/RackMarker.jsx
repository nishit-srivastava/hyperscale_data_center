import { Html } from "@react-three/drei";

export function RackMarker({ position, label, status }) {
  if (!position) return null;

  const isAnomaly = status === "anomaly";

  return (
    <Html position={position} center distanceFactor={35} occlude={false}>
      <div
        className={`
          flex items-center gap-2
          px-3 py-1.5 rounded-full
          text-xs font-semibold
          shadow-lg
          ${isAnomaly
            ? "bg-red-600 text-white ring-2 ring-red-400 animate-pulse"
            : "bg-slate-900 text-white"}
        `}
        style={{
          boxShadow: isAnomaly
            ? "0 0 16px rgba(239,68,68,0.8)"
            : "0 4px 10px rgba(0,0,0,0.4)",
        }}
      >
        {isAnomaly && <span className="text-sm">⚠</span>}
        <span>{label}</span>
      </div>
    </Html>
  );
}
