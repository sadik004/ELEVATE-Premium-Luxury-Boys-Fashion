"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function ParticleWave({ typingIntensity }) {
  const pointsRef = useRef();
  
  const count = 120; // 14,400 particles for high density
  const positions = useMemo(() => {
    const pos = new Float32Array(count * count * 3);
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        const idx = (i * count + j) * 3;
        pos[idx] = (i - count / 2) * 0.15; // x
        pos[idx + 1] = (j - count / 2) * 0.15; // y
        pos[idx + 2] = 0; // z
      }
    }
    return pos;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const positions = pointsRef.current.geometry.attributes.position.array;
    
    // Typing dramatically increases wave chaos and speed
    const speed = 0.5 + typingIntensity * 4.0; 
    const amplitude = 1.0 + typingIntensity * 2.0;

    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        const idx = (i * count + j) * 3;
        const x = positions[idx];
        const y = positions[idx + 1];
        
        // Fluid noise-like mathematical wave
        positions[idx + 2] = 
          Math.sin(x * 1.5 + time * speed) * 0.3 * amplitude + 
          Math.cos(y * 1.2 + time * speed * 0.8) * 0.3 * amplitude +
          Math.sin((x * x + y * y) * 0.1 - time * speed) * 0.2 * amplitude;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Cinematic camera angle adjustments
    pointsRef.current.rotation.x = -Math.PI / 2.5; // Look down at the wave
    pointsRef.current.rotation.z = time * 0.05 * speed; // Slowly spin the entire galaxy
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#F7E7CE" // Champagne gold
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
        blending={THREE.NormalBlending}
      />
    </Points>
  );
}

export default function LoginBackground({ intensity = 0 }) {
  return (
    <div className="absolute inset-0 z-0 bg-luxury-pearl overflow-hidden pointer-events-none">
      <Canvas camera={{ position: [0, 3, 6], fov: 60 }}>
        {/* Soft fog fades out particles in the distance */}
        <fog attach="fog" args={["#F8F6F0", 3, 12]} />
        <ParticleWave typingIntensity={intensity} />
      </Canvas>
      {/* Light vignette overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#F8F6F0_100%)] pointer-events-none opacity-80" />
    </div>
  );
}
