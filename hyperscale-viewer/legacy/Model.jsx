import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useGLTF } from '@react-three/drei';
import { useMachineMeshes } from '../../hooks/useMachineMeshes';
import { useHoverHighlight } from '../../hooks/useHoverHighlight';
import { useZoomToObject } from '../../hooks/useZoomToObject';
import { useModelInteraction } from '../../hooks/useModelInteraction';

export default function Model({
  glb,
  machineMeshesRef,
  setModelClick,
  controlsRef,
  setViewChanged,
  onZoomReady,
  showHTML = true,
}) {
  const { scene } = useGLTF(glb);
  const { camera } = useThree();

  useMachineMeshes(scene, machineMeshesRef);
  const meshesRef = useRef([]);
  useRef(() => {
    if (scene) {
      meshesRef.current = [];
      scene.traverse((obj) => obj.isMesh && meshesRef.current.push(obj));
    }
  }, [scene]);

  const {
    hoveredPrefix,
    showInfo,
    setShowInfo,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerOut,
  } = useModelInteraction(setModelClick);
  useHoverHighlight(meshesRef, hoveredPrefix);

  const zoomToObject = useZoomToObject({ scene, camera, controlsRef });

  useEffect(() => {
    if (onZoomReady && zoomToObject) {
      onZoomReady(zoomToObject);
    }
  }, [zoomToObject, onZoomReady]);

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
          distanceFactor={40} // scales smoothly with distance
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
              setViewChanged({
                changed: true,
                object: 'Object079',
              });
            }}
          >
            Glazing Line 1
          </button>
        </Html>
      )}

      {/* Factory data html */}

      {showHTML && (
        <Html
          position={[160, 22, -120]}
          center
          distanceFactor={50}
          scale={10}
          occlude="raycast"
        >
          <div
            style={{
              background: 'rgba(0,0,0,0.8)',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: '8px',
              width: '200px',
              fontSize: '0.8rem',
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowInfo(!showInfo);
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
                <p style={{ marginBottom: '0px', marginTop: '15px' }}>
                  Defect Rate: 3.5%
                </p>
                <p style={{ marginBottom: '0px', marginTop: '15px' }}>
                  On-Time Delivery Rate: 85%
                </p>
              </>
            )}
            {/* {scene && (
              <button
                onClick={() =>
                  zoomToObject(
                    'Mechanical_Equipment_15_Mechanical_Equipment_15_852479001_3'
                  )
                }
                style={{
                  padding: '6px 12px',
                  background: '#4a6cf7',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                More info ...
              </button>
            )} */}
          </div>
        </Html>
      )}
    </group>
  );
}
