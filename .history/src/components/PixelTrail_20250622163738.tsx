import React, { useEffect, useRef } from 'react';

interface PixelTrailProps {
  gridSize?: number;
  trailSize?: number;
  maxAge?: number;
  interpolate?: number;
  color?: string;
  gooeyFilter?: {
    id: string;
    strength: number;
  };
}

interface Pixel {
  x: number;
  y: number;
  age: number;
  opacity: number;
}

const PixelTrail: React.FC<PixelTrailProps> = ({
  gridSize = 25,
  trailSize = 0.1,
  maxAge = 150,
  interpolate = 2,
  color = "rgba(251, 191, 36, 0.8)",
  gooeyFilter = { id: "custom-goo-filter", strength: 2 }
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('Canvas not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('Canvas context not found');
      return;
    }

    console.log('PixelTrail component mounted');

    // 设置canvas尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      console.log(`Canvas resized to: ${canvas.width}x${canvas.height}`);
    };
    
    resizeCanvas();

    const handleMouseMove = (e: MouseEvent) => {
      const mouse = {
        x: e.clientX,
        y: e.clientY
      };

      // 添加新像素
      for (let i = 0; i < interpolate; i++) {
        pixelsRef.current.push({
          x: mouse.x + (Math.random() - 0.5) * gridSize,
          y: mouse.y + (Math.random() - 0.5) * gridSize,
          age: 0,
          opacity: 1
        });
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;

      // 清除画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 更新和绘制像素
      pixelsRef.current = pixelsRef.current.filter(pixel => {
        pixel.age += 1;
        pixel.opacity = Math.max(0, 1 - (pixel.age / maxAge));

        if (pixel.age < maxAge) {
          ctx.save();
          
          // 设置像素样式
          ctx.globalAlpha = pixel.opacity;
          ctx.fillStyle = color;
          
          // 绘制像素
          const size = trailSize * gridSize * pixel.opacity;
          ctx.beginPath();
          ctx.arc(pixel.x, pixel.y, size, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
          return true;
        }
        return false;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // 监听事件
    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', resizeCanvas);
    
    // 开始动画
    animate();

    console.log('PixelTrail event listeners added');

    return () => {
      console.log('PixelTrail cleanup');
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gridSize, trailSize, maxAge, interpolate, color]);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      pointerEvents: 'none',
      zIndex: 999
    }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          display: 'block'
        }}
      />
    </div>
  );
};

export default PixelTrail; 