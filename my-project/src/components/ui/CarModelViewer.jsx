import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

const modelSettings = {
  sedan: { scale: 94, y: -0.8 },
  suv: { scale: 0.28, y: -0.2 },
  coupe: { scale: 0.78, y: -0.2 },
  truck: { scale: 7, y: -1},
};

function CarModel({ modelPath, modelType }) {
  const { scene } = useGLTF(modelPath);
  const meshRef = useRef();

  const { scale, y } = modelSettings[modelType.toLowerCase()] || {
    scale: 1,
    y: 0,
  };

  // Continuous rotation only on Y-axis
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01; // horizontal spin
      meshRef.current.rotation.x = 0;     // lock tilt
      meshRef.current.rotation.z = 0;     // lock tilt
    }
  });

  scene.scale.set(scale, scale, scale);
  scene.position.set(0, y, 0);

  return <primitive ref={meshRef} object={scene} />;
}

function CarModelViewer({ modelPath, modelType }) {
  return (
    <div className="w-full h-72 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [3, 2, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={null}>
          <CarModel modelPath={modelPath} modelType={modelType} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default CarModelViewer;
