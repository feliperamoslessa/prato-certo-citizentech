import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'

const produce = [
  { position: [-0.8, 0.36, 0.13], color: '#e89145', scale: [0.38, 0.38, 0.38] },
  { position: [-0.18, 0.36, -0.45], color: '#d27950', scale: [0.42, 0.4, 0.42] },
  { position: [0.58, 0.31, 0.12], color: '#aac583', scale: [0.51, 0.29, 0.37] },
  { position: [-0.09, 0.24, 0.53], color: '#658d5a', scale: [0.31, 0.26, 0.32] },
] as const

function Plate() {
  const group = useRef<Group>(null)
  const elapsed = useRef(0)

  useFrame(({ invalidate }, delta) => {
    elapsed.current += Math.min(delta, 0.05)
    const progress = Math.min(1, elapsed.current / 4.2)
    const ease = 1 - (1 - progress) ** 3
    if (group.current) {
      group.current.rotation.y = -0.7 + ease * 0.98
      group.current.position.y = -0.3 + ease * 0.3
      group.current.rotation.z = (1 - ease) * -0.2
    }
    if (progress < 1) invalidate()
  })

  return (
    <group ref={group} rotation={[0, -0.7, -0.2]} position={[0, -0.3, 0]}>
      <mesh>
        <cylinderGeometry args={[1.47, 1.19, 0.15, 64]} />
        <meshStandardMaterial color="#f5f0e6" roughness={0.36} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.095, 0]}>
        <torusGeometry args={[1.36, 0.11, 12, 64]} />
        <meshStandardMaterial color="#f5f0e6" roughness={0.32} />
      </mesh>
      {produce.map(({ position, color, scale }) => (
        <group key={color} position={position}>
          <mesh scale={scale}>
            <sphereGeometry args={[1, 24, 16]} />
            <meshStandardMaterial color={color} roughness={0.58} />
          </mesh>
          <mesh position={[0.07, scale[1] * 0.94, 0]} rotation={[0.2, 0.5, -0.4]} scale={[0.16, 0.045, 0.08]}>
            <sphereGeometry args={[1, 16, 8]} />
            <meshStandardMaterial color="#416c48" />
          </mesh>
        </group>
      ))}
      <mesh position={[1.68, 0.65, -0.35]} rotation={[0.3, 0.5, 0.6]}>
        <octahedronGeometry args={[0.15]} />
        <meshStandardMaterial color="#f1a974" />
      </mesh>
      <mesh position={[-1.53, 0.63, -0.55]} rotation={[0.5, 0, 0.4]}>
        <octahedronGeometry args={[0.11]} />
        <meshStandardMaterial color="#b4c895" />
      </mesh>
    </group>
  )
}

export default function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 3, 5], fov: 39 }} frameloop="demand" dpr={[1, 1.5]}>
      <ambientLight intensity={1.35} />
      <directionalLight position={[-3, 5, 3]} intensity={2.4} />
      <directionalLight position={[3, 1, -2]} intensity={0.85} color="#e89145" />
      <Plate />
    </Canvas>
  )
}
