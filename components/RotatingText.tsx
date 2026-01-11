'use client';

import { useState, useEffect } from 'react';

const phrases = [
  'THE BIG GAME',
  'THE SUPER BOWL',
  'COLLEGE BOWL GAMES',
  'ANY FOOTBALL GAME',
];

export function RotatingText() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % phrases.length);
        setIsAnimating(false);
      }, 500); // Half of the animation duration
    }, 3500); // Change phrase every 3.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-block min-w-[300px] sm:min-w-[500px]">
      <span
        className={`inline-block transition-all duration-500 ${
          isAnimating
            ? 'opacity-0 -translate-y-4'
            : 'opacity-100 translate-y-0'
        }`}
      >
        {phrases[currentIndex]}
      </span>
    </span>
  );
}
