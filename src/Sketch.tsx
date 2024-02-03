import * as THREE from "three"
import {
  forceSimulation,
  forceX,
  forceY,
  forceCollide,
  forceManyBody,
} from "d3-force"
import { randomNormal } from "d3-random"
import { useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"

const NUM_INSTANCES = 250

const temp = new THREE.Object3D()
const colors = ["#97DFFC", "#FF7B9C", "#046E8F"]

const random = randomNormal(5, 2)

const nodes = new Array(NUM_INSTANCES).fill(0).map((_, i) => ({
  x: 0,
  y: 0,
  r: i === 0 ? 20 : random(),
  color: colors[Math.floor(Math.random() * colors.length)],
}))

const color = new THREE.Color()

export function Sketch() {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const colorArray = useMemo(
    () =>
      Float32Array.from(
        new Array(nodes.length)
          .fill(0)
          .flatMap((_, i) => color.set(nodes[i].color).toArray())
      ),
    []
  )

  const { width, height } = useThree().viewport

  const simulation = useMemo(
    () =>
      forceSimulation(nodes)
        .alphaTarget(0.1)
        .velocityDecay(0.1)
        .force("x", forceX(0).strength(0.01))
        .force("y", forceY(0).strength(0.01))
        .force("collide", forceCollide((d) => d.r + 0.1).iterations(3))
        .force(
          "charge",
          forceManyBody().strength((_, i) => (i ? 0 : 1))
        )
        .tick(300)
        .stop(),
    []
  )

  useFrame((state) => {
    if (!ref.current) return

    nodes[0].x = width * state.pointer.x * 0.5 + 0.5
    nodes[0].y = height * state.pointer.y * 0.5 + 0.5

    simulation.tick()

    for (let i = 0; i < nodes.length; i++) {
      const { x, y, r } = nodes[i]

      temp.position.set(x, y, 0)

      const scale = i === 0 ? 0 : r
      temp.scale.set(scale, scale, scale)
      temp.updateMatrix()

      color.set(nodes[i].color).toArray(colorArray, i * 3)
      ref.current.geometry.attributes.color.needsUpdate = true

      ref.current.setMatrixAt(i, temp.matrix)
    }

    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      castShadow
      receiveShadow
      ref={ref}
      args={[undefined, undefined, nodes.length]}
    >
      <sphereGeometry args={[1, 64, 64]}>
        <instancedBufferAttribute
          attach='attributes-color'
          args={[colorArray, 3]}
        />
      </sphereGeometry>
      <meshPhongMaterial vertexColors />
    </instancedMesh>
  )
}
