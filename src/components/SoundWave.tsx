import { useEffect, useState } from 'react';

export default function SoundWave() {
  const [bars] = useState(Array.from({ length: 60 }, (_, i) => i));

  return (
    <div className="flex items-center justify-center gap-1 h-32">
      {bars.map((bar) => (
        <div
          key={bar}
          className="w-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-full animate-wave opacity-70"
          style={{
            height: `${20 + Math.abs(Math.sin(bar * 0.2)) * 60}%`,
            animationDelay: `${bar * 0.03}s`,
            animationDuration: `${1 + (bar % 3) * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}
