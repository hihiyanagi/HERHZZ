import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ConsistentBackground from "@/components/ConsistentBackground";
import Introduction from "@/components/Introduction";
// import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// 测试 Introduction 组件
const TestIntroduction = () => (
  <ConsistentBackground>
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.1)', 
        padding: '20px', 
        borderRadius: '10px',
        backdropFilter: 'blur(10px)',
        marginBottom: '20px'
      }}>
        <h1 style={{ color: 'white', fontSize: '24px', marginBottom: '10px' }}>
          📝 Introduction 组件测试
        </h1>
        <p style={{ color: 'white', fontSize: '16px' }}>
          如果下面显示了 Introduction 组件内容，说明它工作正常。如果白屏，说明问题在 Introduction 组件中。
        </p>
      </div>
      
      {/* 这里测试 Introduction 组件 */}
      <Introduction />
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
          <Route path="/" element={<TestIntroduction />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
