import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
// import { Mesh } from "three";

function CarModel({ carType, selected }) {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (meshRef.current && selected) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const getCarGeometry = () => {
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
  };

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      {getCarGeometry()}
      <meshPhongMaterial
        color={selected ? "#FFD700" : "#1a1a1a"}
        shininess={100}
        specular="#FFD700"
      />
    </mesh>
  );
}

const Car3D = ({ carType, onSelect, selected }) => {
  return (
    <div
      className={`w-full h-64 cursor-pointer transition-all duration-500 rounded-xl overflow-hidden ${
        selected
          ? "ring-2 ring-yellow-400 shadow-xl"
          : "hover:ring-1 hover:ring-yellow-300/50"
      }`}
      onClick={() => onSelect(carType)}
    >
      <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
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

export default Car3D;
