import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  Preload,
  Html,
  OrbitControls,
  Environment,
  AdaptiveDpr,
  PerformanceMonitor,
} from "@react-three/drei";

// ---- Global DRACO + Preloads (run once per module) ----
useGLTF.setDecoderPath("/draco/");

const MODEL_SETTINGS = Object.freeze({
  sedan: { scale: 85, y: -0.8 },
  suv: { scale: 0.25, y: -0.2 },
  coupe: { scale: 80, y: -0.8 },
  truck: { scale: 6.2, y: -1 },
});

const ALL_MODELS = [
  "/models/sedan/scene.gltf",
  "/models/suv/scene.gltf",
  "/models/coupe/scene.gltf",
  "/models/truck/scene.gltf",
];
ALL_MODELS.forEach((p) => useGLTF.preload(p));

// ---- Loader (pure, lightweight) ----
const Loader = React.memo(function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center text-white bg-black/50 p-4 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-3"></div>
        <p className="text-sm">Loading…</p>
      </div>
    </Html>
  );
});

// ---- Car Model (optimized transforms + smooth rotation) ----
const CarModel = React.memo(function CarModel({
  modelPath,
  modelType,
  rotationSpeed = 0.4,
}) {
  const meshRef = useRef();
  const { scene } = useGLTF(modelPath);
  const { scale, y } = useMemo(
    () => MODEL_SETTINGS[modelType?.toLowerCase()] || { scale: 1, y: 0 },
    [modelType]
  );

  // Apply transforms exactly once when deps change
  useEffect(() => {
    scene.scale.setScalar(scale);
    scene.position.set(0, y, 0);
    // Ensure frustumCulled false for big scaled assets that might pop
    scene.traverse((o) => {
      if (o.isMesh) o.frustumCulled = false;
    });
  }, [scene, scale, y]);

  useFrame(({ clock }) => {
    if (meshRef.current)
      meshRef.current.rotation.y = clock.elapsedTime * rotationSpeed;
  });

  return <primitive ref={meshRef} object={scene} />;
});

// ---- Viewer ----
function CarModelViewer({ modelPath, modelType }) {
  // Connection-aware DPR upper bound
  const maxDpr = useMemo(() => {
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
    <div className="w-full h-72 rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [3, 2, 5], fov: 45 }}
        dpr={[1, maxDpr]}
        // Keep visuals nice but lean:
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
          stencil: false,
          depth: true,
          failIfMajorPerformanceCaveat: true,
        }}
        // Rotation requires frames; keep always to retain smoothness
        frameloop="always"
        shadows={false}
      >
        <PerformanceMonitor
          onDecline={() => {
            /* DPR auto-adjusts via AdaptiveDpr */
          }}
        >
          <AdaptiveDpr pixelated />
        </PerformanceMonitor>

        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />

        {/* Realistic environment */}
        <Suspense fallback={<Loader />}>
          <Environment preset="city" />
          <CarModel modelPath={modelPath} modelType={modelType} />
          <Preload all />
        </Suspense>

        {/* Controls (same UX) */}
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}

export default React.memo(CarModelViewer);
