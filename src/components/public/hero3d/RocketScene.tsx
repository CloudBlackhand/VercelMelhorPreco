"use client";

import { useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Rocket } from "./Rocket";
import { FallingStarField } from "./FallingStarField";

type RocketSceneProps = {
  progress: MutableRefObject<number>;
  boost: MutableRefObject<number>;
  
  active: boolean;
  
  compact?: boolean;
};

function Planet({
  position,
  color,
  size,
  speed = 0.05,
  segments = 16,
}: {
  position: [number, number, number];
  color: string;
  size: number;
  speed?: number;
  segments?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed;
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, segments, segments]} />
      <meshStandardMaterial color={color} roughness={0.85} metalness={0.1} flatShading />
    </mesh>
  );
}

function SceneContents({
  progress,
  boost,
  compact,
}: {
  progress: MutableRefObject<number>;
  boost: MutableRefObject<number>;
  compact: boolean;
}) {
  const { camera } = useThree();

  useFrame(() => {
    const p = progress.current;
    camera.position.y = p * 1.8;
    camera.position.z = 6 - p * 0.4;
    camera.lookAt(0, p * 1.8 + 0.5, 0);
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 4]} intensity={1.15} />
      <pointLight position={[0, -1.2, 2.2]} intensity={1.4} color="#fb923c" distance={9} />

      <FallingStarField compact={compact} progress={progress} />

      <Planet
        position={compact ? [-2.8, 2.2, -6] : [-3.9, 2.7, -6.5]}
        color="#0ea5e9"
        size={compact ? 0.72 : 0.95}
        speed={0.05}
        segments={compact ? 10 : 16}
      />
      <Planet
        position={compact ? [3, -2.1, -7] : [4.1, -2.6, -7.5]}
        color="#6366f1"
        size={compact ? 0.95 : 1.25}
        speed={0.04}
        segments={compact ? 10 : 16}
      />

      <Rocket progress={progress} boost={boost} />
    </>
  );
}


export function RocketScene({ progress, boost, active, compact = false }: RocketSceneProps) {
  return (
    <Canvas
      dpr={compact ? 1 : [1, 1.25]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 6], fov: compact ? 54 : 50 }}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: compact ? "low-power" : "default",
        stencil: false,
        depth: true,
      }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#070b1c"]} />
      <fog attach="fog" args={["#070b1c", 9, 24]} />
      <SceneContents progress={progress} boost={boost} compact={compact} />
    </Canvas>
  );
}
