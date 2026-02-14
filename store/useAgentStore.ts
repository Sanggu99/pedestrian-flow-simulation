import { create } from 'zustand';
import { Vector3 } from 'three';

export type AgentType = 'VISITOR';
export type AgentState = 'IDLE' | 'WALKING' | 'PANIC';

export interface Agent {
    id: string;
    type: AgentType;
    position: Vector3;
    velocity: Vector3;
    goal: Vector3 | null;
    state: AgentState;
    speed: number;
}

interface AgentStore {
    agents: Agent[];
    addAgent: (agent: Agent) => void;
    addAgents: (agents: Agent[]) => void;
    updateAgentPosition: (id: string, position: Vector3, velocity: Vector3) => void;
    setAgentGoal: (id: string, goal: Vector3) => void;
    clearAgents: () => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
    agents: [],
    addAgent: (agent) => set((state) => ({ agents: [...state.agents, agent] })),
    addAgents: (newAgents) => set((state) => ({ agents: [...state.agents, ...newAgents] })),
    updateAgentPosition: (id, position, velocity) =>
        set((state) => ({
            agents: state.agents.map((a) =>
                a.id === id ? { ...a, position, velocity } : a
            ),
        })),
    setAgentGoal: (id, goal) =>
        set((state) => ({
            agents: state.agents.map((a) =>
                a.id === id ? { ...a, goal, state: 'WALKING' } : a
            ),
        })),
    clearAgents: () => set({ agents: [] }),
}));
