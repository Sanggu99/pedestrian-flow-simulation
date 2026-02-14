import { useFrame } from '@react-three/fiber';
import { useAgentStore } from '@/store/useAgentStore';
import { useSimulationStore } from '@/store/useSimulationStore';
import { updateAgents } from '@/lib/simulation/updateAgents';
import { LAYOUTS } from '@/lib/constants/layouts';
import { useEffect } from 'react';
import * as THREE from 'three';

export default function SimulationLoop() {
    const isRunning = useSimulationStore((state) => state.isRunning);
    const timeScale = useSimulationStore((state) => state.timeScale);
    const isEvacuation = useSimulationStore((state) => state.isEvacuation);

    // We don't subscribe to agents here to avoid re-renders, 
    // we read state directly in useFrame.

    const raycaster = new THREE.Raycaster();

    useFrame((state, delta) => {
        if (!isRunning) return;

        const currentAgents = useAgentStore.getState().agents;
        if (currentAgents.length === 0) return;

        const dt = delta * timeScale;

        // Collision predicate
        const checkCollision = (origin: THREE.Vector3, direction: THREE.Vector3, maxDistance: number) => {
            raycaster.set(origin, direction);
            raycaster.far = maxDistance;

            // Intersect against scene children.
            // OPTIMIZATION: Only intersect with Meshes
            const intersects = raycaster.intersectObjects(state.scene.children, true);

            for (const hit of intersects) {
                // Ignore hits that are too close (self-intersection?) or agents or Grid
                // We assume walls/obstacles are 'Mesh' and not the agents themselves.

                // CRITICAL: We need the normal for sliding.
                if (hit.distance < maxDistance && hit.face) {
                    return { point: hit.point, normal: hit.face.normal };
                }
            }
            return null;
        };

        const currentLayoutId = useSimulationStore.getState().currentLayoutId;
        const activeExitIndices = useSimulationStore.getState().activeExitIndices;
        const layout = LAYOUTS.find(l => l.id === currentLayoutId) || LAYOUTS[0];

        // Filter exits
        const activeExits = layout.exits.filter((_, index) => activeExitIndices.includes(index));
        // If no exits active, maybe fallback to all or none? Fallback to all for safety.
        const targetExits = activeExits.length > 0 ? activeExits : layout.exits;

        const nextAgents = updateAgents(currentAgents, dt, checkCollision, isEvacuation, targetExits);

        useAgentStore.setState({ agents: nextAgents });
    });

    return null;
}
