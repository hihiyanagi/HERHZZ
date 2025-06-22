import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TestComponent from "./test-component";
import ConsistentBackground from "@/components/ConsistentBackground";
// import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// 测试 ConsistentBackground 组件
const TestConsistentBackground = () => (
  <ConsistentBackground>
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ color: 'white', fontSize: '24px', marginBottom: '20px' }}>
        🌙 ConsistentBackground 测试
      </h1>
      <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.1)', 
        padding: '20px', 
        borderRadius: '10px',
        backdropFilter: 'blur(10px)'
      }}>
        <p style={{ color: 'white', fontSize: '16px' }}>
          如果你看到这个带有星空背景的消息，说明 ConsistentBackground 组件工作正常！
        </p>
        <TestComponent />
      </div>
    </div>
  </ConsistentBackground>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TestConsistentBackground />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
