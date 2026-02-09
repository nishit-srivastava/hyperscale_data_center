// src/components/three/GLBViewer.jsx
import React, { Suspense, useRef, useEffect,useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import Model from "./Model";
import { RackMarker } from "./RackMarker";



export default function GLBViewer({ glb, selectedRack, anomalyRack,setModelClick }) {
  const controlsRef = useRef(null);
  const [markerPos, setMarkerPos] = useState(null);

  // ensure global API always exists
  useEffect(() => {
    window.GLBViewerAPI = window.GLBViewerAPI || {};
  }, []);

  // Model will inject zoom function here
  const handleZoomReady = (zoomFn) => {
    window.GLBViewerAPI.zoomTo = zoomFn;
  };

  useEffect(() => {
    if (!selectedRack && !anomalyRack) return;

    const rackId = anomalyRack || selectedRack;
    const pos = window.GLBViewerAPI?.getRackWorldPosition?.(rackId);

    if (pos) setMarkerPos(pos);
  }, [selectedRack, anomalyRack]);

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ fov: 80, position: [140, 60, -220] }} onPointerDown={() => console.log("🔥 CANVAS POINTER")}>
        
        {/* Lights */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />

        {/* Scene */}
        <Suspense fallback={null}>
          <Model
            glb={glb}
            setModelClick={setModelClick}
            controlsRef={controlsRef}
            onZoomReady={handleZoomReady}
          />
          <Environment preset="sunset" />
        </Suspense>

        {/* Controls */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.08}
        />
         {markerPos && (
          <RackMarker
            position={markerPos}
            label={anomalyRack ? "⚠ Rack C" : "Rack C"}
            status={anomalyRack ? "anomaly" : "selected"}
          />
        )}
      </Canvas>
    </div>
  );
}
