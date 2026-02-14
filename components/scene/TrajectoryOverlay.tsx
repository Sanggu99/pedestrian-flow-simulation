import { useAgentStore } from '@/store/useAgentStore';
import { useSimulationStore } from '@/store/useSimulationStore';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GRID_SIZE = 100;
const MAP_SIZE = 1024; // Higher resolution for crisp lines

export default function TrajectoryOverlay() {
    const showTrajectory = useSimulationStore((state) => state.showTrajectory);
    const agents = useAgentStore((state) => state.agents);

    // Store previous positions to draw lines: { id: Vector3 }
    const prevPositions = useRef<Map<string, THREE.Vector3>>(new Map());

    const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
    const textureRef = useRef<THREE.CanvasTexture>(new THREE.CanvasTexture(canvasRef.current));
    const trajectoryID = useSimulationStore((state) => state.trajectoryID);

    useMemo(() => {
        canvasRef.current.width = MAP_SIZE;
        canvasRef.current.height = MAP_SIZE;
    }, []);

    // Reset Effect
    useMemo(() => {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, MAP_SIZE, MAP_SIZE);
            prevPositions.current.clear();
            if (textureRef.current) textureRef.current.needsUpdate = true;
        }
    }, [trajectoryID]);

    useFrame(() => {
        if (!showTrajectory) return;

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Fade out slightly to create trails, or keep persistent? 
        // User asked for "Trajectory", usually implies persistent lines.
        // Let's do a very slow fade so scene doesn't become pure white eventually.
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.005)';
        ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.globalCompositeOperation = 'lighter';

        agents.forEach(agent => {
            const prev = prevPositions.current.get(agent.id);
            if (prev) {
                // Map world to canvas
                const x1 = ((prev.x + 50) / 100) * MAP_SIZE;
                const y1 = ((prev.z + 50) / 100) * MAP_SIZE;
                const x2 = ((agent.position.x + 50) / 100) * MAP_SIZE;
                const y2 = ((agent.position.z + 50) / 100) * MAP_SIZE;

                // Skip big jumps (teleport/respawn)
                if (prev.distanceTo(agent.position) < 5.0) {
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    // Color based on type? Or just simple cyan for logic lines
                    ctx.strokeStyle = 'rgba(255, 200, 0, 0.5)';
                    ctx.stroke();
                }
            }
            // Update prev
            prevPositions.current.set(agent.id, agent.position.clone());
        });

        // Cleanup removed agents
        if (agents.length < prevPositions.current.size) {
            const currentIds = new Set(agents.map(a => a.id));
            for (const id of prevPositions.current.keys()) {
                if (!currentIds.has(id)) prevPositions.current.delete(id);
            }
        }

        textureRef.current.needsUpdate = true;
    });

    if (!showTrajectory) return null;

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial
                map={textureRef.current}
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </mesh>
    );
}
