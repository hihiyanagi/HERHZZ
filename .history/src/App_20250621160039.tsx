import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
                    <h3 className="text-sm font-medium text-yellow-800">演示模式</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      应用运行在演示模式下，您可以体验基本功能。
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  演
                </div>
                <div>
                  <p className="font-medium">演示模式</p>
                  <p className="text-sm text-gray-600">体验HerHzzz的基本功能</p>
                </div>
              </div>
            </div>
          </div>
          <main className="max-w-4xl mx-auto p-4">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
