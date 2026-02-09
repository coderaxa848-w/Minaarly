import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";

import Auth from "./pages/Auth";
import MosqueDetail from "./pages/MosqueDetail";
import NotFound from "./pages/NotFound";
import { AdminRoute, AdminLayout } from "@/components/admin";
import { AdminDashboard, MosquesList, MosqueForm, ClaimsList, UsersList, EventsList, ImportMosques } from "@/pages/admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="minaarly-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              
              <Route path="/auth" element={<Auth />} />
              <Route path="/mosque/:slug" element={<MosqueDetail />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="mosques" element={<MosquesList />} />
                <Route path="mosques/new" element={<MosqueForm />} />
                <Route path="mosques/:id/edit" element={<MosqueForm />} />
                <Route path="claims" element={<ClaimsList />} />
                <Route path="users" element={<UsersList />} />
                <Route path="events" element={<EventsList />} />
                <Route path="import" element={<ImportMosques />} />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
