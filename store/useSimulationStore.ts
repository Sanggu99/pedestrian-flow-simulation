import { create } from 'zustand';

interface SimulationStore {
  isRunning: boolean;
  toggleSimulation: () => void;
  modelUrl: string | null;
  setModelUrl: (url: string) => void;
  modelScale: number;
  setModelScale: (scale: number) => void;
  timeScale: number;
  setTimeScale: (scale: number) => void;
  cameraMode: 'ORBIT' | 'TOP_DOWN';
  setCameraMode: (mode: 'ORBIT' | 'TOP_DOWN') => void;

  // Visualization Toggles
  showHeatmap: boolean;
  setShowHeatmap: (show: boolean) => void;
  showTrajectory: boolean;
  setShowTrajectory: (show: boolean) => void;

  // Evacuation Mode
  isEvacuation: boolean;
  toggleEvacuation: () => void;

  // Layout System
  currentLayoutId: string;
  setLayoutId: (id: string) => void;

  // Exit Control
  activeExitIndices: number[]; // Indices of enabled exits in the current layout
  toggleExit: (index: number) => void;
  setActiveExits: (indices: number[]) => void;

  // Visuals Reset Signal
  trajectoryID: number;
  resetTrajectory: () => void;
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  isRunning: true,
  toggleSimulation: () => set((state) => ({ isRunning: !state.isRunning })),
  modelUrl: null,
  setModelUrl: (url) => set({ modelUrl: url }),
  modelScale: 1.0,
  setModelScale: (scale) => set({ modelScale: scale }),
  timeScale: 1.0,
  setTimeScale: (scale) => set({ timeScale: scale }),
  cameraMode: 'ORBIT',
  setCameraMode: (mode) => set({ cameraMode: mode }),

  showHeatmap: true,
  setShowHeatmap: (show) => set({ showHeatmap: show }),
  showTrajectory: false,
  setShowTrajectory: (show) => set({ showTrajectory: show }),

  isEvacuation: false,
  toggleEvacuation: () => set((state) => ({ isEvacuation: !state.isEvacuation })),

  currentLayoutId: 'EMPTY',
  setLayoutId: (id) => set({ currentLayoutId: id, activeExitIndices: [] }), // Reset active exits when layout changes (will be re-init in UI)

  activeExitIndices: [0, 1, 2, 3],
  toggleExit: (index) => set((state) => {
    const newIndices = state.activeExitIndices.includes(index)
      ? state.activeExitIndices.filter(i => i !== index)
      : [...state.activeExitIndices, index];
    return { activeExitIndices: newIndices };
  }),
  setActiveExits: (indices) => set({ activeExitIndices: indices }),

  trajectoryID: 0,
  resetTrajectory: () => set((state) => ({ trajectoryID: state.trajectoryID + 1 })),
}));
