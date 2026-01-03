import React from 'react';
import ElectricWavesShader from '../components/ui/ElectricWavesShader';

export default function ShaderDemo() {
    return (
        <div className="w-full h-screen relative overflow-hidden">
            <ElectricWavesShader />
            <div className="absolute top-10 left-10 z-10 text-white">
                <h1 className="text-4xl font-bold">Electric Waves Shader Demo</h1>
                <p>Interact with the controls below</p>
            </div>
        </div>
    );
}
