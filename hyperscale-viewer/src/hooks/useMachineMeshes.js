import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function useMachineMeshes(scene, machineMeshesRef) {
  useEffect(() => {
    if (!scene || !machineMeshesRef) return;

    const cleanup = [];
    const machines = [];

    const processObject = (obj) => {
      if (!obj.isMesh) return;

      // Store original material once
      if (!obj.userData.originalMaterial) {
        obj.userData.originalMaterial = obj.material;
      }

      // Compute prefix/name
      const name = obj.name || obj.userData?.name || obj.uuid;
      const prefix =
        typeof name === 'string' && name.includes('_')
          ? name.split('_')[0]
          : name;
      obj.userData.prefix = prefix;
      obj.userData.name = name;

      // Skip generic "Cube" objects
      if (prefix && !prefix.startsWith('Cube')) {
        machines.push(obj);
      }

      cleanup.push(obj);
    };

    scene.traverse(processObject);
    machineMeshesRef.current = machines;

    return () => {
      cleanup.forEach((obj) => {
        if (obj.userData.originalMaterial) {
          obj.material = obj.userData.originalMaterial;
          delete obj.userData._isHighlighted;
          delete obj.userData._highlightClone;
        }
      });
    };
  }, [scene, machineMeshesRef]);
}
