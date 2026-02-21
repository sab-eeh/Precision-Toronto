// src/components/ui/CarModelViewer.jsx
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  Html,
  OrbitControls,
  Environment,
  AdaptiveDpr,
  PerformanceMonitor,
} from "@react-three/drei";

// Draco decoder path (only sets config, doesn't download yet)
useGLTF.setDecoderPath("/draco/");

const MODEL_SETTINGS = Object.freeze({
  sedan: { scale: 85, y: -0.8 },
  suv1: { scale: 0.8, y: -1.2 },
  suv2: { scale: 0.23, y: -0.2 },
  coupe: { scale: 80, y: -0.8 },
  truck: { scale: 6.4, y: -1 },
});

const Loader = React.memo(function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center text-white bg-black/50 p-4 rounded-lg">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mb-3" />
        <p className="text-sm">Loading…</p>
      </div>
    </Html>
  );
});

// Forces canvas re-render only when needed
function InvalidateOnFrame({ active }) {
  const { invalidate } = useThree();
  useFrame(() => {
    if (active) invalidate();
  });
  return null;
}

const CarModel = React.memo(function CarModel({
  modelPath,
  modelType,
  rotate = true,
}) {
  const meshRef = useRef();
  const { scene } = useGLTF(modelPath);

  const { scale, y } = useMemo(
    () => MODEL_SETTINGS[String(modelType || "").toLowerCase()] || { scale: 1, y: 0 },
    [modelType]
  );

  useEffect(() => {
    scene.scale.setScalar(scale);
    scene.position.set(0, y, 0);

    // Light optimization: stop frustum popping for scaled meshes
    scene.traverse((o) => {
      if (o.isMesh) {
        o.frustumCulled = false;
      }
    });
  }, [scene, scale, y]);

  useFrame(({ clock }) => {
    if (!rotate) return;
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * 0.4;
    }
  });

  return <primitive ref={meshRef} object={scene} />;
});

function CarModelViewer({ modelPath, modelType, quality = "auto" }) {
  const [isInteracting, setIsInteracting] = useState(false);

  // DPR depends on quality + connection
  const maxDpr = useMemo(() => {
    const c =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    const slow =
      c?.saveData ||
      (c?.effectiveType && /(2g|slow-2g)/i.test(c.effectiveType || ""));

    if (quality === "low") return 1.1;
    if (quality === "high") return slow ? 1.5 : 2.25;
    // auto
    return slow ? 1.25 : 2;
  }, [quality]);

  // IMPORTANT: demand mode = huge performance gain
  // We'll invalidate while rotating OR user interacting
  const shouldAnimate = true; // keep rotation for premium look

  return (
    <div className="w-full h-72 rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [3, 2, 5], fov: 45 }}
        dpr={[1, maxDpr]}
        frameloop="demand"
        shadows={false}
        gl={{
          antialias: quality !== "low",
          powerPreference: "high-performance",
          alpha: true,
          stencil: false,
          depth: true,
          failIfMajorPerformanceCaveat: true,
        }}
        onPointerDown={() => setIsInteracting(true)}
        onPointerUp={() => setIsInteracting(false)}
        onPointerLeave={() => setIsInteracting(false)}
      >
        <PerformanceMonitor>
          <AdaptiveDpr pixelated />
        </PerformanceMonitor>

        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />

        <Suspense fallback={<Loader />}>
          <Environment preset="city" />
          <CarModel modelPath={modelPath} modelType={modelType} rotate={shouldAnimate} />
        </Suspense>

        {/* Controls: keep disabled for performance.
            If you want enable rotate drag, set enableRotate true. */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />

        <InvalidateOnFrame active={shouldAnimate || isInteracting} />
      </Canvas>
    </div>
  );
}

export default React.memo(CarModelViewer);
