import { useGLTF } from '@react-three/drei';
import { useSimulationStore } from '@/store/useSimulationStore';
import { useEffect } from 'react';
import * as THREE from 'three';

export default function ModelLoader() {
    const modelUrl = useSimulationStore((state) => state.modelUrl);

    // This hook caches results, so if we change the URL it should fetch the new one.
    // We conditionally render this component only when modelUrl is present in the parent,
    // but to be safe we can return null here too.
    if (!modelUrl) return null;

    return <Model url={modelUrl} />;
}

function Model({ url }: { url: string }) {
    const { scene } = useGLTF(url);

    // Auto-fix materials
    useEffect(() => {
        if (scene) {
            scene.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    // Replace with a standard material that reacts to light
                    // preserving the original color if possible, otherwise white
                    const originalMaterial = mesh.material as THREE.MeshStandardMaterial; // Assumption
                    const color = originalMaterial?.color || new THREE.Color('#cccccc');

                    mesh.material = new THREE.MeshStandardMaterial({
                        color: color,
                        roughness: 0.5,
                        metalness: 0.1,
                        side: THREE.DoubleSide
                    });

                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                }
            });
        }
    }, [scene]);

    const scale = useSimulationStore(state => state.modelScale);

    return <primitive object={scene} scale={[scale, scale, scale]} />;
}
