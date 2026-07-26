"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type FallingStarFieldProps = {
  compact: boolean;
  progress: MutableRefObject<number>;
};

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function FallingStarField({ compact, progress }: FallingStarFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const { camera } = useThree();

  // Mais estrelas e um volume maior que a tela para nunca deixar o fundo azul escuro aparecer.
  const count = compact ? 520 : 1100;
  const halfW = compact ? 11 : 18;
  const spanY = compact ? 14 : 18;
  const depthFar = 18;

  const { geometry, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = rand(-halfW, halfW);     // x
      positions[i * 3 + 1] = rand(-spanY / 2, spanY / 2); // y
      positions[i * 3 + 2] = rand(-1.5, -depthFar); // z
      s[i] = rand(0.45, 1.55);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { geometry: geo, speeds: s };
  }, [count, halfW, spanY, depthFar]);

  useFrame((_, delta) => {
    const pts = pointsRef.current;
    if (!pts) return;

    pts.position.y = camera.position.y;

    const p = progress.current;
    const attr = pts.geometry.attributes.position;
    const arr = attr.array as Float32Array;
    const fallBase = delta * (1.4 + p * 4.2);
    const bottom = -spanY / 2 - 2;
    const top = spanY / 2 + 1;
    const respawnRange = spanY * 0.45;

    for (let i = 0; i < count; i++) {
      const base = i * 3;
      arr[base + 1] -= fallBase * speeds[i];
      if (arr[base + 1] < bottom) {
        // Respawn acima da tela para manter o fluxo continuo, sem pulos visiveis.
        arr[base + 1] = top + Math.random() * respawnRange;
        arr[base] = rand(-halfW, halfW);
        arr[base + 2] = rand(-1.5, -depthFar);
      }
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        size={compact ? 0.042 : 0.055}
        color="#ffffff"
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
        fog={false}
      />
    </points>
  );
}
