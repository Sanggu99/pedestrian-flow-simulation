import { useAgentStore } from '@/store/useAgentStore';
import { useSimulationStore } from '@/store/useSimulationStore';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GRID_RES = 100; // 100x100 grid
const MAP_SIZE = 1024; // Texture resolution
const CELL_PX = MAP_SIZE / GRID_RES;

export default function HeatmapOverlay() {
    const showHeatmap = useSimulationStore((state) => state.showHeatmap);
    const trajectoryID = useSimulationStore((state) => state.trajectoryID);
    const agents = useAgentStore((state) => state.agents);

    // Density data: 100x100 array
    const gridData = useRef(new Float32Array(GRID_RES * GRID_RES));

    const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
    const textureRef = useRef<THREE.CanvasTexture>(new THREE.CanvasTexture(canvasRef.current));

    useMemo(() => {
        canvasRef.current.width = MAP_SIZE;
        canvasRef.current.height = MAP_SIZE;
    }, []);

    // Reset logic
    useMemo(() => {
        gridData.current.fill(0);
    }, [trajectoryID]);

    const getColorForIntensity = (v: number) => {
        // Multi-stop gradient: Blue(0) -> Cyan(0.2) -> Green(0.4) -> Yellow(0.6) -> Red(1.0)
        if (v < 0.2) return `rgba(0, 0, 255, ${v * 2})`; // Fade in blue
        if (v < 0.4) return `rgb(0, 255, 255)`; // Cyan
        if (v < 0.6) return `rgb(0, 255, 0)`;   // Green
        if (v < 0.8) return `rgb(255, 255, 0)`; // Yellow
        return `rgb(255, 0, 0)`;               // Red
    };

    useFrame(() => {
        if (!showHeatmap) return;

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // 1. Accumulate & Decay
        // Very slow decay to keep trails but not forever
        for (let i = 0; i < gridData.current.length; i++) {
            gridData.current[i] *= 0.995;
        }

        // Accumulate active agents
        agents.forEach(agent => {
            const gx = Math.floor(agent.position.x + 50);
            const gz = Math.floor(agent.position.z + 50);
            if (gx >= 0 && gx < GRID_RES && gz >= 0 && gz < GRID_RES) {
                const idx = gz * GRID_RES + gx;
                gridData.current[idx] = Math.min(1.0, gridData.current[idx] + 0.05);
            }
        });

        // 2. Draw Grid
        ctx.clearRect(0, 0, MAP_SIZE, MAP_SIZE);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${CELL_PX * 0.5}px Arial`;

        for (let z = 0; z < GRID_RES; z++) {
            for (let x = 0; x < GRID_RES; x++) {
                const intensity = gridData.current[z * GRID_RES + x];
                if (intensity > 0.05) {
                    const px = x * CELL_PX;
                    const py = z * CELL_PX;

                    ctx.fillStyle = getColorForIntensity(intensity);
                    ctx.fillRect(px, py, CELL_PX, CELL_PX);

                    // Draw value if significant concentration
                    if (intensity > 0.5) {
                        ctx.fillStyle = 'white';
                        const val = (intensity * 10).toFixed(0);
                        ctx.fillText(val, px + CELL_PX / 2, py + CELL_PX / 2);
                    }
                }
            }
        }

        textureRef.current.needsUpdate = true;
    });

    if (!showHeatmap) return null;

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial
                map={textureRef.current}
                transparent
                opacity={0.7}
                depthWrite={false}
            />
        </mesh>
    );
}
