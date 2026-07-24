"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type FallingStarFieldProps = {
  compact: boolean;
  progress: MutableRefObject<number>;
};

const COLS_DESKTOP = 16;
const COLS_MOBILE = 11;


function starX(halfW: number, cols: number, col: number, jitter = Math.random()): number {
  const colW = (2 * halfW) / cols;
  const x0 = -halfW + col * colW;
  return x0 + jitter * colW;
}

function pickCol(cols: number): number {
  return Math.floor(Math.random() * cols);
}


export function FallingStarField({ compact, progress }: FallingStarFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const { camera } = useThree();

  const count = compact ? 220 : 520;
  const cols = compact ? COLS_MOBILE : COLS_DESKTOP;
  
  const halfW = compact ? 7.2 : 10.5;
  const spanY = compact ? 20 : 28;

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      positions[i * 3] = starX(halfW, cols, col);
      positions[i * 3 + 1] = Math.random() * spanY - spanY / 2;
      positions[i * 3 + 2] = -1.5 - Math.random() * 10;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count, cols, halfW, spanY]);

  useFrame((_, delta) => {
    const pts = pointsRef.current;
    if (!pts) return;

    pts.position.y = camera.position.y;

    const p = progress.current;
    const attr = pts.geometry.attributes.position;
    const arr = attr.array as Float32Array;
    const fall = delta * (1.6 + p * 5.5);
    const bottom = -spanY / 2 - 1;
    const top = spanY / 2 + 1;

    for (let i = 0; i < count; i++) {
      const base = i * 3;
      arr[base + 1] -= fall;
      if (arr[base + 1] < bottom) {
        arr[base + 1] = top + Math.random() * 3;
        arr[base] = starX(halfW, cols, pickCol(cols));
        arr[base + 2] = -1.5 - Math.random() * 10;
      }
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        size={compact ? 0.034 : 0.044}
        color="#ffffff"
        transparent
        opacity={0.88}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
