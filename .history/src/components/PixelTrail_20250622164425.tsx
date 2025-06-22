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
  gridSize = 18,
  trailSize = 0.25,
  maxAge = 140,
  interpolate = 3,
  color = "rgba(251, 191, 36, 0.6)",
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

      // 添加新像素 - 使用正态分布让粒子更集中在中心
      for (let i = 0; i < interpolate; i++) {
        // 生成更集中的随机分布
        const angle = Math.random() * Math.PI * 2;
        const distance = (Math.random() * 0.5 + Math.random() * 0.5) * gridSize * 0.5; // 正态分布近似
        
        pixelsRef.current.push({
          x: mouse.x + Math.cos(angle) * distance,
          y: mouse.y + Math.sin(angle) * distance,
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
          
          // 绘制像素 - 使用渐变效果
          const size = trailSize * gridSize * pixel.opacity;
          
          // 创建径向渐变
          const gradient = ctx.createRadialGradient(
            pixel.x, pixel.y, 0,
            pixel.x, pixel.y, size * 1.5
          );
          gradient.addColorStop(0, color);
          gradient.addColorStop(0.7, color.replace(/[\d\.]+\)$/g, `${pixel.opacity * 0.3})`));
          gradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(pixel.x, pixel.y, size * 1.5, 0, Math.PI * 2);
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