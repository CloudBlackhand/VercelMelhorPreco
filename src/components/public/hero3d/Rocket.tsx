"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type RocketProps = {
  
  progress: MutableRefObject<number>;
  
  boost: MutableRefObject<number>;
};

const FIN_ANGLES = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];


const INITIAL_Y_ROTATION = (20 * Math.PI) / 180;


function buildFinGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.5); // topo, junto ao corpo
  shape.lineTo(0, -0.58); // desce pela borda interna (junto ao corpo)
  shape.quadraticCurveTo(0.34, -0.74, 0.58, -0.46); // varre para a ponta externa arredondada
  shape.quadraticCurveTo(0.48, -0.12, 0.08, 0.5); // curva de volta ao corpo
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.06,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 2,
  });
  geo.translate(0, 0, -0.03); // centraliza a espessura
  return geo;
}


function buildNoseGeometry() {
  const pts: THREE.Vector2[] = [
    [0.5, 0.0],
    [0.49, 0.18],
    [0.46, 0.36],
    [0.41, 0.54],
    [0.34, 0.71],
    [0.25, 0.86],
    [0.14, 0.98],
    [0.04, 1.05], // ponta levemente arredondada
  ].map(([r, h]) => new THREE.Vector2(r, h));
  return new THREE.LatheGeometry(pts, 24);
}


export function Rocket({ progress, boost }: RocketProps) {
  const group = useRef<THREE.Group>(null);
  const flame = useRef<THREE.Mesh>(null);
  const flameMat = useRef<THREE.MeshStandardMaterial>(null);
  const finGeo = useMemo(() => buildFinGeometry(), []);
  const noseGeo = useMemo(() => buildNoseGeometry(), []);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const p = progress.current;

    // 0 enquanto em repouso → 1 conforme a decolagem avança (acelera ao quadrado).
    const launch = Math.max(0, p - 0.06) / 0.94;
    const ease = launch * launch;
    const restWeight = 1 - Math.min(p / 0.18, 1); // peso do "modo repouso"

    const idleY = Math.sin(t * 1.5) * 0.09 * restWeight;
    // Repousa embaixo (decola de baixo): empuxo imediato (linear) + aceleração (quadrática),
    // saindo à frente da câmera pelo topo.
    g.position.y = -1.2 + idleY + launch * 3 + ease * 20;

    const sway = Math.sin(t * 0.9) * 0.05 * restWeight;
    g.rotation.z = sway - launch * 0.1;

    // Parallax de mouse (suave, só relevante perto do repouso).
    const influence = restWeight;
    g.position.x = THREE.MathUtils.lerp(g.position.x, state.pointer.x * 0.45 * influence, 0.05);
    g.rotation.y = THREE.MathUtils.lerp(
      g.rotation.y,
      INITIAL_Y_ROTATION + state.pointer.x * 0.35 * influence,
      0.05,
    );

    // Chama: tremular + foco no CEP + crescimento na decolagem.
    const b = boost.current;
    const flicker = Math.sin(t * 30) * 0.08 + Math.sin(t * 17) * 0.05;
    const len = 0.55 + flicker + b * 0.5 + launch * 1.8;
    if (flame.current) {
      flame.current.scale.set(0.85 + b * 0.25, Math.max(0.15, len), 0.85 + b * 0.25);
      flame.current.visible = len > 0.2;
    }
    if (flameMat.current) {
      flameMat.current.emissiveIntensity = 1.6 + b * 1.6 + ease * 2.2;
    }
  });

  return (
    <group
      ref={group}
      position={[0, -1.2, 0]}
      scale={0.5}
      rotation={[0, INITIAL_Y_ROTATION, 0]}
    >
      {/* Corpo rechonchudo (cilindro robusto), como o ícone */}
      <mesh castShadow>
        <cylinderGeometry args={[0.5, 0.5, 1.4, 24]} />
        <meshStandardMaterial color="#eef2f7" metalness={0.1} roughness={0.6} />
      </mesh>

      {/* Nariz em ogiva arredondada (amigável) */}
      <mesh geometry={noseGeo} position={[0, 0.7, 0]}>
        <meshStandardMaterial color="#2563eb" metalness={0.1} roughness={0.5} />
      </mesh>

      {/* Colar fino entre nariz e corpo */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.09, 36]} />
        <meshStandardMaterial color="#1e40af" metalness={0.15} roughness={0.5} />
      </mesh>

      {/* Janela redonda */}
      <mesh position={[0, 0.28, 0.46]}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial
          color="#bfdbfe"
          emissive="#1e3a8a"
          emissiveIntensity={0.45}
          metalness={0.4}
          roughness={0.2}
        />
      </mesh>

      {/* Aletas varridas com ponta arredondada, na base */}
      {FIN_ANGLES.map((a, i) => (
        <group key={i} rotation={[0, a, 0]}>
          <mesh geometry={finGeo} position={[0.36, -0.3, 0]}>
            <meshStandardMaterial color="#ef4444" metalness={0.1} roughness={0.55} />
          </mesh>
        </group>
      ))}

      {/* Bocal curto na base */}
      <mesh position={[0, -0.78, 0]}>
        <cylinderGeometry args={[0.28, 0.36, 0.22, 28]} />
        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.45} />
      </mesh>

      {/* Chama (triângulo arredondado, estreito) */}
      <mesh ref={flame} position={[0, -1.1, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.26, 1, 20]} />
        <meshStandardMaterial
          ref={flameMat}
          color="#fb923c"
          emissive="#f97316"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
