"use client"

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Canvas, useFrame, useThree, type RootState } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    
    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [matches, query])

  return matches
}

function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleVisibility = () => {
      setIsVisible(document.visibilityState === "visible")
    }

    handleVisibility()
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [])

  return isVisible
}

function useSaveDataPreference() {
  const [saveData, setSaveData] = useState(false)

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; addEventListener?: (type: string, listener: () => void) => void; removeEventListener?: (type: string, listener: () => void) => void } }).connection
    if (!connection || typeof connection.saveData === "undefined") {
      return
    }

    const handleChange = () => {
      setSaveData(Boolean(connection.saveData))
    }

    handleChange()
    connection.addEventListener?.("change", handleChange)
    return () => connection.removeEventListener?.("change", handleChange)
  }, [])

  return saveData
}

export type RunwayBelt3DItem = {
  id: string
  modelSrc: string
  thumbnailSrc?: string
  alt?: string
  rotationSpeed?: number
  scale?: number
  href?: string
}

type Props = {
  items: RunwayBelt3DItem[]
  className?: string
  isVisible?: boolean
}

function isWebGLAvailable() {
  try {
    if (typeof window === "undefined") return false
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    return !!gl
  } catch {
    return false
  }
}

class RenderErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  override render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

const LinkWrapper = ({ href, children }: { href?: string; children: React.ReactNode }) => {
  if (!href) return <>{children}</>
  return (
    <Link href={href} className="block w-full h-full pointer-events-auto">
      {children}
    </Link>
  )
}

function BeltFallback({ items }: { items: RunwayBelt3DItem[] }) {
  return (
    <div className="w-full h-full flex items-center justify-center gap-10 px-6" aria-hidden="true">
      {items.map((item) => (
        <LinkWrapper key={item.id} href={item.href}>
          <div className="relative h-[70%] aspect-square bg-white overflow-hidden">
            {item.thumbnailSrc ? (
              <Image
                src={item.thumbnailSrc}
                alt={item.alt || ""}
                fill
                sizes="160px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-white" />
            )}
          </div>
        </LinkWrapper>
      ))}
    </div>
  )
}

function CenteredRotatingModel({ item, isHovered, onHover, shouldRotate, onClick }: { 
  item: RunwayBelt3DItem;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  shouldRotate: boolean;
  onClick: () => void;
}) {
  const router = useRouter()
  const groupRef = useRef<THREE.Group>(null)
  const gltf = useGLTF(item.modelSrc)

  const model = useMemo(() => {
    const scene = gltf.scene.clone(true)

    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()

    box.getSize(size)

    // Normalize by height so all garments have a consistent visual scale
    // Use a relatively small target to avoid crowding in the belt
    const targetHeight = 0.9
    const height = size.y || 1
    const scale = (targetHeight / height) * (item.scale ?? 1)
    scene.scale.setScalar(scale)

    // After scaling, recenter horizontally and place the bottom on a common ground plane
    box.setFromObject(scene)
    box.getCenter(center)

    // Center on X/Z
    scene.position.sub(new THREE.Vector3(center.x, 0, center.z))

    // Shift so the lowest point sits at y = 0 ("ground")
    box.setFromObject(scene)
    const yOffset = box.min.y
    scene.position.y -= yOffset

    return scene
  }, [gltf.scene])

  useFrame((_state: RootState, delta: number) => {
    if (!groupRef.current || !shouldRotate) return
    const speed = item.rotationSpeed ?? 0.4
    groupRef.current.rotation.y += speed * delta
  })

  // Update opacity based on hover state
  useEffect(() => {
    if (!groupRef.current) return;
    
    const opacity = isHovered ? 1 : 0.4;
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = child.material.clone();
        child.material.transparent = true;
        child.material.opacity = opacity;
      }
    });
  }, [isHovered]);

  return (
    <group 
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
        if (item.href) router.push(item.href)
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
        onHover(true);
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
        onHover(false);
      }}
    >
      <primitive object={model} />
    </group>
  )
}

function RunwayBeltItems({ items, isActive }: { items: RunwayBelt3DItem[]; isActive: boolean }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [clickedId, setClickedId] = useState<string | null>(null);
  const [mobileClickEffectId, setMobileClickEffectId] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  const handleItemHover = (id: string, isHovered: boolean) => {
    setHoveredId(isHovered ? id : null);
  };

  const handleItemClick = (id: string, hasLink: boolean) => {
    setClickedId(id);
    
    // On mobile, show hover effect briefly before navigation
    if (isMobile) {
      setMobileClickEffectId(id);
      // Only clear the effect if there's no link (no navigation will occur)
      // If there's a link, let the navigation handle cleanup to avoid flash
      if (!hasLink) {
        setTimeout(() => {
          setMobileClickEffectId(null);
        }, 1500);
      }
    }
  };

  // Stop rotation if any item is hovered (desktop) or clicked (desktop + mobile)
  const shouldRotate = isActive && hoveredId === null && clickedId === null;

  return (
    <group>
      {items.map((item, idx) => {
        const spacing = isMobile ? 1.2 : 1.8;
        const offset = (idx - (items.length - 1) / 2) * spacing;
        
        // Determine if this item should appear highlighted
        const isHovered = hoveredId === item.id || hoveredId === null;
        const isMobileClickEffect = mobileClickEffectId === item.id || mobileClickEffectId === null;
        const shouldHighlight = isHovered && isMobileClickEffect;
        
        return (
          <group key={item.id} position={[offset, 0, 0]}>
            <CenteredRotatingModel 
              item={item} 
              isHovered={shouldHighlight}
              onHover={(hovered) => handleItemHover(item.id, hovered)}
              shouldRotate={shouldRotate}
              onClick={() => handleItemClick(item.id, !!item.href)}
            />
          </group>
        );
      })}
    </group>
  );
}

function BeltCameraAim() {
  const { camera } = useThree()

  useEffect(() => {
    camera.lookAt(0, 0.55, 0)
    camera.updateProjectionMatrix()
  }, [camera])

  return null
}

const RunwayBelt3D = ({ items, className, isVisible = true }: Props) => {
  const [webglOk, setWebglOk] = useState<boolean>(false)
  const isMobile = useMediaQuery("(max-width: 640px)")
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const saveData = useSaveDataPreference()
  const pageVisible = usePageVisibility()
  const hasThumbnails = items.some((item) => item.thumbnailSrc)
  const motionAllowed = !prefersReducedMotion && !saveData
  const isActive = isVisible && pageVisible && motionAllowed

  useEffect(() => {
    setWebglOk(isWebGLAvailable())
  }, [])

  const canRenderWebGL = webglOk && !(saveData && hasThumbnails)
  const dpr = saveData ? [1, 1.05] : isMobile ? [1, 1.1] : [1, 1.25]
  const powerPreference = saveData || isMobile ? "low-power" : "high-performance"

  return (
    <section
      className={
        "w-full bg-white select-none " +
        "h-[180px] sm:h-[220px] md:h-[280px] lg:h-[320px] " +
        (className ?? "")
      }
      aria-label="3D runway belt"
    >
      <div className="w-full h-full">
        {!canRenderWebGL ? (
          <BeltFallback items={items} />
        ) : (
          <RenderErrorBoundary fallback={<BeltFallback items={items} />}>
            <Suspense fallback={<BeltFallback items={items} />}>
              <Canvas
                className="w-full h-full"
                dpr={dpr}
                gl={{ antialias: true, powerPreference, alpha: true }}
                frameloop={isActive ? "always" : "demand"}
                camera={{ position: [0, 1.4, 5], fov: 28, near: 0.1, far: 100 }}
                style={{ position: 'relative', zIndex: 0 }}
              >
                <BeltCameraAim />
                <color attach="background" args={["#ffffff"]} />
                <ambientLight intensity={0.7} />
                <directionalLight position={[0, 0, 4]} intensity={0.65} />
                <directionalLight position={[0, 0, -4]} intensity={0.65} />
                <directionalLight position={[4, 0, 0]} intensity={0.55} />
                <directionalLight position={[-4, 0, 0]} intensity={0.55} />
                <directionalLight position={[0, 4, 0]} intensity={0.65} />
                <directionalLight position={[0, -4, 0]} intensity={0.65} />

                {items.length === 1 ? (
                  <CenteredRotatingModel 
                    item={items[0]} 
                    isHovered={true}
                    onHover={() => {}}
                    shouldRotate={isActive}
                    onClick={() => {}}
                  />
                ) : (
                  <RunwayBeltItems items={items} isActive={isActive} />
                )}
              </Canvas>
            </Suspense>
          </RenderErrorBoundary>
        )}
      </div>
    </section>
  )
}

export default RunwayBelt3D
