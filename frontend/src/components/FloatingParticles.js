"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function Dust() {
  const pointsRef = useRef();
  
  const count = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40; // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15; // z
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Extremely slow, cinematic drift with subtle time-based wave
      pointsRef.current.rotation.y += delta * 0.01;
      pointsRef.current.rotation.x += delta * 0.005;
      pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.5;
      
      // 4D Dynamic breathing scale for the entire dust system
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      pointsRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#D4C3A3"
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.3}
        blending={THREE.NormalBlending}
      />
    </Points>
  );
}

export default function FloatingParticles() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <Dust />
      </Canvas>
    </div>
  );
}
