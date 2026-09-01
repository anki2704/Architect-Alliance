import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  UploadCloud,
  Info,
  Check,
  MapPin,
  Ruler,
  CalendarDays,
  Compass,
  Pause,
  Play,
  Building2,
} from 'lucide-react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Bounds, Center, ContactShadows, Html, useProgress, useGLTF } from '@react-three/drei';
import { OBJLoader, FBXLoader, STLLoader, ColladaLoader } from 'three-stdlib';
import * as THREE from 'three';

// ---------- Types ----------

type ModelFormat = 'glb' | 'gltf' | 'obj' | 'fbx' | 'stl' | 'dae';

interface ProjectShowcase {
  title: string;
  category: string;
  location: string;
  area: string;
  year: string;
  description: string;
  highlights: string[];
}

interface Model3DShowcaseProps {
  /** URL of a project's 3D model file. Leave empty to show the sample building. */
  modelUrl?: string;
  /** Format of modelUrl — required whenever modelUrl is set. */
  modelFormat?: ModelFormat;
  /** Project details shown in the side panel. Falls back to a sample project. */
  project?: ProjectShowcase;
  /** Only admins should see the "Load Model" upload control. Defaults to false so it's hidden by default. */
  isAdmin?: boolean;
  /** Open enquiry modal when "Enquire About This Project" is clicked. */
  onEnquire?: () => void;
}

const SUPPORTED_FORMATS: ModelFormat[] = ['glb', 'gltf', 'obj', 'fbx', 'stl', 'dae'];

const DEFAULT_PROJECT: ProjectShowcase = {
  title: 'The Meridian Residence',
  category: 'Private Residential',
  location: 'Alibaug, Maharashtra',
  area: '5,400 sq.ft',
  year: '2026',
  description:
    "A cantilevered volume in dark render and reclaimed teak, wrapped around a still reflecting pool. The upper floor floats above a fully glazed ground level, blurring the line between the living spaces and the garden below.",
  highlights: [
    'Cantilevered upper floor in reclaimed teak cladding',
    'Full-height glazing across the ground floor facade',
    'Basalt plinth with an integrated reflecting pool',
    'Passive cross-ventilation, no mechanical cooling on the ground floor',
  ],
};

// ---------- Loading fallback shown inside the canvas while a model streams in ----------

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 rounded-full border-2 border-[var(--accent-warm)] border-t-transparent animate-spin" />
        <span className="text-[10px] font-mono text-[var(--text-secondary)]">{Math.round(progress)}%</span>
      </div>
    </Html>
  );
}

// ---------- Format-specific loaders ----------

function GLTFModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function OBJModel({ url }: { url: string }) {
  const obj = useLoader(OBJLoader, url);
  return <primitive object={obj} />;
}

function FBXModel({ url }: { url: string }) {
  const fbx = useLoader(FBXLoader, url);
  return <primitive object={fbx} />;
}

function STLModel({ url }: { url: string }) {
  const geometry = useLoader(STLLoader, url);
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color="#cfc7b8" roughness={0.5} metalness={0.15} />
    </mesh>
  );
}

function DAEModel({ url }: { url: string }) {
  const collada = useLoader(ColladaLoader, url);
  return <primitive object={collada.scene} />;
}

// ---------- Soft procedural sky, so the model doesn't float in a void ----------

function SkyBackdrop() {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        // Natural daytime sky: blue zenith → soft horizon haze
        topColor: { value: new THREE.Color('#4a87c8') },
        midColor: { value: new THREE.Color('#9ec0e8') },
        bottomColor: { value: new THREE.Color('#e4eef8') },
        offset: { value: 0.2 },
        exponent: { value: 0.85 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 midColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
          h = max(h, 0.0);
          vec3 col = mix(bottomColor, midColor, smoothstep(0.0, 0.32, h));
          col = mix(col, topColor, pow(smoothstep(0.22, 1.0, h), exponent));
          gl_FragColor = vec4(col, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, []);

  return (
    <mesh renderOrder={-1}>
      <sphereGeometry args={[80, 48, 24]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

// ---------- Stylised placeholder building, shown until a real model is supplied ----------

function Shrub({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <mesh position={position} scale={scale} castShadow>
      <icosahedronGeometry args={[0.35, 1]} />
      <meshStandardMaterial color="#3c4d31" roughness={0.95} flatShading />
    </mesh>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
  const [x, , z] = position;
  return (
    <group>
      <mesh position={[x, 0.45, z]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.9, 8]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.9} />
      </mesh>
      <mesh position={[x, 1.05, z]} castShadow>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial color="#42552f" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

function PlaceholderBuilding() {
  return (
    <group>
      {/* Plaza / podium */}
      <mesh position={[0, -0.09, 0]} receiveShadow>
        <cylinderGeometry args={[4.4, 4.4, 0.18, 48]} />
        <meshStandardMaterial color="#4d493f" roughness={0.95} />
      </mesh>

      {/* Reflecting pool */}
      <mesh position={[0, 0.011, 2.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.8, 1.3]} />
        <meshStandardMaterial color="#16242c" metalness={0.55} roughness={0.08} />
      </mesh>

      {/* Entrance pathway */}
      <mesh position={[0, 0.02, 1.55]} receiveShadow>
        <boxGeometry args={[1, 0.02, 1.4]} />
        <meshStandardMaterial color="#6b6558" roughness={0.85} />
      </mesh>

      {/* Entrance steps */}
      <mesh position={[0, 0.06, 1.15]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.12, 0.4]} />
        <meshStandardMaterial color="#6b6558" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.18, 1.3]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.12, 0.3]} />
        <meshStandardMaterial color="#6b6558" roughness={0.85} />
      </mesh>

      {/* Ground floor volume */}
      <mesh position={[0, 1.1, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 2.2, 3]} />
        <meshStandardMaterial color="#201e1b" roughness={0.55} metalness={0.1} />
      </mesh>

      {/* Front glazing wall */}
      <mesh position={[0, 1.15, 1.31]}>
        <planeGeometry args={[3.4, 1.7]} />
        <meshStandardMaterial color="#a9d8ff" transparent opacity={0.3} metalness={0.9} roughness={0.05} />
      </mesh>
      <mesh position={[-0.9, 1.15, 1.32]}>
        <boxGeometry args={[0.04, 1.7, 0.02]} />
        <meshStandardMaterial color="#c9924f" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0.9, 1.15, 1.32]}>
        <boxGeometry args={[0.04, 1.7, 0.02]} />
        <meshStandardMaterial color="#c9924f" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Entrance canopy on slender columns */}
      <mesh position={[0, 2.28, 1.55]} castShadow>
        <boxGeometry args={[2.2, 0.12, 1.3]} />
        <meshStandardMaterial color="#8a6440" emissive="#5c422a" emissiveIntensity={0.15} roughness={0.5} />
      </mesh>
      <mesh position={[-0.85, 1.14, 1.85]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 2.28, 12]} />
        <meshStandardMaterial color="#c9924f" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0.85, 1.14, 1.85]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 2.28, 12]} />
        <meshStandardMaterial color="#c9924f" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Cantilevered upper volume */}
      <mesh position={[0, 2.85, 0.35]} castShadow receiveShadow>
        <boxGeometry args={[4.8, 1.2, 2.2]} />
        <meshStandardMaterial color="#7a5334" roughness={0.55} metalness={0.05} />
      </mesh>

      {/* Bronze signature datum line beneath the cantilever */}
      <mesh position={[0, 2.23, 0.35]}>
        <boxGeometry args={[4.9, 0.05, 2.3]} />
        <meshStandardMaterial color="#c9924f" emissive="#c9924f" emissiveIntensity={0.4} roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Roof parapet */}
      <mesh position={[0, 3.5, 0.35]} castShadow>
        <boxGeometry args={[5, 0.1, 2.4]} />
        <meshStandardMaterial color="#5b4530" roughness={0.6} />
      </mesh>

      {/* Rooftop skylight */}
      <mesh position={[-1.2, 3.65, 0.35]} castShadow>
        <boxGeometry args={[0.6, 0.25, 0.6]} />
        <meshStandardMaterial color="#a9d8ff" transparent opacity={0.45} metalness={0.7} roughness={0.1} />
      </mesh>

      {/* Landscaping */}
      <Shrub position={[-3.2, 0.35, 1]} />
      <Shrub position={[3.2, 0.35, -0.6]} scale={0.85} />
      <Shrub position={[-2.6, 0.3, -2]} scale={0.75} />
      <Tree position={[-3.6, 0, -1.5]} />
      <Tree position={[3.6, 0, 1.8]} />
    </group>
  );
}

// ---------- Format switch + error containment ----------

class ModelErrorBoundary extends React.Component<
  { onError: () => void; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { onError: () => void; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.error('3D model failed to load:', error);
    this.props.onError();
  }
  render() {
    if (this.state.hasError) return <PlaceholderBuilding />;
    return this.props.children;
  }
}

function ModelSwitch({ url, format }: { url: string | null; format: ModelFormat | null }) {
  if (!url || !format) return <PlaceholderBuilding />;
  switch (format) {
    case 'glb':
    case 'gltf':
      return <GLTFModel url={url} />;
    case 'obj':
      return <OBJModel url={url} />;
    case 'fbx':
      return <FBXModel url={url} />;
    case 'stl':
      return <STLModel url={url} />;
    case 'dae':
      return <DAEModel url={url} />;
    default:
      return <PlaceholderBuilding />;
  }
}

// ---------- Main component ----------

export const IsometricFloorPlanViewer: React.FC<Model3DShowcaseProps> = ({
  modelUrl,
  modelFormat,
  project = DEFAULT_PROJECT,
  isAdmin = false,
  onEnquire,
}) => {
  const [uploaded, setUploaded] = useState<{ url: string; format: ModelFormat } | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modelKey, setModelKey] = useState(0);
  const controlsRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeUrl = uploaded?.url ?? modelUrl ?? null;
  const activeFormat = uploaded?.format ?? modelFormat ?? null;

  useEffect(() => {
    return () => {
      if (uploaded) URL.revokeObjectURL(uploaded.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploaded]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !SUPPORTED_FORMATS.includes(ext as ModelFormat)) {
      setLoadError(`.${ext ?? '?'} isn't previewable directly in the browser. Export it as GLB, OBJ, FBX, STL, or DAE first.`);
      e.target.value = '';
      return;
    }
    setLoadError(null);
    setModelKey((k) => k + 1);
    if (uploaded) URL.revokeObjectURL(uploaded.url);
    setUploaded({ url: URL.createObjectURL(file), format: ext as ModelFormat });
    e.target.value = '';
  };

  const handleZoom = (factor: number) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const camera = controls.object as THREE.PerspectiveCamera;
    const offset = new THREE.Vector3().subVectors(camera.position, controls.target).multiplyScalar(factor);
    camera.position.copy(controls.target).add(offset);
    controls.update();
  };

  const handleReset = () => {
    controlsRef.current?.reset();
  };

  return (
    <section className="py-28 bg-[var(--bg-main)] text-[var(--text-primary)] relative overflow-hidden border-t border-[var(--text-primary)]/10">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(var(--text-primary)_0.75px,transparent_0.75px)] [background-size:20px_20px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-card)]/80 border border-[var(--text-primary)]/10 text-[var(--accent-warm)] text-xs font-mono font-bold uppercase tracking-widest mb-3 shadow-sm">
              <Building2 className="w-3.5 h-3.5 text-[var(--accent-warm)]" />
              Live 3D Model
            </span>
            <h2 className="font-serif-display text-3xl sm:text-5xl font-extrabold text-[var(--text-primary)]">
              Walk Around the Project
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-xl">
              Drag to rotate, scroll to zoom, or let it turn on its own. Works with any project model exported as
              GLB, OBJ, FBX, STL, or DAE.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAutoRotating((v) => !v)}
              data-cursor="TOGGLE"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-mono font-bold transition-all cursor-pointer shadow-sm ${
                isAutoRotating
                  ? 'bg-[var(--bg-card)] border-[var(--accent-warm)] text-[var(--accent-warm)]'
                  : 'bg-[var(--bg-card)]/60 border-[var(--text-primary)]/15 text-[var(--text-secondary)]'
              }`}
            >
              {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAutoRotating ? 'Rotating' : 'Paused'}</span>
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  data-cursor="UPLOAD"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[var(--text-primary)]/15 bg-[var(--bg-card)] text-xs font-mono font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-sm"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Load Model</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".glb,.gltf,.obj,.fbx,.stl,.dae"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </>
            )}
          </div>
        </div>

        {/* Main Viewer + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 relative rounded-3xl overflow-hidden border border-[var(--text-primary)]/15 bg-[#9ec0e8] shadow-2xl h-[520px] sm:h-[620px]">
            <div className="relative w-full h-full">
              <Canvas
                shadows
                dpr={[1, 2]}
                camera={{ position: [5.5, 3.8, 6.5], fov: 42 }}
                gl={{ antialias: true, alpha: false }}
                style={{ background: '#9ec0e8' }}
              >
                <color attach="background" args={['#9ec0e8']} />
                <SkyBackdrop />
                <hemisphereLight args={['#c8dff5', '#d4c4a8', 0.9]} />
                <directionalLight position={[5, 10, 4]} intensity={1.8} castShadow shadow-mapSize={[1024, 1024]} color="#fff8f0" />
                <directionalLight position={[-6, 3, -4]} intensity={0.45} color="#a8c4e8" />
                <directionalLight position={[0, 2, -6]} intensity={0.3} color="#f0d4a8" />
                <ambientLight intensity={0.4} />

                <ModelErrorBoundary
                  key={modelKey}
                  onError={() =>
                    setLoadError('This file could not be previewed. Try exporting it as GLB for the most reliable result.')
                  }
                >
                  <Suspense fallback={<Loader />}>
                    <Bounds key={activeUrl ?? 'placeholder'} fit clip observe margin={1.05}>
                      <Center>
                        <ModelSwitch url={activeUrl} format={activeFormat} />
                      </Center>
                    </Bounds>
                  </Suspense>
                </ModelErrorBoundary>

                <ContactShadows position={[0, -0.02, 0]} opacity={0.3} scale={14} blur={2.2} far={5} color="#4a5568" />
                <OrbitControls
                  ref={controlsRef}
                  autoRotate={isAutoRotating}
                  autoRotateSpeed={0.6}
                  enableZoom
                  enablePan={false}
                  minDistance={1.5}
                  maxDistance={18}
                  maxPolarAngle={Math.PI / 2 - 0.02}
                />
              </Canvas>

              {/* Zoom controls */}
              <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
                <button
                  onClick={() => handleZoom(0.85)}
                  data-cursor="ZOOM"
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--text-primary)]/15 shadow-sm hover:text-[var(--accent-warm)] cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleZoom(1.15)}
                  data-cursor="ZOOM"
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--text-primary)]/15 shadow-sm hover:text-[var(--accent-warm)] cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={handleReset}
                  data-cursor="RESET"
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--text-primary)]/15 shadow-sm hover:text-[var(--accent-warm)] cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Format badge */}
              <div className="absolute bottom-4 left-4 z-20 bg-[var(--bg-card)]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-[var(--text-primary)]/15 shadow-sm flex items-center gap-2 text-xs font-mono text-[var(--text-primary)]">
                <Compass className="w-3.5 h-3.5 text-[var(--accent-warm)]" />
                <span>{activeFormat ? activeFormat.toUpperCase() : 'Sample Model'}</span>
              </div>
            </div>

            {loadError && (
              <div className="p-4 bg-[var(--bg-card)] border-t border-[var(--text-primary)]/10 flex items-start gap-3 text-xs text-[var(--text-secondary)]">
                <Info className="w-4 h-4 text-[var(--accent-warm)] shrink-0 mt-0.5" />
                <span>{loadError}</span>
              </div>
            )}
          </div>

          {/* Project Details Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-6 rounded-3xl border border-[var(--text-primary)]/15 shadow-xl bg-[var(--bg-card)]/90">
              <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--accent-warm)] bg-[var(--accent-warm)]/10 px-2.5 py-1 rounded-md mb-4">
                {project.category}
              </span>

              <h3 className="font-serif-display text-xl font-bold text-[var(--text-primary)] mb-4">{project.title}</h3>

              <div className="space-y-2 mb-5 text-xs font-mono text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[var(--accent-warm)]" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ruler className="w-3.5 h-3.5 text-[var(--accent-warm)]" />
                  <span>{project.area}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-3.5 h-3.5 text-[var(--accent-warm)]" />
                  <span>Completed {project.year}</span>
                </div>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6">{project.description}</p>

              <div className="space-y-2 mb-6">
                <h4 className="text-xs font-mono font-bold uppercase text-[var(--text-primary)] tracking-wider mb-2">
                  Key Features
                </h4>
                {project.highlights.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[var(--text-primary)]">
                    <Check className="w-3.5 h-3.5 text-[var(--accent-warm)] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  if (onEnquire) {
                    onEnquire();
                    return;
                  }
                  const enquiry = document.getElementById('enquiry');
                  if (enquiry) {
                    enquiry.scrollIntoView({ behavior: 'smooth' });
                    return;
                  }
                  const booking = document.getElementById('booking');
                  if (booking) booking.scrollIntoView({ behavior: 'smooth' });
                }}
                data-cursor="PLAN"
                className="w-full py-3 rounded-xl bg-[var(--text-primary)] text-[var(--text-on-accent)] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[var(--accent-warm)] transition-all cursor-pointer shadow-md"
              >
                Enquire About This Project
              </button>
            </div>

            {isAdmin && (
              <div className="glass-card p-6 rounded-3xl border border-[var(--text-primary)]/10 bg-[var(--bg-card)]/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--text-primary)] mb-1">
                  <Info className="w-3.5 h-3.5 text-[var(--accent-warm)]" />
                  <span>Supported Formats</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  GLB, GLTF, OBJ, FBX, STL, and DAE preview directly in the browser. SketchUp (.skp) and AutoCAD
                  (.dwg) files need to be exported to one of these first — GLB gives the most reliable result.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
