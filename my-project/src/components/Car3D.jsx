import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  AdaptiveDpr,
  PerformanceMonitor,
} from "@react-three/drei";

const MATERIAL_SELECTED = {
  color: "#FFD700",
  shininess: 100,
  specular: "#FFD700",
};
const MATERIAL_DEFAULT = {
  color: "#1a1a1a",
  shininess: 100,
  specular: "#FFD700",
};

const CarGeometry = React.memo(function CarGeometry({ carType }) {
  // Geometry is stable/memoized to avoid re-creation
  const geometry = useMemo(() => {
    switch (carType) {
      case "sedan":
        return <boxGeometry args={[4, 1.5, 2]} />;
      case "suv":
        return <boxGeometry args={[4.5, 2, 2.2]} />;
      case "coupe":
        return <boxGeometry args={[3.8, 1.3, 1.8]} />;
      case "truck":
        return <boxGeometry args={[5.5, 2.2, 2.5]} />;
      default:
        return <boxGeometry args={[4, 1.5, 2]} />;
    }
  }, [carType]);
  return geometry;
});

const CarModel = React.memo(function CarModel({ carType, selected }) {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (meshRef.current && selected) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <CarGeometry carType={carType} />
      {/* Keep same material visual, but memo props */}
      <meshPhongMaterial
        {...(selected ? MATERIAL_SELECTED : MATERIAL_DEFAULT)}
      />
    </mesh>
  );
});

const Car3D = ({ carType, onSelect, selected }) => {
  const maxDpr = React.useMemo(() => {
    const c =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    const slow =
      c?.saveData ||
      (c?.effectiveType && /(2g|slow-2g)/i.test(c.effectiveType || ""));
    return slow ? 1.25 : 2;
  }, []);

  return (
    <div
      className={`w-full h-64 cursor-pointer transition-all duration-500 rounded-xl overflow-hidden ${
        selected
          ? "ring-2 ring-yellow-400 shadow-xl"
          : "hover:ring-1 hover:ring-yellow-300/50"
      }`}
      onClick={() => onSelect(carType)}
    >
      <Canvas
        camera={{ position: [0, 2, 8], fov: 45 }}
        dpr={[1, maxDpr]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
          stencil: false,
          depth: true,
          failIfMajorPerformanceCaveat: true,
        }}
        // If not selected, we still want gentle motion via autoRotate (controls)
        frameloop="always"
        shadows={false}
      >
        <PerformanceMonitor>
          <AdaptiveDpr pixelated />
        </PerformanceMonitor>

        <ambientLight intensity={0.3} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          color="#FFD700"
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#ffffff" />

        <CarModel carType={carType} selected={selected} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!selected}
          autoRotateSpeed={1}
        />
      </Canvas>
    </div>
  );
};

export default React.memo(Car3D);
