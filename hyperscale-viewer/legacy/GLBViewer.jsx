import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  useProgress,
  Html,
} from '@react-three/drei';
import Model from './Model';
import VisibilityChecker from './VisibilityChecker';

// Loader UI
function Loader() {
  const { progress } = useProgress();
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
  );
}

// Custom OrbitControls with external console hooks
function CustomOrbitControls({ position, target, controlsRef }) {
  const { camera } = useThree();

  // Log position and target

  // useEffect(() => {
  //   const ctr = controlsRef.current;
  //   if (!ctr) return;

  //   function onChange() {
  //     const cam = camera.position;
  //     const tar = ctr.target;

  //     console.log('Camera Position:', [cam.x, cam.y, cam.z]);
  //     console.log('Target:', [tar.x, tar.y, tar.z]);
  //   }

  //   ctr.addEventListener('change', onChange);

  //   return () => ctr.removeEventListener('change', onChange);
  // }, [camera, controlsRef]);

  useEffect(() => {
    const ctr = controlsRef.current;
    if (!ctr) return;

    // Load saved camera position on startup
    const saved = JSON.parse(localStorage.getItem('cameraPos'));
    if (saved) {
      camera.position.set(...saved);
    } else {
      camera.position.fromArray(position);
    }

    ctr.update();

    // Create global API
    window.GLBViewerAPI = window.GLBViewerAPI || {};

    window.GLBViewerAPI.setCamera = (pos) => {
      camera.position.set(...pos);
      ctr.update();
      localStorage.setItem('cameraPos', JSON.stringify(pos));
    };

    window.GLBViewerAPI.getCamera = () => {
      const p = [camera.position.x, camera.position.y, camera.position.z];
      console.log('Camera:', p);
      return p;
    };

    window.GLBViewerAPI.saveCamera = () => {
      const p = [camera.position.x, camera.position.y, camera.position.z];
      localStorage.setItem('cameraPos', JSON.stringify(p));
      console.log('Saved:', p);
    };

    window.GLBViewerAPI.loadCamera = () => {
      const saved = JSON.parse(localStorage.getItem('cameraPos'));
      if (saved) {
        camera.position.set(...saved);
        ctr.update();
        console.log('Loaded:', saved);
      }
    };

    // Zoom object callback
    window.GLBViewerAPI.zoomTo = (name) => {
      zoomFn(name);

      // Save camera position after zoom
      // setTimeout(() => {
      //   const p = [
      //     controlsRef.current.object.position.x,
      //     controlsRef.current.object.position.y,
      //     controlsRef.current.object.position.z
      //   ];
      //   localStorage.setItem("cameraPos", JSON.stringify(p));
      //   console.log("Zoom + Saved:", p);
      // }, 300);
    };

    window.GLBViewerAPI.getTarget = () => {
      const t = controlsRef.current.target;
      const pos = [t.x, t.y, t.z];
      console.log('Target:', pos);
      return pos;
    };

    window.GLBViewerAPI.setTarget = (pos) => {
      const ctr = controlsRef.current;
      ctr.target.set(...pos);
      ctr.update();
      console.log('Target Set:', pos);
    };
    if (target) {
      GLBViewerAPI.setTarget(target);
    } else {
      GLBViewerAPI.setTarget([144, 1.25, -157]);
    }
  }, []);

  return (
    <OrbitControls
      position={[142, 72, -215]}
      initialTarget={[144, 1.25, -157]}
      ref={controlsRef}
    />
  );
}

export default function GLBViewer({
  glb,
  cameraPosition,
  setModelClick,
  setViewChanged,
  target,
  showHTML,
}) {
  const machineMeshesRef = useRef([]);
  const controlsRef = useRef();
  const zoomRef = useRef(null);

  const handleZoomReady = (zoomFn) => {
    zoomRef.current = zoomFn;
  };

  const handleZoomClick = () => {
    if (zoomRef.current) {
      zoomRef.current('Object079');
    }
  };

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
          position={cameraPosition}
          target={target}
          controlsRef={controlsRef}
          initialTarget={[144, 1.25, -157]}
        />

        <VisibilityChecker machineMeshesRef={machineMeshesRef} />
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
          opacity: 0.5,
        }}
      >
        ⨁
      </button>
    </div>
  );
}
