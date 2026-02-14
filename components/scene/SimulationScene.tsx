'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useSimulationStore } from '@/store/useSimulationStore';
import Environment from './Environment';
import AgentRenderer from './AgentRenderer';
import SimulationLoop from './SimulationLoop';
import ControlPanel from '../ui/ControlPanel';
import HeatmapOverlay from './HeatmapOverlay';
import TrajectoryOverlay from './TrajectoryOverlay';
import ModelLoader from './ModelLoader';
import Lighting from './Lighting';
import CameraManager from './CameraManager';

export default function SimulationScene() {
    const isRunning = useSimulationStore((state) => state.isRunning);
    const modelUrl = useSimulationStore((state) => state.modelUrl);

    return (
        <div className="w-full h-full relative bg-slate-900">
            <Canvas
                camera={{ position: [10, 10, 10], fov: 50 }}
                shadows
                className="w-full h-full"
            >
                <color attach="background" args={['#1a1a2e']} />

                <Lighting />



                <Environment />
                {modelUrl && <ModelLoader />}
                <AgentRenderer />
                <HeatmapOverlay />
                <TrajectoryOverlay />
                <SimulationLoop />

                <CameraManager />

            </Canvas>

            {/* UI Overlay */}
            <div className="absolute top-4 left-4 text-white pointer-events-none">
                <h1 className="text-xl font-bold drop-shadow-md">Simulation: {isRunning ? 'Running' : 'Paused'}</h1>
            </div>

            <ControlPanel />
        </div>
    );
}
