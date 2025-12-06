import { useState, useRef, useCallback } from 'react';

export function useModelInteraction(setModelClick) {
  const [hoveredPrefix, setHoveredPrefix] = useState(null);
  const [showInfo, setShowInfo] = useState(true);
  const pointerStart = useRef({ x: 0, y: 0 });

  const onPointerDown = useCallback((e) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
  }, []);

  const isClick = useCallback((e) => {
    const dx = Math.abs(e.clientX - pointerStart.current.x);
    const dy = Math.abs(e.clientY - pointerStart.current.y);
    return dx < 4 && dy < 4;
  }, []);

  const onPointerMove = useCallback((e) => {
    const hit = e.intersections?.[0];
    const prefix = hit?.object?.userData?.prefix;
    setHoveredPrefix(prefix || null);
  }, []);

  const onPointerOut = useCallback(() => {
    setHoveredPrefix(null);
  }, []);

  const onPointerUp = useCallback(
    (e) => {
      if (!isClick(e)) return;
      const hit = e.intersections?.[0];
      const name = hit?.object?.userData?.name;
      if (name) {
        setModelClick(name);
        // console.log(name);
      }
    },
    [isClick, setModelClick]
  );

  return {
    hoveredPrefix,
    showInfo,
    setShowInfo,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerOut,
  };
}
