import React, { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Preload, Html, useProgress } from "@react-three/drei";

// ✅ Predefined model settings
const modelSettings = {
  sedan: { scale: 85, y: -0.8 },
  suv: { scale: 0.25, y: -0.2 },
  coupe: { scale: 80, y: -0.8 },
  truck: { scale: 6.2, y: -1 },
};

// ✅ Loader component
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-3"></div>
        <p className="text-sm">{progress.toFixed(0)}% loaded</p>
      </div>
    </Html>
  );
}

function CarModel({ modelPath, modelType }) {
  const { scene } = useGLTF(modelPath);
  const meshRef = useRef();

  // ✅ Memoize scale/position
  const { scale, y } = useMemo(
    () => modelSettings[modelType?.toLowerCase()] || { scale: 1, y: 0 },
    [modelType]
  );

  // ✅ Smooth rotation
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * 0.4;
    }
  });

  // ✅ Apply transforms once
  useMemo(() => {
    scene.scale.set(scale, scale, scale);
    scene.position.set(0, y, 0);
  }, [scene, scale, y]);

  return <primitive ref={meshRef} object={scene} />;
}

function CarModelViewer({ modelPath, modelType }) {
  return (
    <div className="w-full h-72 rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [3, 2, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        {/* ✅ Lighting optimized */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />

        {/* ✅ Loader shown while Suspense waits */}
        <Suspense fallback={<Loader />}>
          <CarModel modelPath={modelPath} modelType={modelType} />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default React.memo(CarModelViewer);
