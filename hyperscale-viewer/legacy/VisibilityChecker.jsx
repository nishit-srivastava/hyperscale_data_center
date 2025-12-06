import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

export default function VisibilityChecker({ machineMeshesRef }) {
  const { camera, scene } = useThree();
  const frustum = useRef(new THREE.Frustum());
  const matrix = useRef(new THREE.Matrix4());
  const raycaster = useRef(new THREE.Raycaster());
  const lastCheck = useRef(0);

  useFrame(() => {
    const now = Date.now();
    // Throttle to ~6 times per second
    if (now - lastCheck.current < 160) return;
    lastCheck.current = now;

    // Update frustum from current camera
    frustum.current.setFromProjectionMatrix(
      new THREE.Matrix4().multiplyMatrices(
        camera.projectionMatrix,
        matrix.current.copy(camera.matrixWorldInverse)
      )
    );

    const visibleNames = [];
    const TARGET = 'Generic Models 2 Generic Models 2 [613203]001';

    for (const mesh of machineMeshesRef.current) {
      const name = mesh.userData.name || mesh.name || mesh.userData.prefix;
      if (!name) continue;

      // Get or compute world center of the machine
      let worldCenter;
      const boundsCache = new WeakMap();
      if (boundsCache.has(mesh)) {
        worldCenter = boundsCache.get(mesh);
      } else {
        const box = new THREE.Box3().setFromObject(mesh);
        worldCenter = new THREE.Vector3();
        box.getCenter(worldCenter);
        boundsCache.set(mesh, worldCenter);
      }

      // 🔍 Frustum culling: is the machine in view cone?
      const sphere = new THREE.Sphere(worldCenter, 0.1); // small radius for point-like test
      if (!frustum.current.intersectsSphere(sphere)) {
        continue;
      }

      // 📏 Distance check (skip far away objects)
      const dist = camera.position.distanceTo(worldCenter);
      if (dist > 80) continue; // adjust based on your model size

      // 👁️ Raycast to check occlusion
      const direction = worldCenter.clone().sub(camera.position).normalize();
      raycaster.current.set(camera.position, direction);
      raycaster.current.far = dist + 0.05; // don't look beyond the machine

      // ⚠️ Use `false` for non-recursive (critical for performance!)
      const intersects = raycaster.current.intersectObjects(
        scene.children,
        false
      );

      let isVisible = false;

      if (intersects.length === 0) {
        // Nothing in the way → visible (e.g., open space)
        isVisible = true;
      } else {
        // Check if the FIRST object hit is this machine (or its child)
        const firstHit = intersects[0].object;
        if (
          firstHit === mesh ||
          (mesh.isDescendantOf && mesh.isDescendantOf(firstHit)) ||
          (firstHit.isDescendantOf && firstHit.isDescendantOf(mesh))
        ) {
          isVisible = true;
        }
      }

      if (isVisible) {
        visibleNames.push(name);
      }
    }

    // Only log when target machine's visibility changes
    const isTargetVisible = visibleNames.includes(TARGET);
    const wasVisible = VisibilityChecker.wasTargetVisible || false;

    if (isTargetVisible !== wasVisible) {
      // console.log(
      //   isTargetVisible
      //     ? TARGET + ' is visible'
      //     : '❌ Target machine is NOT visible'
      // );
      VisibilityChecker.wasTargetVisible = isTargetVisible;
    }
  });

  return null;
}
