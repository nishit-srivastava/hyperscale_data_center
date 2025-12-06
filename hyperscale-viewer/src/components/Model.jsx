// src/components/Model.jsx
import React, { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useGLTF } from '@react-three/drei'
import { Box3, Vector3 } from 'three'
import { useMachineMeshes } from '../hooks/useMachineMeshes'
import { useHoverHighlight } from '../hooks/useHoverHighlight'
import { useZoomToObject } from '../hooks/useZoomToObject'
import { useModelInteraction } from '../hooks/useModelInteraction'

export default function Model({
  glb,
  glbPath,
  machineMeshesRef,
  setModelClick,
  controlsRef,
  setViewChanged,
  onZoomReady,
  showHTML = true,
}) {
  const modelPath = glb || glbPath || '/models/scp_server_room.glb'
  if (!modelPath) {
    console.warn('Model: no glb path provided')
  }
  const { scene } = useGLTF(modelPath)
  const { camera } = useThree()

  // --- legacy helpers & interactions ---
  useMachineMeshes(scene, machineMeshesRef)
  const meshesRef = useRef([])
  // populate meshesRef whenever scene changes
  useEffect(() => {
    meshesRef.current = []
    if (scene) {
      scene.traverse((obj) => obj.isMesh && meshesRef.current.push(obj))
    }
  }, [scene])

  const {
    hoveredPrefix,
    showInfo,
    setShowInfo,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerOut,
  } = useModelInteraction(setModelClick)
  useHoverHighlight(meshesRef, hoveredPrefix)

  const zoomToObject = useZoomToObject({ scene, camera, controlsRef })

  useEffect(() => {
    if (onZoomReady && zoomToObject) {
      onZoomReady(zoomToObject)
    }
  }, [zoomToObject, onZoomReady])

  // ----------------------------------------------------------------------
  // Centering + fit API
  // Exposes: window.GLBViewerAPI.centerModel({ fit = true, padding = 1.2, axis = 'auto' })
  // - Centers the model around the origin (moves the scene)
  // - Optionally adjusts the camera so the entire model fits the view
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (!scene) return

    // compute bounding box and center
    const box = new Box3().setFromObject(scene)
    const center = new Vector3()
    const size = new Vector3()
    box.getCenter(center)
    box.getSize(size)
    // store values on the scene for debugging if needed
    scene.userData._boundingBox = { min: box.min.clone(), max: box.max.clone(), center: center.clone(), size: size.clone() }

    // default centering function
    const centerModelFn = ({ fit = true, padding = 1.2, axis = 'auto' } = {}) => {
      // move the scene so its center is at origin
      scene.position.x -= center.x
      scene.position.y -= center.y
      scene.position.z -= center.z
      scene.updateMatrixWorld(true)

      // set controls target to origin (model is centered at origin now)
      if (controlsRef && controlsRef.current) {
        try {
          controlsRef.current.target.set(0, 0, 0)
          controlsRef.current.update && controlsRef.current.update()
        } catch (e) {
          // ignore if controls not ready
        }
      }

      // optionally fit camera to object
      if (fit && camera) {
        // choose the largest dimension of size
        const maxDim = Math.max(size.x, size.y, size.z)
        // camera fov in radians
        const fov = (camera.fov * Math.PI) / 180
        // distance formula to fit object: maxDim / (2 * tan(fov/2))
        let distance = Math.abs((maxDim / 2) / Math.tan(fov / 2))
        distance = distance * padding // give some padding

        // pick an offset direction: use current camera direction if possible
        const dir = new Vector3()
        camera.getWorldDirection(dir)
        dir.normalize()
        // if dir is near zero (unlikely), fallback to [1,1,1]
        if (dir.length() < 0.001) dir.set(1, 1, 1).normalize()

        // place camera along opposite direction so it's looking at origin
        const newPos = new Vector3().copy(dir).multiplyScalar(-distance)
        // add a small upward offset so object isn't perfectly level
        newPos.y += distance * 0.12

        camera.position.copy(newPos)
        camera.lookAt(0, 0, 0)

        if (controlsRef && controlsRef.current) {
          try {
            controlsRef.current.target.set(0, 0, 0)
            controlsRef.current.update && controlsRef.current.update()
          } catch (e) {
            // ignore
          }
        }
      }
    }

    // attach to global API for external consumers (GLBViewer)
    window.GLBViewerAPI = window.GLBViewerAPI || {}
    window.GLBViewerAPI.centerModel = centerModelFn
    // also expose bounding info
    window.GLBViewerAPI.getModelBounds = () => ({
      center: center.clone(),
      size: size.clone(),
      min: box.min.clone(),
      max: box.max.clone(),
    })

    // auto-center once on load so the new model is visually centered
    // Do this after a small timeout so any animations or additional nodes finish mounting
    setTimeout(() => {
      try {
        centerModelFn({ fit: true, padding: 1.2 })
      } catch (err) {
        console.warn('centerModel auto-run failed', err)
      }
    }, 80)

    // cleanup on unmount
    return () => {
      try {
        if (window.GLBViewerAPI && window.GLBViewerAPI.centerModel) {
          delete window.GLBViewerAPI.centerModel
        }
        if (window.GLBViewerAPI && window.GLBViewerAPI.getModelBounds) {
          delete window.GLBViewerAPI.getModelBounds
        }
      } catch (e) {
        // ignore
      }
    }
  }, [scene, camera, controlsRef])

  // ----------------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------------
  return (
    <group>
      <primitive
        object={scene}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerOut={onPointerOut}
      />

      {/* Packaging line 1 label */}
      {showHTML && (
        <Html
          occlude="raycast"
          position={[140, 6, -158]}
          center
          distanceFactor={40}
          style={{
            background: 'rgba(0, 0, 0, 0.75)',
            color: 'white',
            padding: '6px 10px',
            borderRadius: '6px',
            whiteSpace: 'nowrap',
          }}
        >
          <button
            style={{
              padding: '6px 12px',
              background: '#4a6cf7',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
            onClick={() => {
              setViewChanged &&
                setViewChanged({
                  changed: true,
                  object: 'Object079',
                })
            }}
          >
            Glazing Line 1
          </button>
        </Html>
      )}

      {/* Factory data html */}
      {showHTML && (
        <Html position={[160, 22, -120]} center distanceFactor={50} scale={10} occlude="raycast">
          <div
            style={{
              background: 'rgba(0,0,0,0.8)',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: '8px',
              width: '200px',
              fontSize: '0.8rem',
              position: 'relative',
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowInfo(!showInfo)
              }}
              style={{
                position: 'absolute',
                top: '4px',
                right: '6px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                paddingTop: '8px',
              }}
              aria-label="toggle info"
            >
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke={'#fff'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <h2 style={{ margin: 0 }}>Sinzig plant</h2>
            {showInfo && (
              <>
                <p style={{ marginBottom: '0px', marginTop: '15px' }}>
                  Capacity Utilization Rate: 50%
                </p>
                <p style={{ marginBottom: '0px', marginTop: '15px' }}>
                  Production Throughput: 57%
                </p>
                <p style={{ marginBottom: '0px', marginTop: '15px' }}>Defect Rate: 3.5%</p>
                <p style={{ marginBottom: '0px', marginTop: '15px' }}>
                  On-Time Delivery Rate: 85%
                </p>
              </>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}
