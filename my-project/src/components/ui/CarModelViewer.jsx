import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Html,
  OrbitControls,
  Environment,
  AdaptiveDpr,
  PerformanceMonitor,
} from "@react-three/drei";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { useInView } from "react-intersection-observer";

/* ---------------- MODEL SETTINGS ---------------- */

const MODEL_SETTINGS = Object.freeze({
  coupe: { scale: 69, y: -0.8 },
  sedan: { scale: 72, y: -0.8 },
  suv1: { scale: 0.69, y: -1 },
  suv2: { scale: 60, y: -0.8 },
  truck: { scale: 5.7, y: -1 },
});

/* ---------------- Loader UI ---------------- */

const Loader = React.memo(() => (
  <Html center>
    <div className="flex flex-col items-center justify-center text-white bg-black/50 p-4 rounded-lg">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mb-3" />
      <p className="text-sm">Loading…</p>
    </div>
  </Html>
));

/* ---------------- Frame invalidator ---------------- */

function InvalidateOnFrame({ active }) {
  const { invalidate } = useThree();

  useFrame(() => {
    if (active) invalidate();
  });

  return null;
}

/* ---------------- Custom GLTF Loader ---------------- */

function useOptimizedGLTF(path) {
  const { gl } = useThree();
  const [scene, setScene] = useState(null);

  useEffect(() => {
    const loader = new GLTFLoader();

    /* DRACO */
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    loader.setDRACOLoader(dracoLoader);

    /* KTX2 */
    const ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath("/basis/");
    ktx2Loader.detectSupport(gl);
    loader.setKTX2Loader(ktx2Loader);

    loader.setMeshoptDecoder(MeshoptDecoder);

    loader.load(path, (gltf) => {
      setScene(gltf.scene);
    });

    return () => {
      dracoLoader.dispose();
      ktx2Loader.dispose();
    };
  }, [path, gl]);

  return scene;
}

/* ---------------- Car Model ---------------- */

const CarModel = React.memo(({ modelPath, modelType, rotate = true }) => {
  const meshRef = useRef();
  const scene = useOptimizedGLTF(modelPath);

  const { scale, y } = useMemo(() => {
    return (
      MODEL_SETTINGS[String(modelType || "").toLowerCase()] || {
        scale: 1,
        y: 0,
      }
    );
  }, [modelType]);

  useEffect(() => {
    if (!scene) return;

    scene.scale.setScalar(scale);
    scene.position.set(0, y, 0);

    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = false;
        obj.receiveShadow = false;
      }
    });

    return () => {
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();

        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    };
  }, [scene, scale, y]);

  useFrame(({ clock }) => {
    if (!rotate || !meshRef.current) return;

    meshRef.current.rotation.y = clock.elapsedTime * 0.35;
  });

  if (!scene) return null;

  return <primitive ref={meshRef} object={scene} />;
});

/* ---------------- Viewer ---------------- */

function CarModelViewer({ modelPath, modelType, quality = "auto" }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "200px",
  });

  const [isInteracting, setIsInteracting] = useState(false);

  const maxDpr = useMemo(() => {
    const c =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    const slow =
      c?.saveData ||
      (c?.effectiveType && /(2g|slow-2g)/i.test(c.effectiveType));

    if (quality === "low") return 1.1;
    if (quality === "high") return slow ? 1.5 : 2.25;

    return slow ? 1.25 : 2;
  }, [quality]);

  const shouldAnimate = !isInteracting;

  return (
    <div ref={ref} className="w-full h-72 rounded-xl overflow-hidden">
      {inView && (
        <Canvas
          camera={{ position: [3, 2, 5], fov: 45 }}
          dpr={[1, maxDpr]}
          frameloop="demand"
          shadows={false}
          gl={{
            antialias: quality !== "low",
            powerPreference: "default",
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

          <ambientLight intensity={0.7} />
          <directionalLight position={[8, 10, 5]} intensity={0.9} />

          <Suspense fallback={<Loader />}>
            <Environment preset="city" />

            <CarModel
              modelPath={modelPath}
              modelType={modelType}
              rotate={shouldAnimate}
            />
          </Suspense>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
          />

          <InvalidateOnFrame active={shouldAnimate || isInteracting} />
        </Canvas>
      )}
    </div>
  );
}

export default React.memo(CarModelViewer);
