import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Stats } from '@react-three/drei'
import { Suspense } from 'react'

interface HabboViewerProps {
  furnitureId?: string
  avatarFigure?: string
  size?: number
}

function HabboViewer({ furnitureId, avatarFigure, size = 5 }: HabboViewerProps) {
  return (
    <Canvas style={{ height: '100vh', width: '100%' }} camera={{ position: [0, size, size], fov: 60 }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <directionalLight position={[-10, 8, -5]} intensity={0.6} />
        <pointLight position={[0, 4, 0]} intensity={0.5} />
        
        {/* Controls */}
        <OrbitControls enableZoom enablePan enableRotate />
        
        {/* Stats (for debugging) */}
        <Stats />
        
        {/* Habbo Furniture or Avatar */}
        {furnitureId ? (
          <HabboFurniture furnitureId={furnitureId} size={size} />
        ) : avatarFigure ? (
          <HabboAvatar figure={avatarFigure} size={size} />
        ) : (
          <HabboTestRoom size={size} />
        )}
      </Suspense>
    </Canvas>
  )
}

// Placeholder for actual Habbo furniture loader
function HabboFurniture({ furnitureId, size }: { furnitureId: string; size: number }) {
  // In a real implementation, this would load Habbo furniture models
  // For now, showing a placeholder
  return (
    <mesh position={[0, 0, 0]} scale={[size, size, size]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color='orange' />
    </mesh>
  )
}

// Placeholder for actual Habbo avatar loader
function HabboAvatar({ figure, size }: { figure: string; size: number }) {
  // In a real implementation, this would parse the Habbo figure string and load avatar parts
  // For now, showing a placeholder
  return (
    <group position={[0, 0, 0]} scale={[size, size, size]}>
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color='skin' />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.5, 1.5, 0.5]} />
        <meshStandardMaterial color='blue' />
      </mesh>
    </group>
  )
}

// Simple test room
function HabboTestRoom({ size }: { size: number }) {
  return (
    <>
      {/* Floor */}
      <mesh rotation={[ - Math.PI / 2, 0, 0 ]} position={[0, -0.5, 0]} scale={[size * 2, size * 2, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color='gray' />
      </mesh>
      
      {/* Walls */}
      <mesh position={[0, size / 2, -size]} rotation={[0, 0, 0]} scale={[size * 2, size, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color='lightblue' />
      </mesh>
      <mesh position={[0, size / 2, size]} rotation={[0, Math.PI, 0]} scale={[size * 2, size, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color='lightblue' />
      </mesh>
      <mesh position={[size, size / 2, 0]} rotation={[0, Math.PI / 2, 0]} scale={[size * 2, size, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color='lightblue' />
      </mesh>
      <mesh position={[ -size, size / 2, 0]} rotation={[0, - Math.PI / 2, 0]} scale={[size * 2, size, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color='lightblue' />
      </mesh>
      
      {/* Some sample furniture */}
      <mesh position={[ -size / 2, 0, -size / 2 ]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color='red' />
      </mesh>
      <mesh position={[ size / 2, 0, size / 2 ]} rotation={[0, - Math.PI / 4, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color='yellow' />
      </mesh>
    </>
  )
}

export { HabboViewer }
