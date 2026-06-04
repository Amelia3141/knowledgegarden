import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface Props {
  x: number;
  y: number;
  onDone: () => void;
  variant?: 'bloom' | 'water';
}

const PALETTES = {
  bloom: ['#ffc9d4', '#ffe9a8', '#dcc9ff', '#bfe3ff', '#bde6cf'],
  water: ['#bfe3ff', '#a9d6ff', '#cdeefb', '#bfe3ff'],
};

/** A little celebratory burst — petals when a step blooms, droplets when watered. */
export default function BloomBurst({ x, y, onDone, variant = 'bloom' }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 1300);
    return () => clearTimeout(t);
  }, [onDone]);

  const bits = Array.from({ length: variant === 'water' ? 8 : 10 });
  const colors = PALETTES[variant];

  return (
    <g transform={`translate(${x} ${y - 30})`} pointerEvents="none">
      {bits.map((_, i) => {
        const angle = (i / bits.length) * Math.PI * 2;
        const dist = variant === 'water' ? 20 + (i % 3) * 8 : 38 + (i % 3) * 14;
        return (
          <motion.circle
            key={i}
            r={variant === 'water' ? 3.5 : 4.5}
            fill={colors[i % colors.length]}
            initial={{ x: 0, y: variant === 'water' ? -18 : 0, opacity: 1, scale: 0.4 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: variant === 'water' ? 30 : Math.sin(angle) * dist + 22,
              opacity: 0,
              scale: 1,
            }}
            transition={{ duration: variant === 'water' ? 0.9 : 1.2, ease: 'easeOut' }}
          />
        );
      })}
    </g>
  );
}
