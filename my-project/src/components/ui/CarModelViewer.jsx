import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

const modelSettings = {
  sedan: { scale: 110.5, y: -0.7 },
  suv: { scale: 0.34, y: -0.2 },
  coupe: { scale: 1, y: -0.2 },
  truck: { scale: 0.01, y: 0.1 },
};

function CarModel({ modelPath, modelType }) {
  const { scene } = useGLTF(modelPath);

  const { scale, y } = modelSettings[modelType.toLowerCase()] || {
    scale: 1,
    y: 0,
  };

  scene.scale.set(scale, scale, scale);
  scene.position.set(0, y, 0);
  scene.rotation.y = Math.PI;

  return <primitive object={scene} />;
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
        <OrbitControls enableZoom={false} autoRotate />
      </Canvas>
    </div>
  );
}

export default CarModelViewer;
