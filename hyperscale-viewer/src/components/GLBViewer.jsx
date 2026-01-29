import React, { Suspense, useRef, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, useProgress, Html } from '@react-three/drei'
import Model from './Model'
//import VisibilityChecker from './VisibilityChecker'

// Loader UI
function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div
        style={{
          color: 'white',
          background: 'rgba(0,0,0,0.6)',
          padding: '10px 20px',
          borderRadius: '10px',
          fontSize: '14px',
        }}
      >
        Loading... {progress.toFixed(1)}%
      </div>
    </Html>
  )
}

// Custom OrbitControls with external console hooks
function CustomOrbitControls({ position = [142, 72, -215], target, controlsRef }) {
  const { camera } = useThree()

  useEffect(() => {
    const ctr = controlsRef.current
    if (!ctr) return

    // Load saved camera position on startup
    const saved = JSON.parse(localStorage.getItem('cameraPos'))
    if (saved && saved.length === 3) {
      camera.position.set(...saved)
    } else {
      camera.position.fromArray(position)
    }

    // Ensure target is set
    if (target && target.length === 3) {
      ctr.target.set(...target)
    } else {
      ctr.target.set(144, 1.25, -157)
    }

    ctr.update()

    // Create global API container
    window.GLBViewerAPI = window.GLBViewerAPI || {}

    // Camera setters/getters
    window.GLBViewerAPI.setCamera = (pos) => {
      if (!pos || pos.length !== 3) return
      camera.position.set(...pos)
      ctr.update()
      localStorage.setItem('cameraPos', JSON.stringify(pos))
    }

    window.GLBViewerAPI.getCamera = () => {
      const p = [camera.position.x, camera.position.y, camera.position.z]
      // keep console call for convenience
      console.log('Camera:', p)
      return p
    }

    window.GLBViewerAPI.saveCamera = () => {
      const p = [camera.position.x, camera.position.y, camera.position.z]
      localStorage.setItem('cameraPos', JSON.stringify(p))
      console.log('Saved:', p)
    }

    window.GLBViewerAPI.loadCamera = () => {
      const saved2 = JSON.parse(localStorage.getItem('cameraPos'))
      if (saved2 && saved2.length === 3) {
        camera.position.set(...saved2)
        ctr.update()
        console.log('Loaded:', saved2)
      }
    }

    // Target setters/getters
    window.GLBViewerAPI.getTarget = () => {
      const t = ctr.target
      const pos = [t.x, t.y, t.z]
      console.log('Target:', pos)
      return pos
    }

    window.GLBViewerAPI.setTarget = (pos) => {
      if (!pos || pos.length !== 3) return
      ctr.target.set(...pos)
      ctr.update()
      console.log('Target Set:', pos)
    }

    // Provide a safe zoomTo that calls a zoom function if available.
    // The actual zoom function will be injected by the parent (GLBViewer)
    window.GLBViewerAPI._zoomFn = window.GLBViewerAPI._zoomFn || null
    window.GLBViewerAPI.zoomTo = (name) => {
      if (typeof window.GLBViewerAPI._zoomFn === 'function') {
        try {
          window.GLBViewerAPI._zoomFn(name)
        } catch (err) {
          console.warn('zoomTo failed', err)
        }
      } else {
        console.warn('zoomTo: no zoom function registered yet')
      }
    }

    return () => {
      // cleanup not strictly necessary, but good hygiene
    }
  }, [camera, controlsRef, position, target])

  return <OrbitControls ref={controlsRef} />
}

export default function GLBViewer({
  glb,
  cameraPosition,
  setModelClick,
  setViewChanged,
  target,
  showHTML,
}) {
  const machineMeshesRef = useRef([])
  const controlsRef = useRef()
  const zoomRef = useRef(null)

  const handleZoomReady = (zoomFn) => {
    zoomRef.current = zoomFn
    // register zoom callback on global API so CustomOrbitControls can call it
    window.GLBViewerAPI = window.GLBViewerAPI || {}
    window.GLBViewerAPI._zoomFn = zoomFn
  }

  const handleZoomClick = () => {
    // prefer using zoomRef, fallback to global API
    if (zoomRef.current) {
      zoomRef.current('Object079')
      return
    }
    if (window.GLBViewerAPI && typeof window.GLBViewerAPI.zoomTo === 'function') {
      window.GLBViewerAPI.zoomTo('Object079')
      return
    }
    console.warn('No zoom function available yet')
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas camera={{ fov: 80 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />

        <Suspense fallback={<Loader />}>
          <Model
            glb={glb}
            machineMeshesRef={machineMeshesRef}
            setModelClick={setModelClick}
            controlsRef={controlsRef}
            setViewChanged={setViewChanged}
            onZoomReady={handleZoomReady}
            showHTML={showHTML}
          />
          <Environment preset="sunset" />
        </Suspense>

        <CustomOrbitControls
          position={cameraPosition || [142, 72, -215]}
          target={target}
          controlsRef={controlsRef}
        />

        {/* <VisibilityChecker machineMeshesRef={machineMeshesRef} /> */}
      </Canvas>

      {/* Zoom button */}
      <button
        onClick={handleZoomClick}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '4px 8px',
          background: '#000',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          zIndex: 10,
          opacity: 0.85,
        }}
        title="Zoom to Object079"
      >
        ⨁
      </button>
    </div>
  )
}
