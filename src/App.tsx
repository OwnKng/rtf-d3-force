import { Canvas } from "@react-three/fiber"
import { Sketch } from "./Sketch"

export default function App() {
  return (
    <div className='w-full h-screen'>
      <Canvas
        orthographic
        camera={{
          position: [0, 0, 30],
          zoom: 4,
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight intensity={2} position={[0, 8, 10]} />
        <Sketch />
      </Canvas>
    </div>
  )
}
