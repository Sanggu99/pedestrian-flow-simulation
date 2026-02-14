import { Vector3, Raycaster } from 'three';
import { Agent } from '@/store/useAgentStore';

// Mock function to simulate "seeing" obstacles or other agents.
// In a real R3F app, we might use the actual THREE.Raycaster against the scene graph,
// but for pure data simulation without easy access to the scene graph in the logic loop,
// we can simulate "perception" by checking distances and angles to known entities.

export function getVisibleEntities(
    agent: Agent,
    others: Agent[],
    viewDistance: number = 10,
    viewAngle: number = 100 // Degrees
) {
    const visible: Agent[] = [];
    const forward = agent.velocity.clone().normalize();

    // If velocity is zero, assume facing 'goal' or just Z axis
    if (forward.lengthSq() < 0.01) forward.set(0, 0, 1);

    const cosFOV = Math.cos((viewAngle / 2) * (Math.PI / 180));

    others.forEach(other => {
        if (agent.id === other.id) return;

        const toOther = new Vector3().subVectors(other.position, agent.position);
        const dist = toOther.length();

        if (dist < viewDistance) {
            toOther.normalize();
            const dot = forward.dot(toOther);

            if (dot > cosFOV) {
                visible.push(other);
            }
        }
    });

    return visible;
}
