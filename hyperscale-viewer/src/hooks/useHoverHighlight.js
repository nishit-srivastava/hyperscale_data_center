import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function useHoverHighlight(meshesRef, hoveredPrefix) {
  useEffect(() => {
    const highlightColor = new THREE.Color('yellow');
    const meshes = meshesRef.current || [];

    meshes.forEach((mesh) => {
      const matches = hoveredPrefix && mesh.userData?.prefix === hoveredPrefix;

      if (matches && !mesh.userData._isHighlighted) {
        const clone = mesh.material.clone();
        clone.emissive = highlightColor;
        clone.emissiveIntensity = 1.6;
        mesh.userData._highlightClone = clone;
        mesh.material = clone;
        mesh.userData._isHighlighted = true;
      } else if (!matches && mesh.userData._isHighlighted) {
        if (mesh.userData.originalMaterial) {
          mesh.material = mesh.userData.originalMaterial;
        }
        delete mesh.userData._isHighlighted;
        delete mesh.userData._highlightClone;
      }
    });

    return () => {
      // Optional: cleanup on unmount already handled in useMachineMeshes
    };
  }, [hoveredPrefix, meshesRef]);
}
