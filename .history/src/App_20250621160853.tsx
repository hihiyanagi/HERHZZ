import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TestComponent from "./test-component";
// import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// 创建一个简单的首页组件用于测试
const SimpleHomePage = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1 style={{ color: '#333', fontSize: '24px' }}>🏠 首页测试</h1>
    <p>路由系统正常工作！</p>
    <TestComponent />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="p-4 border-b bg-white/50 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="h-5 w-5 text-yellow-600 mt-0.5">⚠️</div>
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">调试模式</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      正在逐步调试组件问题...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <main className="max-w-4xl mx-auto p-4">
            <Routes>
              <Route path="/" element={<SimpleHomePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
