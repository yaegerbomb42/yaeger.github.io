import React, { useRef, useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { Canvas, useFrame } from "@react-three/fiber";
import { useSpring, animated } from "@react-spring/three";
import { MathUtils, ShaderMaterial, Vector3 } from "three";
import { Content, ContentType, contentTypeVisuals } from "utils/content-types";

// Legacy ContentSphere with framer-motion for fallback
interface LegacyProps {
  title: string;
  color: string;
  delay?: number;
  size?: number;
  onClick?: () => void;
}

export const LegacyContentSphere: React.FC<LegacyProps> = ({ 
  title, 
  color, 
  delay = 0, 
  size = 200,
  onClick 
}) => {
  // Random offset for organic feel
  const randomOffset = Math.random() * 20 - 10;
  
  return (
    <motion.div
      className="relative cursor-pointer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        y: [randomOffset, -randomOffset, randomOffset],
      }}
      transition={{ 
        delay, 
        duration: 1, 
        y: {
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }
      }}
      whileHover={{ 
        scale: 1.1, 
        transition: { duration: 0.3 } 
      }}
      onClick={onClick}
    >
      <motion.div 
        className="absolute inset-0 rounded-full blur-xl"
        animate={{
          scale: [0.85, 1.05, 0.85],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{ 
          backgroundColor: color, 
          width: size,
          height: size,
        }}
      />
      <motion.div 
        className="rounded-full flex items-center justify-center backdrop-blur-sm"
        animate={{
          borderWidth: ["4px", "1px", "4px"],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{ 
          backgroundColor: `${color}33`, // 20% opacity
          border: `2px solid ${color}aa`, // 67% opacity
          width: size,
          height: size,
        }}
      >
        <span 
          className="text-white text-xl font-bold mix-blend-difference"
          style={{ textShadow: '0 0 8px rgba(0,0,0,0.7)' }}
        >
          {title}
        </span>
      </motion.div>
    </motion.div>
  );
};

// Shader for distorted sphere
const fragmentShader = `
  uniform float time;
  uniform vec3 color;
  uniform float distortion;
  uniform float pulseIntensity;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    // Base color with gradient
    vec3 baseColor = color;
    
    // Pulse effect
    float pulse = sin(time * 2.0) * 0.5 + 0.5;
    float pulseFactor = pulseIntensity * pulse;
    
    // Noise distortion
    float noise = sin(vPosition.x * 10.0 + time) * sin(vPosition.y * 10.0 + time) * sin(vPosition.z * 10.0 + time) * distortion;
    
    // Blend the colors
    vec3 finalColor = mix(baseColor, baseColor * 1.5, pulseFactor + noise);
    
    // Fresnel effect for edge glow
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - dot(viewDirection, vNormal), 3.0);
    finalColor = mix(finalColor, vec3(1.0), fresnel * 0.5);
    
    gl_FragColor = vec4(finalColor, 0.95);
  }
`;

const vertexShader = `
  uniform float time;
  uniform float distortion;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  // Simplex 3D Noise
  vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    // First corner
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    
    // Permutations
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        
    // Gradients
    float n_ = 1.0/7.0; // N=7
    vec3 ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
    // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
  
  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;
    
    // Apply distortion using simplex noise
    float speed = 0.2;
    float noise = snoise(vec3(position.x * 2.0, position.y * 2.0, position.z * 2.0 + time * speed)) * distortion;
    
    // Animate the vertex positions
    vec3 pos = position;
    pos += normal * noise;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

interface ContentSphereProps {
  content: Content;
  scale?: number;
  onClick?: () => void;
  isHovered?: boolean;
  isSelected?: boolean;
  position?: [number, number, number];
}

// The actual 3D sphere component
const Sphere: React.FC<ContentSphereProps> = ({
  content,
  scale = 1,
  onClick,
  isHovered = false,
  isSelected = false,
  position = [0, 0, 0]
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  
  // Get visual properties based on content type
  const visuals = contentTypeVisuals[content.type];
  
  // Convert hex color to RGB values for shader
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
  };
  
  const rgbColor = hexToRgb(visuals.baseColor);
  
  // Animation for hover and selection states
  const { sphereScale, spherePosition, bloom } = useSpring({
    sphereScale: isHovered || isSelected ? [scale * 1.1, scale * 1.1, scale * 1.1] : [scale, scale, scale],
    spherePosition: isSelected 
      ? [position[0], position[1] + 0.2, position[2]] 
      : [position[0], position[1], position[2]],
    bloom: isHovered || isSelected ? 1.0 : 0.5,
    config: { mass: 1, tension: 170, friction: 26 }
  });
  
  // Orbit animation
  useFrame(({ clock }) => {
    if (meshRef.current && materialRef.current) {
      const time = clock.getElapsedTime();
      
      // Update shader uniforms
      materialRef.current.uniforms.time.value = time;
      
      // Subtle orbit motion
      const orbitSpeed = visuals.orbitSpeed;
      const orbitRadius = 0.05;
      if (!isSelected) {
        meshRef.current.position.x = position[0] + Math.sin(time * orbitSpeed) * orbitRadius;
        meshRef.current.position.y = position[1] + Math.cos(time * orbitSpeed * 0.7) * orbitRadius;
        meshRef.current.position.z = position[2] + Math.sin(time * orbitSpeed * 0.5) * orbitRadius;
      }
      
      // Subtle rotation
      meshRef.current.rotation.x = time * 0.1;
      meshRef.current.rotation.y = time * 0.15;
    }
  });
  
  return (
    <animated.mesh 
      ref={meshRef} 
      position={spherePosition} 
      scale={sphereScale} 
      onClick={onClick}
    >
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial 
        ref={materialRef}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        transparent
        uniforms={{
          time: { value: 0 },
          color: { value: new Vector3(...rgbColor) },
          distortion: { value: visuals.distortion },
          pulseIntensity: { value: visuals.pulseIntensity }
        }}
      />
    </animated.mesh>
  );
};

// Main component with Canvas
interface Props {
  content: Content;
  showEffects?: boolean;
  className?: string;
  onClick?: () => void;
  isHovered?: boolean;
  isSelected?: boolean;
  position?: [number, number, number];
  scale?: number;
}

export const ContentSphere: React.FC<Props> = ({ 
  content, 
  showEffects = true, 
  className = "",
  ...props 
}) => {
  return (
    <div className={`relative w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Sphere content={content} {...props} />
      </Canvas>
    </div>
  );
};

// Container component for multiple content spheres
export const ContentSphereContainer: React.FC<{
  contents: Content[];
  onSelectContent?: (content: Content) => void;
  selectedContentId?: string | null;
  className?: string;
}> = ({ contents, onSelectContent, selectedContentId, className = "" }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  // Calculate positions for multiple spheres in a fluid layout
  const calculatePosition = (index: number, total: number): [number, number, number] => {
    // Create a fluid arrangement based on index
    const angleStep = (Math.PI * 2) / Math.max(total, 6);
    const radius = 5;
    const angle = angleStep * index;
    
    // Add some variation to create a more organic feel
    const xVariation = Math.sin(index * 0.5) * 0.5;
    const yVariation = Math.cos(index * 0.7) * 0.5;
    const zVariation = Math.sin(index * 0.3) * 0.2;
    
    // Calculate position on a curved plane
    const x = Math.sin(angle) * radius + xVariation;
    const y = Math.cos(angle) * radius * 0.5 + yVariation; // Flatten the circle into an oval
    const z = -2 + zVariation + (index % 3); // Varied depth
    
    return [x, y, z];
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 0, 12], fov: 75 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#5588ff" />
        
        {contents.map((content, index) => {
          const isSelected = selectedContentId === content.id;
          const isHovered = hoveredId === content.id;
          const position = calculatePosition(index, contents.length);
          
          return (
            <Sphere 
              key={content.id}
              content={content}
              position={position}
              scale={contentTypeVisuals[content.type].scale}
              isSelected={isSelected}
              isHovered={isHovered}
              onClick={() => onSelectContent?.(content)}
            />
          );
        })}
        
        {/* Removed EffectComposer for deployment compatibility */}
      </Canvas>
    </div>
  );
};
