import React, { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Html, useProgress } from '@react-three/drei'
import Model from './components/Model'
import SustainabilityCharts from './components/SustainabilityCharts'

export default function App() {
  // single fixed model in public/models folder
  //const MODEL_PATH = '/models/scp_server_room.glb'
  const MODEL_PATH = '/models/server_room.glb'
  const controlsRef = useRef()
  const [telemetry, setTelemetry] = useState([])

  useEffect(() => {
    let ws
    try {
      ws = new WebSocket('ws://localhost:8081')
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data)
          setTelemetry((prev) => [data, ...prev].slice(0, 100))
        } catch (e) {
          console.warn('bad ws msg', e)
        }
      }
      ws.onopen = () => console.log('ws connected to mock server')
      ws.onclose = () => console.log('ws closed')
    } catch (e) {
      console.warn('ws error', e)
    }
    return () => ws?.close()
  }, [])

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Hyperscale Data Center — Sustainability Dashboard</h1>
        <div className="controls-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <strong>Model:</strong>&nbsp;<span>{MODEL_PATH.replace('/models/', '')}</span>
          </div>
          <button onClick={() => controlsRef.current?.reset?.()}>Reset camera</button>
          <button
            onClick={() => {
              fetch('/mock-server/snapshot')
                .then((r) => r.json())
                .then((d) => alert('Snapshot:\n' + JSON.stringify(d, null, 2)))
            }}
          >
            Get snapshot
          </button>
        </div>
      </header>

      <div className="content">
        <div className="viewer">
          <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 7]} intensity={1.0} />
            <Suspense fallback={<Loader />}>
              <Model glb={MODEL_PATH} controlsRef={controlsRef} />
              <Environment preset="city" />
            </Suspense>
            <OrbitControls ref={controlsRef} enableDamping={true} maxPolarAngle={Math.PI / 2} />
          </Canvas>
        </div>

        <div className="charts">
          <SustainabilityCharts telemetry={telemetry} />
        </div>
      </div>

      <footer className="app-footer">Using model <code>{MODEL_PATH}</code></footer>
    </div>
  )
}

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="loader">Loading model — {Math.round(progress)}%</div>
    </Html>
  )
}
