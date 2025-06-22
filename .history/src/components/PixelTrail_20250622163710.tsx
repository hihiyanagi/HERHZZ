import React, { useEffect, useRef, useState } from 'react';

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
  gridSize = 50,
  trailSize = 0.1,
  maxAge = 250,
  interpolate = 5,
  color = "#fff",
  gooeyFilter = { id: "custom-goo-filter", strength: 2 }
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const parent = canvasRef.current.parentElement;
        if (parent) {
          setDimensions({
            width: parent.offsetWidth,
            height: parent.offsetHeight
          });
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置canvas尺寸
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const handleMouseMove = (e: MouseEvent) => {
      // 获取canvas相对于viewport的位置
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      // 只有当鼠标在canvas区域内时才添加像素
      if (mouseRef.current.x >= 0 && mouseRef.current.x <= rect.width && 
          mouseRef.current.y >= 0 && mouseRef.current.y <= rect.height) {
        // 添加新像素
        for (let i = 0; i < interpolate; i++) {
          pixelsRef.current.push({
            x: mouseRef.current.x + (Math.random() - 0.5) * gridSize,
            y: mouseRef.current.y + (Math.random() - 0.5) * gridSize,
            age: 0,
            opacity: 1
          });
        }
      }
    };

    const animate = () => {
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

    // 将事件监听器添加到window而不是canvas
    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, gridSize, trailSize, maxAge, interpolate, color]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {/* SVG滤镜定义 */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id={gooeyFilter.id}>
            <feGaussianBlur in="SourceGraphic" stdDeviation={gooeyFilter.strength} />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
            />
            <feComposite in="SourceGraphic" in2="blur" operator="atop" />
          </filter>
        </defs>
      </svg>
      
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          filter: `url(#${gooeyFilter.id})`,
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default PixelTrail; 