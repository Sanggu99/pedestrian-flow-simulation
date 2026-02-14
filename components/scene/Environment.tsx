import { useSimulationStore } from '@/store/useSimulationStore';
import { LAYOUTS } from '@/lib/constants/layouts';
import ModelLoader from './ModelLoader';

export default function Environment() {
    const modelUrl = useSimulationStore((state) => state.modelUrl);
    const modelScale = useSimulationStore((state) => state.modelScale);
    const currentLayoutId = useSimulationStore((state) => state.currentLayoutId);

    const layout = LAYOUTS.find(l => l.id === currentLayoutId) || LAYOUTS[0];

    return (
        <group>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#334155" />
            </mesh>

            {/* Grid Helper */}
            <gridHelper args={[100, 100, 0xffffff, 0x444444]} position={[0, 0.01, 0]} />

            {/* Layout Walls */}
            {layout.walls.map((wall, index) => (
                <mesh
                    key={`${layout.id}-wall-${index}`}
                    position={wall.position}
                    receiveShadow
                    castShadow
                >
                    <boxGeometry args={wall.size} />
                    <meshStandardMaterial color="#64748b" />
                </mesh>
            ))}

            {/* Layout Exits (Visual Markers) */}
            {layout.exits.map((exit, index) => (
                <mesh key={`exit-${index}`} position={[exit.x, 0.05, exit.z]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.5, 1, 32]} />
                    <meshBasicMaterial color="#22c55e" opacity={0.5} transparent />
                </mesh>
            ))}

        </group>
    );
}
