import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ExplosionEffect
 * Three.js based explosion particle system with physics
 * Triggered after creature generation completes
 */
export default function ExplosionEffect({ isActive, onComplete, intensity = 1 }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Initialize Three.js scene
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    sceneRef.current = scene;

    // Create particles
    const particleCount = Math.ceil(80 * intensity);
    const particles = [];

    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];

    // Fire colors
    const fireColors = [
      new THREE.Color(0xFF6B00), // Orange
      new THREE.Color(0xFF8C00), // Dark Orange
      new THREE.Color(0xFF2D00), // Red-Orange
      new THREE.Color(0xDC143C), // Crimson
      new THREE.Color(0xFFD700), // Gold
      new THREE.Color(0xFFA500)  // Orange
    ];

    for (let i = 0; i < particleCount; i++) {
      // Random position in sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.2 + Math.random() * 0.5;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions.push(x, y, z);

      // Velocity away from center with randomness
      const speed = 4 + Math.random() * 6;
      const vx = x * speed + (Math.random() - 0.5) * 2;
      const vy = y * speed + (Math.random() - 0.5) * 2;
      const vz = z * speed + (Math.random() - 0.5) * 2;

      velocities.push(vx, vy, vz);

      // Particle object
      particles.push({
        position: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(vx, vy, vz),
        acceleration: new THREE.Vector3(0, -9.8 * 0.5, 0), // Gravity
        life: 1.0,
        maxLife: 1.0 + Math.random() * 0.5,
        color: fireColors[Math.floor(Math.random() * fireColors.length)],
        size: 0.1 + Math.random() * 0.3
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));

    // Create material with custom shader for glow effect
    const material = new THREE.ShaderMaterial({
      uniforms: {
        texture: { value: new THREE.CanvasTexture(createParticleTexture()) }
      },
      vertexShader: `
        attribute vec3 color;
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vColor = color;
          vAlpha = 1.0;
          gl_PointSize = 20.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D texture;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vec4 texColor = texture2D(texture, gl_PointCoord);
          gl_FragColor = vec4(vColor, texColor.a * vAlpha);
        }
      `,
      transparent: true,
      sizeAttenuation: true,
      fog: false
    });

    // Create points and add to scene
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Add light for illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFF6B00, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    particlesRef.current = particles;

    // Animation loop
    let startTime = Date.now();
    const duration = 2000; // 2 seconds

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Update particles
      particles.forEach((p, idx) => {
        // Update life
        p.life -= 1 / 60;

        // Physics simulation
        p.velocity.add(p.acceleration);
        p.position.add(p.velocity.clone().multiplyScalar(0.016)); // Assuming 60 FPS

        // Damping
        p.velocity.multiplyScalar(0.98);

        // Update geometry
        geometry.attributes.position.array[idx * 3] = p.position.x;
        geometry.attributes.position.array[idx * 3 + 1] = p.position.y;
        geometry.attributes.position.array[idx * 3 + 2] = p.position.z;
      });

      geometry.attributes.position.needsUpdate = true;

      // Update material opacity
      material.uniforms.opacity = { value: 1 - progress * 0.5 };

      renderer.render(scene, camera);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Cleanup
        renderer.dispose();
        geometry.dispose();
        material.dispose();
        container.removeChild(renderer.domElement);
        onComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    // Handle window resize
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      try {
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      } catch (e) {
        // Cleanup error, ignore
      }
    };
  }, [isActive, onComplete, intensity]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full rounded-lg overflow-hidden pointer-events-none"
    />
  );
}

/**
 * Creates a radial gradient texture for particles
 */
function createParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;

  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);

  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.5, 'rgba(255, 200, 0, 0.8)');
  gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  return canvas;
}
