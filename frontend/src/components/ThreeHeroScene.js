"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, MeshTransmissionMaterial, Float, Lightformer } from "@react-three/drei";
import * as THREE from 'three';

function MainProduct() {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Extremely subtle, slow rotation. No continuous bouncing or physics calculations
      meshRef.current.rotation.y += delta * 0.05;
      meshRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    // Barely noticeable float for organic feel, no heavy bounce
    <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2} floatingRange={[-0.1, 0.1]}>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1.5, 0.4, 128, 32]} />
        <MeshTransmissionMaterial 
          samples={4}
          thickness={0.5}
          roughness={0.05}
          transmission={1}
          ior={1.2}
          color="#FFFFF0"
        />
      </mesh>
    </Float>
  );
}

export default function ThreeHeroScene() {
  return (
    <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 40 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 1.5]} // Optimized DPR for performance
      >
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} color="#FFFFF0" />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} color="#F7E7CE" />
        
        <MainProduct />
        
        <Environment resolution={128}>
          <group rotation={[-Math.PI / 4, 0, 0]}>
            <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
          </group>
        </Environment>
      </Canvas>
    </div>
  );
}
