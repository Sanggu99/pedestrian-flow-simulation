import { Environment, SoftShadows } from '@react-three/drei';

export default function Lighting() {
    return (
        <>
            <Environment preset="city" />
            <SoftShadows size={10} samples={10} focus={0.5} />

            <ambientLight intensity={0.5} />
            <directionalLight
                position={[10, 20, 10]}
                intensity={1}
                castShadow
                shadow-mapSize={[1024, 1024]}
                shadow-bias={-0.0001}
            />
        </>
    );
}
