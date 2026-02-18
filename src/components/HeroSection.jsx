import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

export default function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const titleY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const titleScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.85]);
  const particleLayer1Y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const particleLayer2Y = useTransform(scrollYProgress, [0, 1], [0, -350]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const particleCount = isMobile ? 15 : 40;

  const fireParticles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 2,
    duration: Math.random() * 4 + 3,
    delay: Math.random() * 3,
    layer: i % 2 === 0 ? 1 : 2,
    color: ['#FF6B00', '#FF2D00', '#FF8C00', '#fbbf24', '#DC143C'][Math.floor(Math.random() * 5)]
  }));

  return (
    <section
      ref={ref}
      className="hero-section relative min-h-screen overflow-hidden flex items-center justify-center"
    >
      {/* Deep background gradient */}
      <div className="absolute inset-0 hero-bg-gradient" />

      {/* Fire particle layers with parallax */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: particleLayer1Y }}>
        {fireParticles.filter(p => p.layer === 1).map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              filter: `blur(${particle.size > 5 ? 2 : 1}px)`,
            }}
            animate={{
              y: [0, -40 - Math.random() * 60, 0],
              x: [0, (Math.random() - 0.5) * 30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.4, 0.8, 1],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: particleLayer2Y }}>
        {fireParticles.filter(p => p.layer === 2).map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size * 0.7}px`,
              height: `${particle.size * 0.7}px`,
              backgroundColor: particle.color,
              filter: `blur(${particle.size > 4 ? 3 : 1}px)`,
            }}
            animate={{
              y: [0, -60 - Math.random() * 40, 0],
              x: [0, (Math.random() - 0.5) * 50, 0],
              opacity: [0.1, 0.6, 0.1],
              scale: [0.8, 1.6, 0.8],
            }}
            transition={{
              duration: particle.duration + 1,
              delay: particle.delay + 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Radial glow center */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,107,0,0.12) 0%, rgba(255,45,0,0.06) 40%, transparent 70%)',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Fire Horse SVG Silhouette */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.08,
        }}
        animate={{
          scale: [1, 1.04, 1],
          filter: [
            'drop-shadow(0 0 30px rgba(255,107,0,0.4))',
            'drop-shadow(0 0 60px rgba(255,107,0,0.7))',
            'drop-shadow(0 0 30px rgba(255,107,0,0.4))',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 200 200" width="400" height="400" fill="currentColor" className="text-orange-500">
          <path d="M160 140c-5-15-15-25-25-30 5-10 8-22 5-35-5-20-20-35-35-40 0-5-2-10-5-15-8-12-20-18-30-18-5 0-10 2-15 5-10-5-22-5-32 0-8 4-15 12-18 22-15 5-28 18-32 35-3 12 0 25 5 35-10 8-18 20-22 35-3 10 0 20 8 25 5 3 12 5 18 2l15-8c5 5 12 8 20 10l10 15c3 5 8 8 14 8h25c8 0 15-5 18-12l5-15c5-2 8-5 10-10 5-8 3-18-4-26zm-95-85c3-8 8-14 15-18 2-1 4-1 6 0 3 2 3 5 2 8-2 5-5 10-5 15 0 2 1 4 3 5 8 5 12 15 14 25 1 8-1 16-6 22-2 2-5 3-8 2-12-5-22-18-25-35-1-8 0-16 4-24zm55 95l-5 12c-1 2-3 4-6 4h-25c-2 0-3-1-4-3l-12-18c-1-2-3-3-5-3-8-2-15-5-20-12-2-2-2-5 0-7l2-3c5 3 12 5 18 5 15 0 28-8 35-20 5 5 12 8 18 12l8 5c2 1 3 3 4 5 2 5 0 10-3 15-2 3-4 6-5 8z"/>
        </svg>
      </motion.div>

      {/* Main title content with parallax */}
      <motion.div
        className="relative z-10 text-center px-4"
        style={{ y: titleY, opacity: titleOpacity, scale: titleScale }}
      >
        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 fire-text tracking-tight"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          IGNITION 2026
        </motion.h1>

        <motion.p
          className="text-xl md:text-3xl text-gray-300 mb-4 font-light tracking-wide"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        >
          The Year of the Fire Horse
        </motion.p>

        <motion.p
          className="text-sm md:text-base text-gray-500 mb-12 max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          AI-generated unique NFTs on Polygon Network. Forge your destiny.
        </motion.p>

        {/* Polygon badge */}
        <motion.div
          className="flex items-center justify-center gap-2 mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <span className="polygon-badge">
            <svg width="12" height="12" viewBox="0 0 38 33" fill="white">
              <path d="M29 10.2c-.7-.4-1.6-.4-2.4 0L21 13.5l-3.8 2.1-5.5 3.3c-.7.4-1.6.4-2.4 0L5 16.3c-.7-.4-1.2-1.2-1.2-2.1v-5c0-.8.4-1.6 1.2-2.1l4.3-2.5c.7-.4 1.6-.4 2.4 0L16 7.2c.7.4 1.2 1.2 1.2 2.1v3.3l3.8-2.2V7c0-.8-.4-1.6-1.2-2.1l-8-4.7c-.7-.4-1.6-.4-2.4 0L1.2 5C.4 5.4 0 6.2 0 7v9.4c0 .8.4 1.6 1.2 2.1l8.1 4.7c.7.4 1.6.4 2.4 0l5.5-3.2 3.8-2.2 5.5-3.2c.7-.4 1.6-.4 2.4 0l4.3 2.5c.7.4 1.2 1.2 1.2 2.1v5c0 .8-.4 1.6-1.2 2.1L29 27.5c-.7.4-1.6.4-2.4 0l-4.3-2.5c-.7-.4-1.2-1.2-1.2-2.1v-3.3l-3.8 2.2v3.3c0 .8.4 1.6 1.2 2.1l8.1 4.7c.7.4 1.6.4 2.4 0l8.1-4.7c.7-.4 1.2-1.2 1.2-2.1V16c0-.8-.4-1.6-1.2-2.1L29 10.2z"/>
            </svg>
            Polygon Network
          </span>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.a
        href="#forge"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-xs uppercase tracking-widest">Scroll to Forge</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
        </svg>
      </motion.a>
    </section>
  );
}
