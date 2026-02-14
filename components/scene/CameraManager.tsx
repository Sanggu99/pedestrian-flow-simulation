import { OrbitControls, OrthographicCamera, PerspectiveCamera } from '@react-three/drei';
import { useSimulationStore } from '@/store/useSimulationStore';
import { useRef } from 'react';

export default function CameraManager() {
    const cameraMode = useSimulationStore((state) => state.cameraMode);
    const orbitRef = useRef<any>(null);

    return (
        <>
            {cameraMode === 'ORBIT' && (
                <>
                    <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={50} />
                    <OrbitControls ref={orbitRef} makeDefault />
                </>
            )}

            {cameraMode === 'TOP_DOWN' && (
                <>
                    <OrthographicCamera
                        makeDefault
                        position={[0, 50, 0]}
                        zoom={15}
                        near={0.1}
                        far={1000}
                        onUpdate={c => c.lookAt(0, 0, 0)}
                    />
                    {/* Simple controls for top-down panning if needed, or static */}
                    <OrbitControls
                        enableRotate={false}
                        screenSpacePanning
                        makeDefault
                    />
                </>
            )}
        </>
    );
}
