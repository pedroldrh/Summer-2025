
import React, { useRef, useEffect, useState } from 'react';

// Preset configurations for cool shapes
const PRESETS = [
  { name: 'Dendrite Spiral', c: { re: -0.8, im: 0.156 }, mode: 'rectangular', zRect: { re: 0, im: 0 }, radius: 0, angle: 0, iterations: 1200, zoom: 2.5 },
  { name: 'Petal Loops', c: { re: -0.4, im: 0.6 }, mode: 'rectangular', zRect: { re: -0.2, im: 0.3 }, radius: 0, angle: 0, iterations: 1000, zoom: 3 },
  { name: 'Filament Weave', c: { re: -0.123, im: 0.745 }, mode: 'rectangular', zRect: { re: 0.1, im: 0.1 }, radius: 0, angle: 0, iterations: 1000, zoom: 2.5 },
  { name: 'Butterfly Swirl', c: { re: 0.285, im: 0 }, mode: 'rectangular', zRect: { re: -0.5, im: 0.5 }, radius: 0, angle: 0, iterations: 800, zoom: 2 },
  { name: 'Dragon Tendrils', c: { re: -0.70176, im: -0.3842 }, mode: 'rectangular', zRect: { re: 0.3, im: 0.3 }, radius: 0, angle: 0, iterations: 1200, zoom: 3 },
  { name: 'Polar Spiral', c: { re: 0.285, im: 0.01 }, mode: 'polar', zRect: { re: 0, im: 0 }, radius: 0.8, angle: 45, iterations: 1000, zoom: 2.5 }
];

export default function FractalVisualizer() {
  const canvasRef = useRef(null);
  const [c, setC] = useState({ re: 2, im: 0 });
  const [mode, setMode] = useState('rectangular');
  const [zRect, setZRect] = useState({ re: 0, im: 0 });
  const [radius, setRadius] = useState(0);
  const [angle, setAngle] = useState(0); // in degrees
  const [iterations, setIterations] = useState(100);
  const [zoom, setZoom] = useState(1);
  const [showJulia, setShowJulia] = useState(true);
  const [showOrbit, setShowOrbit] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState('');

  // Apply a preset by name
  const applyPreset = (presetName) => {
    const p = PRESETS.find((p) => p.name === presetName);
    if (!p) return;
    setC(p.c);
    setMode(p.mode);
    setZRect(p.zRect);
    setRadius(p.radius);
    setAngle(p.angle);
    setIterations(p.iterations);
    setZoom(p.zoom);
    setSelectedPreset(p.name);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.createImageData(width, height);

    // Determine z0 based on mode
    let z0Re, z0Im;
    if (mode === 'polar') {
      const theta = (angle * Math.PI) / 180;
      z0Re = radius * Math.cos(theta);
      z0Im = radius * Math.sin(theta);
    } else {
      z0Re = zRect.re;
      z0Im = zRect.im;
    }

    // Draw Julia set background if enabled
    if (showJulia) {
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          let a = (x - width / 2) / (0.5 * zoom * width);
          let b = (y - height / 2) / (0.5 * zoom * height);
          let i = 0;
          while (i < iterations && a * a + b * b < 4) {
            const tmp = a * a - b * b + c.re;
            b = 2 * a * b + c.im;
            a = tmp;
            i++;
          }
          const p = (x + y * width) * 4;
          const hue = 255 - Math.floor((255 * i) / iterations);
          imgData.data[p] = hue;
          imgData.data[p + 1] = hue;
          imgData.data[p + 2] = hue;
          imgData.data[p + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } else {
      ctx.clearRect(0, 0, width, height);
    }

    // Draw orbit of z0 if enabled
    if (showOrbit) {
      let a = z0Re;
      let b = z0Im;
      ctx.beginPath();
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 1;
      for (let i = 0; i < iterations; i++) {
        const px = width / 2 + a * (0.5 * zoom * width);
        const py = height / 2 + b * (0.5 * zoom * height);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
        const tmp = a * a - b * b + c.re;
        b = 2 * a * b + c.im;
        a = tmp;
        if (a * a + b * b > 1e6) break;
      }
      ctx.stroke();
    }
  };

  useEffect(() => { draw(); }, [c, mode, zRect, radius, angle, iterations, zoom, showJulia, showOrbit]);

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <canvas ref={canvasRef} width={600} height={600} className="border rounded-lg shadow-lg" />
      <div className="space-y-4">
        {/* Controls omitted for brevity */}
      </div>
    </div>
  );
}
