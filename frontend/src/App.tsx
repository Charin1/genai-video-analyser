import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Meetings from "./pages/Meetings";
import MeetingDetail from "./pages/MeetingDetail";
import NeuralCapture from "./pages/NeuralCapture";
import Rolodex from "./pages/Rolodex";
import SearchNexus from "./pages/SearchNexus";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="dark">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/meeting/:id" element={<MeetingDetail />} />
            <Route path="/capture" element={<NeuralCapture />} />
            <Route path="/rolodex" element={<Rolodex />} />
            <Route path="/search" element={<SearchNexus />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
