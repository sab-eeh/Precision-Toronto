import React, { Suspense, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  Preload,
  Html,
  useProgress,
  OrbitControls,
  Environment,
} from "@react-three/drei";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

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
      <div className="flex flex-col items-center justify-center text-white bg-black/50 p-4 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-3"></div>
        <p className="text-sm">{progress.toFixed(0)}% loaded</p>
      </div>
    </Html>
  );
}

// ✅ Car Model Component
function CarModel({ modelPath, modelType, rotationSpeed = 0.4 }) {
  const meshRef = useRef();

  // ✅ Load with DRACO support
  const { scene } = useGLTF(modelPath, true, true, (loader) => {
    if (!loader.dracoLoader) {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("/draco/");
      loader.setDRACOLoader(dracoLoader);
    }
  });

  // ✅ Memoize scale/position values
  const { scale, y } = useMemo(
    () => modelSettings[modelType?.toLowerCase()] || { scale: 1, y: 0 },
    [modelType]
  );

  // ✅ Apply transforms safely
  useEffect(() => {
    scene.scale.set(scale, scale, scale);
    scene.position.set(0, y, 0);
  }, [scene, scale, y]);

  // ✅ Smooth rotation
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * rotationSpeed;
    }
  });

  return <primitive ref={meshRef} object={scene} />;
}

// ✅ Viewer Component
function CarModelViewer({ modelPath, modelType }) {
  return (
    <div className="w-full h-72 rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [3, 2, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        {/* ✅ Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />

        {/* ✅ Realistic environment */}
        <Environment preset="city" />

        {/* ✅ Loader shown while Suspense waits */}
        <Suspense fallback={<Loader />}>
          <CarModel modelPath={modelPath} modelType={modelType} />
          <Preload all />
        </Suspense>

        {/* ✅ Controls */}
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}

export default React.memo(CarModelViewer);

// ✅ Preload helper for performance
useGLTF.preload("/path/to/your/model.glb");
