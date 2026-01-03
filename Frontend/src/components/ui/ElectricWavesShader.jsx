import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useAudio } from '../../context/AudioContext';

const ElectricWavesShader = () => {
    const containerRef = useRef(null);
    const materialRef = useRef();
    const { analyser, frequencyData } = useAudio();

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // 1) Renderer / Scene / Camera / Clock
        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setPixelRatio(window.devicePixelRatio);
            container.appendChild(renderer.domElement);
        } catch (err) {
            console.error('WebGL not supported', err);
            container.innerHTML = '<p style="color:white;text-align:center;">WebGL not available</p>';
            return;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const clock = new THREE.Clock();

        // 2) Enhanced GLSL shaders with audio uniforms
        const vertexShader = `
            void main() {
                gl_Position = vec4(position, 1.0);
            }
        `;

        const fragmentShader = `
            precision mediump float;

            uniform float u_time;
            uniform vec2 u_resolution;
            uniform float u_bass;
            uniform float u_mid;
            uniform float u_high;
            uniform float u_energy;

            // Improved wave pattern with audio reactivity
            float pattern(vec2 uv, float audioMod) {
                float intensity = 0.0;
                float waveCount = 5.0 + u_mid * 3.0; // More waves with mid frequencies
                float amplitude = 0.15 + u_bass * 0.35; // Bass drives amplitude
                float frequency = 2.0 + u_high * 2.0; // High frequencies modulate speed
                float brightness = 0.004 + u_energy * 0.008; // Overall energy = brightness
                
                for (float i = 0.0; i < 8.0; i++) {
                    if (i >= waveCount) break;
                    float timeScale = 1.0 + i * 0.3 + u_bass * 0.5;
                    uv.x += sin(u_time * timeScale + uv.y * frequency) * amplitude;
                    intensity += brightness / abs(uv.x + 0.001);
                }
                return intensity;
            }

            vec3 scene(vec2 uv) {
                vec3 color = vec3(0.0);
                vec2 ruv = vec2(uv.y, uv.x);
                
                float colorSeparation = 0.08 + u_mid * 0.15;
                
                // RGB channels driven by different frequencies
                // Red channel - bass reactive
                vec2 cuv_r = ruv + vec2(0.0, 0.0);
                color.r += pattern(cuv_r, u_bass) * (0.8 + u_bass * 0.4);
                
                // Green channel - mid reactive  
                vec2 cuv_g = ruv + vec2(0.0, colorSeparation);
                color.g += pattern(cuv_g, u_mid) * (0.9 + u_mid * 0.3);
                
                // Blue channel - high reactive
                vec2 cuv_b = ruv + vec2(0.0, colorSeparation * 2.0);
                color.b += pattern(cuv_b, u_high) * (0.7 + u_high * 0.5);
                
                return color;
            }

            void main() {
                vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
                vec3 col = scene(uv);
                
                // Add pulsing glow based on overall energy
                float glow = u_energy * 0.3;
                col += vec3(glow * 0.2, glow * 0.5, glow * 0.3);
                
                // Vignette effect
                float vignette = 1.0 - length(uv) * 0.5;
                col *= vignette;
                
                gl_FragColor = vec4(col, 1.0);
            }
        `;

        // 3) Material / Mesh with audio uniforms
        const uniforms = {
            u_time: { value: 0 },
            u_resolution: { value: new THREE.Vector2() },
            u_bass: { value: 0.0 },
            u_mid: { value: 0.0 },
            u_high: { value: 0.0 },
            u_energy: { value: 0.0 }
        };

        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader
        });
        materialRef.current = material;

        const geometry = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // 4) Handle resize
        const onResize = () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            renderer.setSize(width, height);
            uniforms.u_resolution.value.set(width, height);
        };
        window.addEventListener('resize', onResize);
        onResize();

        // 5) Animation loop with enhanced frequency analysis
        renderer.setAnimationLoop(() => {
            uniforms.u_time.value = clock.getElapsedTime();

            if (analyser && frequencyData) {
                analyser.getByteFrequencyData(frequencyData);
                const binCount = frequencyData.length;

                // Debug: Log every 60 frames (~1 second at 60fps)
                if (Math.floor(clock.getElapsedTime() * 60) % 60 === 0) {
                    const sample = Array.from(frequencyData.slice(0, 10));
                    console.log('Frequency data sample:', sample, 'Max:', Math.max(...frequencyData));
                }

                // Calculate frequency bands with weighted averages
                // Bass: 0-60Hz (bins 0-15 roughly for 44.1kHz sample rate)
                let bassSum = 0;
                const bassEnd = Math.floor(binCount * 0.06);
                for (let i = 0; i < bassEnd; i++) {
                    bassSum += frequencyData[i];
                }
                const bass = bassSum / (bassEnd * 255);

                // Mid: 60-2000Hz (bins 15-100 roughly)
                let midSum = 0;
                const midStart = bassEnd;
                const midEnd = Math.floor(binCount * 0.4);
                for (let i = midStart; i < midEnd; i++) {
                    midSum += frequencyData[i];
                }
                const mid = midSum / ((midEnd - midStart) * 255);

                // High: 2000-20000Hz (bins 100-256)
                let highSum = 0;
                const highStart = midEnd;
                for (let i = highStart; i < binCount; i++) {
                    highSum += frequencyData[i];
                }
                const high = highSum / ((binCount - highStart) * 255);

                // Overall energy (RMS-like calculation)
                let totalSum = 0;
                for (let i = 0; i < binCount; i++) {
                    totalSum += frequencyData[i] * frequencyData[i];
                }
                const energy = Math.sqrt(totalSum / binCount) / 255;

                // Apply smoothing for smoother visuals
                const smoothing = 0.7;
                uniforms.u_bass.value = uniforms.u_bass.value * smoothing + bass * (1 - smoothing);
                uniforms.u_mid.value = uniforms.u_mid.value * smoothing + mid * (1 - smoothing);
                uniforms.u_high.value = uniforms.u_high.value * smoothing + high * (1 - smoothing);
                uniforms.u_energy.value = uniforms.u_energy.value * smoothing + energy * (1 - smoothing);
            }

            renderer.render(scene, camera);
        });

        // 6) Cleanup
        return () => {
            window.removeEventListener('resize', onResize);
            renderer.setAnimationLoop(null);
            container.removeChild(renderer.domElement);
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, [analyser, frequencyData]);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -60%)',
                width: '600px',
                height: '300px',
                zIndex: 40,
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 0 60px rgba(0, 255, 150, 0.3)',
                pointerEvents: 'none'
            }}
            aria-label="Music visualizer"
        />
    );
};

export default ElectricWavesShader;

