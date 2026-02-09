// src/components/Model.jsx
import React, { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Vector3 } from "three";
//import { useZoomToObject } from "../hooks/useZoomToObject";
import { useZoomToObject } from "../../hooks/useZoomToObject";


const RACK_MAP = {
  RackA: "Servers_dup_3",
  RackB: "Servers_dup_6",
  RackC: "Servers_dup_2", // default focus
  RackD: "Servers_dup_5",
};

// climb parents to resolve rack
const resolveRackFromObject = (mesh) => {
  let current = mesh;
  while (current) {
    for (const [rackId, prefix] of Object.entries(RACK_MAP)) {
      if (current.name && current.name.includes(prefix)) {
        return { rackId, rootName: prefix };
      }
    }
    current = current.parent;
  }
  return null;
};


export default function Model({
  glb,
  glbPath,
  setModelClick,
  controlsRef,
  onZoomReady,
}) {
  const modelPath = glb || glbPath || "/models/server_room.glb";
  const { scene } = useGLTF(modelPath);
  const { camera } = useThree();

  const meshesRef = useRef([]);

  // collect meshes once
  useEffect(() => {
    meshesRef.current = [];
    scene.traverse((o) => o.isMesh && meshesRef.current.push(o));
    
  }, [scene]);

  // zoom helper
  const zoomToObject = useZoomToObject({ scene, camera, controlsRef });

  //expose zoom to GLBViewer
  useEffect(() => {
    if (onZoomReady && zoomToObject) {
      onZoomReady(zoomToObject);
    }
  }, [zoomToObject, onZoomReady]);

  // default focus → Rack C
  useEffect(() => {
    if (!zoomToObject) return;
      zoomToObject(RACK_MAP.RackC);
  }, [zoomToObject]);

  // expose highlight API
  useEffect(() => {
    window.GLBViewerAPI = window.GLBViewerAPI || {};

    window.GLBViewerAPI.highlightRack = (prefix) => {
      meshesRef.current.forEach((m) => {
        if (!m.material?.color) return;
        m.material.color.set(
          m.name.startsWith(prefix) ? "orange" : "#888"
        );
      });
    };
  }, []);

  useEffect(() => {
  if (!scene) return;

  const rackRegistry = {};

  scene.traverse((obj) => {
    for (const [rackId, prefix] of Object.entries(RACK_MAP)) {
      if (obj.name === prefix) {
        rackRegistry[rackId] = obj;
      }
    }
  });

  window.GLBViewerAPI = window.GLBViewerAPI || {};
  window.GLBViewerAPI.getRackWorldPosition = (rackId) => {
    const rack = rackRegistry[rackId];
    if (!rack) return null;

    const pos = new Vector3();
    rack.getWorldPosition(pos);
    return pos;
  };
}, [scene]);


  return (
    <primitive
  object={scene}
  onPointerDown={(e) => {
    e.stopPropagation()

    const mesh = e.object
    if (!mesh.isMesh) return

    const rack = resolveRackFromObject(mesh)

    console.log("🖱 mesh hit:", mesh.name)
      console.log("rack:", rack)

    if (rack) {
      setModelClick?.({
        type: "rack",
        rackId: rack.rackId,
      })

      window.GLBViewerAPI?.zoomTo?.(rack.rootName)
    }
  }}
/>

  );
}
