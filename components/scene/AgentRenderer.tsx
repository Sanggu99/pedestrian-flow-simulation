import { useAgentStore } from '@/store/useAgentStore';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

export default function AgentRenderer() {
    const agents = useAgentStore((state) => state.agents);
    const meshRef = useRef<THREE.InstancedMesh>(null);

    useFrame(() => {
        if (!meshRef.current) return;

        // Update instances
        agents.forEach((agent, i) => {
            const { position, type } = agent;
            tempObject.position.set(position.x, position.y + 1, position.z); // Offset for height
            tempObject.updateMatrix();
            meshRef.current!.setMatrixAt(i, tempObject.matrix);

            // Color (Uniform for Visitors, maybe vary shade slightly?)
            // Just Orange for now
            tempColor.set('#f97316'); // Orange-500
            meshRef.current!.setColorAt(i, tempColor);
        });

        meshRef.current.count = agents.length;
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, 1000]} castShadow>
            <capsuleGeometry args={[0.5, 1, 4, 8]} />
            <meshStandardMaterial />
        </instancedMesh>
    );
}
