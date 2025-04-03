import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Trail, Float, MeshDistortMaterial } from '@react-three/drei';
import { Vector3, Color } from 'three';

interface OrbProps {
  position: [number, number, number];
  color: string;
  scale?: number;
  speed?: number;
  distort?: number;
}

const CosmicOrb: React.FC<OrbProps> = ({ position, color, scale = 1, speed = 0.5, distort = 0.5 }) => {
  const ref = useRef<THREE.Mesh>(null!);
  const colorObj = useMemo(() => new Color(color), [color]);
  
  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.getElapsedTime();
      ref.current.position.x = position[0] + Math.sin(time * speed) * 2;
      ref.current.position.y = position[1] + Math.cos(time * speed) * 2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={2} floatIntensity={4}>
      <Trail 
        width={8} 
        color={colorObj} 
        length={8} 
        decay={1}
        attenuation={(width) => width}
      >
        <Sphere ref={ref} args={[scale, 32, 32]} position={position}>
          <MeshDistortMaterial 
            color={color} 
            speed={3} 
            distort={distort} 
            transparent 
            opacity={0.8}
          />
        </Sphere>
      </Trail>
    </Float>
  );
};

const FluidBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-black">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.5} />
        <CosmicOrb position={[-5, 3, 0]} color="#8844ff" scale={1.2} speed={0.3} />
        <CosmicOrb position={[5, -2, -5]} color="#ff4488" scale={1.5} speed={0.4} />
        <CosmicOrb position={[0, -5, -2]} color="#44aaff" scale={1} speed={0.5} />
        <CosmicOrb position={[8, 4, -8]} color="#ffaa44" scale={2} speed={0.2} distort={0.3} />
        <CosmicOrb position={[-7, -4, -6]} color="#44ffaa" scale={1.7} speed={0.35} />
      </Canvas>
    </div>
  );
};

export default FluidBackground;
