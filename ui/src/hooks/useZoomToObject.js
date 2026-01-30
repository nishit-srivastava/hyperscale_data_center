import { useCallback } from 'react';
import * as THREE from 'three';

export function useZoomToObject({ scene, camera, controlsRef }) {
  const zoomToObject = useCallback(
    (objectName, fitOffset = 1.5) => {
      if (!scene || !camera || !controlsRef?.current) return;

      const object = scene.getObjectByName(objectName);
      if (!object) {
        console.warn(`Object "${objectName}" not found`);
        return;
      }

      const box = new THREE.Box3().setFromObject(object);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);

      // Compute ideal distance based on object size
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 170);
      const distance =
        Math.abs(maxDim / (2 * Math.tan(fov / 2))) * fitOffset || 10;

      const offset = new THREE.Vector3(50, 40, 150)
        .normalize()
        .multiplyScalar(distance);

      const direction = offset.clone().normalize();

      const fartherOffset = direction.multiplyScalar(2.2048);

      const newPos = center.clone().add(offset).add(fartherOffset);

      // Animate
      const startPos = camera.position.clone();
      const startTarget = controlsRef.current.target.clone();
      const duration = 1000;
      const startTime = performance.now();

      const animate = () => {
        const now = performance.now();
        const t = Math.min((now - startTime) / duration, 1);
        const ease = t * (2 - t);

        camera.position.lerpVectors(startPos, newPos, ease);
        controlsRef.current.target.lerpVectors(startTarget, center, ease);
        controlsRef.current.update();

        if (t < 1) requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    },
    [scene, camera, controlsRef]
  );

  return zoomToObject;
}
