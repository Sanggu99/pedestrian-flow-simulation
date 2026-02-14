import { useAgentStore, Agent } from '@/store/useAgentStore';
import { useSimulationStore } from '@/store/useSimulationStore';
import { Vector3 } from 'three';
import { Play, Pause, UserPlus, Users, Trash2, Upload, Camera, AlertTriangle } from 'lucide-react';
import { ChangeEvent } from 'react';
import * as THREE from 'three';
import { LAYOUTS } from '@/lib/constants/layouts';

export default function ControlPanel() {
    const { addAgent, addAgents, clearAgents, agents } = useAgentStore();
    const {
        isRunning, toggleSimulation,
        modelUrl, setModelUrl,
        modelScale, setModelScale,
        timeScale, setTimeScale,
        cameraMode, setCameraMode,
        showHeatmap, setShowHeatmap,
        showTrajectory, setShowTrajectory,
        isEvacuation, toggleEvacuation,
        currentLayoutId, setLayoutId
    } = useSimulationStore();

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setModelUrl(url);
        }
    };

    const spawnVisitors = (count: number) => {
        const newAgents: Agent[] = Array.from({ length: count }).map(() => ({
            id: Math.random().toString(36).substr(2, 9),
            type: 'VISITOR',
            position: new Vector3(
                (Math.random() - 0.5) * 40,
                0,
                (Math.random() - 0.5) * 40
            ),
            velocity: new Vector3(0, 0, 0),
            goal: null,
            state: 'IDLE',
            speed: 1.5 + Math.random() // Random speed
        }));
        addAgents(newAgents);
    };

    const visitorCount = agents.filter(a => a.type === 'VISITOR').length;

    return (
        <div className="absolute top-4 right-4 bg-gray-900/90 text-white p-4 rounded-lg shadow-xl backdrop-blur-sm w-72 space-y-4 max-h-[90vh] overflow-y-auto font-sans">

            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                <h2 className="font-bold text-lg flex items-center gap-2">
                    <Users size={20} /> Agent Sim
                </h2>
                <div className="text-xs bg-black/50 px-2 py-1 rounded text-orange-400 font-mono">
                    {visitorCount} Visitors
                </div>
            </div>

            {/* Play/Pause & Reset */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={toggleSimulation}
                    className={`flex items-center justify-center gap-2 py-2 rounded font-bold transition-colors ${isRunning ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    {isRunning ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Resume</>}
                </button>
                <button
                    onClick={() => {
                        clearAgents();
                        useSimulationStore.getState().resetTrajectory();
                    }}
                    className="flex items-center justify-center gap-2 py-2 rounded font-bold bg-red-800 hover:bg-red-900 transition-colors"
                >
                    <Trash2 size={16} /> Reset
                </button>
            </div>

            {/* Evacuation Toggle */}
            <button
                onClick={toggleEvacuation}
                className={`w-full py-3 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 ${isEvacuation ? 'bg-red-600 animate-pulse ring-2 ring-red-400' : 'bg-gray-800 border border-gray-600 hover:bg-red-900/30'}`}
            >
                {isEvacuation ? <><AlertTriangle size={24} /> EVACUATING</> : <><AlertTriangle size={20} /> Trigger Evacuation</>}
            </button>

            {/* Spawn Controls */}
            <div className="space-y-2 bg-gray-800/50 p-2 rounded">
                <label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-1">
                    <UserPlus size={12} /> Spawn Visitors
                </label>
                <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => spawnVisitors(1)} className="bg-gray-700 hover:bg-gray-600 py-1 rounded text-sm transition-colors">+1</button>
                    <button onClick={() => spawnVisitors(10)} className="bg-gray-700 hover:bg-gray-600 py-1 rounded text-sm transition-colors">+10</button>
                    <button onClick={() => spawnVisitors(50)} className="bg-blue-600 hover:bg-blue-500 py-1 rounded text-sm font-bold transition-colors">+50</button>
                </div>
            </div>

            {/* Visualization Toggles */}
            <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase">Visualization</label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setShowHeatmap(!showHeatmap)}
                        className={`py-1 rounded text-sm transition-colors ${showHeatmap ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                        Heatmap
                    </button>
                    <button
                        onClick={() => setShowTrajectory(!showTrajectory)}
                        className={`py-1 rounded text-sm transition-colors ${showTrajectory ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                        Trajectory
                    </button>
                </div>
            </div>

            <hr className="border-gray-700" />

            {/* Environment Controls */}
            <div className="space-y-3">

                {/* Layout Selector */}
                <div className="bg-gray-800/50 p-2 rounded">
                    <label className="text-xs font-semibold text-gray-400 uppercase mb-1 block">Space Syntax Layout</label>
                    <select
                        value={currentLayoutId}
                        onChange={(e) => {
                            const newId = e.target.value;
                            setLayoutId(newId);
                            clearAgents();

                            // Initialize active exits to all
                            const layout = LAYOUTS.find(l => l.id === newId) || LAYOUTS[0];
                            const allIndices = layout.exits.map((_, i) => i);
                            useSimulationStore.getState().setActiveExits(allIndices);
                        }}
                        className="w-full bg-gray-700 text-white text-sm rounded p-1 border border-gray-600 focus:border-blue-500 outline-none"
                    >
                        {LAYOUTS.map(layout => (
                            <option key={layout.id} value={layout.id}>
                                {layout.name}
                            </option>
                        ))}
                    </select>

                    {/* Exit Toggles */}
                    <div className="mt-2 text-xs">
                        <label className="block text-gray-500 mb-1">Active Exits:</label>
                        <div className="grid grid-cols-2 gap-1">
                            {LAYOUTS.find(l => l.id === currentLayoutId)?.exits.map((_, index) => (
                                <label key={index} className="flex items-center gap-1 cursor-pointer hover:text-blue-300">
                                    <input
                                        type="checkbox"
                                        checked={useSimulationStore.getState().activeExitIndices.includes(index)}
                                        onChange={() => useSimulationStore.getState().toggleExit(index)}
                                        className="rounded bg-gray-600 border-gray-500"
                                    />
                                    <span>Exit {index + 1}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <label className="block w-full cursor-pointer bg-gray-800 hover:bg-gray-700 py-2 rounded text-center transition-colors border border-gray-600 border-dashed">
                    <span className="flex items-center justify-center gap-2 text-sm text-gray-300">
                        <Upload size={16} /> Load Custom Model
                    </span>
                    <input
                        type="file"
                        accept=".glb,.gltf"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                </label>

                {/* Model Scale */}
                <div className="bg-gray-800/50 p-2 rounded">
                    <div className="flex justify-between text-xs mb-1 text-gray-400">
                        <span>Model Scale: {modelScale.toFixed(1)}x</span>
                        <button onClick={() => setModelScale(1)} className="text-blue-400 hover:text-blue-300">Reset</button>
                    </div>
                    <input
                        type="range"
                        min="0.1"
                        max="5.0"
                        step="0.1"
                        value={modelScale}
                        onChange={(e) => setModelScale(parseFloat(e.target.value))}
                        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                {/* Camera Toggle */}
                <button
                    onClick={() => setCameraMode(cameraMode === 'ORBIT' ? 'TOP_DOWN' : 'ORBIT')}
                    className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 py-2 rounded transition-colors text-sm"
                >
                    <Camera size={16} />
                    {cameraMode === 'ORBIT' ? 'Switch to Top View' : 'Switch to Orbit View'}
                </button>
            </div>
        </div>
    );
}
