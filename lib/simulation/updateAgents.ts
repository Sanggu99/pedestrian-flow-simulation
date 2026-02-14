import { Agent } from '@/store/useAgentStore';
import { Vector3 } from 'three';

const SEPARATION_DISTANCE = 1.0;
const MAX_SPEED = 2.0; // Units per second
const MAX_FORCE = 0.1;

import { getVisibleEntities } from './perception';

export function updateAgents(
    agents: Agent[],
    delta: number,
    checkCollision?: (origin: Vector3, direction: Vector3, maxDistance: number) => { point: Vector3, normal: Vector3 } | null,
    isEvacuation: boolean = false,
    exits: Vector3[] = []
): Agent[] {
    // Sub-stepping configuration
    const SUB_STEPS = 5;
    const subDelta = delta / SUB_STEPS;

    let currentAgents = [...agents];

    // Default Fallback Exits (Corners) if none provided
    const SAFE_EXITS = exits.length > 0 ? exits : [
        new Vector3(-45, 0, -45),
        new Vector3(45, 0, -45),
        new Vector3(-45, 0, 45),
        new Vector3(45, 0, 45)
    ];

    for (let step = 0; step < SUB_STEPS; step++) {
        currentAgents = currentAgents.map((agent) => {
            // ... (Perception & Behavior Logic reuse - simplified for sub-steps or kept outside?)
            // For efficiency, behavior/perception should ideally be outside, but velocity updates are inside.
            // Let's keep it simple: Full update per sub-step is safest for collision, though expensive.
            // Optimization: Calculate desired velocity ONCE per frame, but apply collision/movement per sub-step.

            // 1. Perception & 2. Behavior (Crowd Density etc) - DO ONCE PER FRAME conceptually
            // However, for this refactor, we'll keep it inside but scale forces? 
            // Actually, "updateAgents" is called once per frame. We should internalize sub-stepping here.

            // Let's extract specific logic variables that don't change fast
            const visibleNeighbors = getVisibleEntities(agent, currentAgents, 10, 120);
            const crowdDensity = visibleNeighbors.length;
            let currentSpeed = agent.speed;

            // --- EVACUATION LOGIC ---
            if (isEvacuation) {
                currentSpeed = MAX_SPEED * 2.5; // Run fast!

                // If no goal or normal walking, set panic goal to nearest exit
                if (!agent.goal || agent.state !== 'PANIC') {
                    // Find nearest exit
                    let nearestExit = SAFE_EXITS[0];
                    let minDst = agent.position.distanceToSquared(SAFE_EXITS[0]);

                    for (const exit of SAFE_EXITS) {
                        const dst = agent.position.distanceToSquared(exit);
                        if (dst < minDst) {
                            minDst = dst;
                            nearestExit = exit;
                        }
                    }
                    return { ...agent, state: 'PANIC' as const, goal: nearestExit, speed: currentSpeed };
                }
            } else {
                // Resume Normal Behavior
                if (agent.state === 'PANIC') {
                    return { ...agent, state: 'IDLE' as const, goal: null, velocity: new Vector3(0, 0, 0) };
                }
            }

            // ... (Manager/Visitor logic modifiers)
            // Manager logic removed as type is now only VISITOR

            if (agent.type === 'VISITOR' && crowdDensity > 4) {
                currentSpeed = MAX_SPEED * 1.5;
            }

            // --- CROWD DENSITY SPEED ---
            if (crowdDensity > 4) {
                currentSpeed *= 0.8; // Slow down in crowds
            }
            if (isEvacuation) currentSpeed = MAX_SPEED * 2.5; // Ignore crowd speed limit in panic (somewhat)

            if (!agent.goal && agent.state !== 'IDLE') return agent;

            let desiredVelocity = agent.velocity.clone();

            // 1. Goal Steering (Seek)
            if (agent.goal) {
                const desired = new Vector3().subVectors(agent.goal, agent.position);
                const distToGoal = desired.length();

                // Reached Exit?
                if (isEvacuation && distToGoal < 2.0) {
                    return { ...agent, state: 'IDLE', velocity: new Vector3(0, 0, 0) };
                }
                if (!isEvacuation && distToGoal < 0.5) {
                    return { ...agent, state: 'IDLE' as const, velocity: new Vector3(0, 0, 0), goal: null };
                }

                desired.normalize().multiplyScalar(currentSpeed);
                const steer = new Vector3().subVectors(desired, agent.velocity);
                steer.clampLength(0, MAX_FORCE);
                desiredVelocity.add(steer);
            }

            // 2. Separation
            const separation = new Vector3();
            let count = 0;
            visibleNeighbors.forEach((other) => {
                const dist = agent.position.distanceTo(other.position);
                if (dist < SEPARATION_DISTANCE) {
                    const diff = new Vector3().subVectors(agent.position, other.position);
                    diff.normalize().divideScalar(dist);
                    separation.add(diff);
                    count++;
                }
            });
            if (count > 0) {
                const separationStrength = isEvacuation ? MAX_FORCE * 0.8 : MAX_FORCE * 1.5;
                separation.divideScalar(count).normalize().multiplyScalar(MAX_SPEED).sub(agent.velocity).clampLength(0, separationStrength);
                desiredVelocity.add(separation);
            }

            desiredVelocity.clampLength(0, currentSpeed);

            // 3. Collision / Wall Sliding (Constraint Resolution)
            if (checkCollision) {
                const lookDir = desiredVelocity.length() > 0.01 ? desiredVelocity.clone().normalize() : new Vector3(0, 0, 1);
                const detectionRange = isEvacuation ? 2.0 : 2.5;

                const centerHit = checkCollision(agent.position, lookDir, detectionRange);

                if (centerHit) {
                    const dist = centerHit.point.distanceTo(agent.position);

                    // A. Wall Sliding (Project velocity to remove component into wall)
                    if (centerHit.normal) {
                        const normal = centerHit.normal.clone().normalize();
                        // If we are moving INTO the wall
                        if (desiredVelocity.dot(normal) < 0) {
                            // Remove the part of velocity that goes into the wall
                            const intoWall = normal.multiplyScalar(desiredVelocity.dot(normal));
                            desiredVelocity.sub(intoWall);
                        }
                    }

                    // B. Hard Push-out (Anti-Clip)
                    // If we are physically INSIDE or touching the wall
                    if (dist < 0.8) {
                        const pushOut = centerHit.normal!.clone().multiplyScalar((0.8 - dist) * 10); // Strong spring force
                        desiredVelocity.add(pushOut);

                        // C. Anti-Stuck Wiggle (only if really stuck)
                        if (agent.velocity.lengthSq() < 0.01) {
                            const tangent = new Vector3(-centerHit.normal!.z, 0, centerHit.normal!.x);
                            desiredVelocity.add(tangent.multiplyScalar(MAX_SPEED)); // Slide sideways
                        }
                    }
                }
            }

            // Apply Velocity
            const newPos = agent.position.clone().add(desiredVelocity.clone().multiplyScalar(subDelta));

            // Bounds
            newPos.y = 0;
            if (newPos.x > 50) newPos.x = 50; if (newPos.x < -50) newPos.x = -50;
            if (newPos.z > 50) newPos.z = 50; if (newPos.z < -50) newPos.z = -50;

            return {
                ...agent,
                position: newPos,
                velocity: desiredVelocity,
                state: agent.state
            };
        });
    }

    // Goal Reset Logic (Only if NOT evacuation)
    if (!isEvacuation) {
        return currentAgents.map(agent => {
            if (agent.state === 'IDLE' && !agent.goal) {
                const range = 40;
                const goalX = (Math.random() - 0.5) * 2 * range;
                const goalZ = (Math.random() - 0.5) * 2 * range;
                return { ...agent, goal: new Vector3(goalX, 0, goalZ), state: 'WALKING' as const };
            }
            return agent;
        });
    }

    return currentAgents;
}
