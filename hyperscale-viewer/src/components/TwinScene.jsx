import React, { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Model from './Model'
import DesignOverlay from './overlays/DesignOverlay'
import ScenarioOverlay from './overlays/ScenarioOverlay'

export default function TwinScene({ activeTab }) {
  return (
    <Canvas camera={{ position: [10, 6, 10], fov: 50 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      <Model />

      {activeTab === 'design' && <DesignOverlay />}
      {activeTab === 'sustainability' && <ScenarioOverlay />}

      <OrbitControls />
    </Canvas>
  )
}
