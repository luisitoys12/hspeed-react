import { Router, Route, Switch, useLocation, Redirect } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { usePageTitle } from "@/hooks/usePageTitle";
import TopNavBar from "@/components/TopNavBar";
import ThemeDecoBar from "@/components/ThemeDecoBar";
import ThemeParticles from "@/components/ThemeParticles";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

// Pages
import HomePage from "@/pages/HomePage";
import NewsPage from "@/pages/NewsPage";
import NewsDetailPage from "@/pages/NewsDetailPage";
import EventsPage from "@/pages/EventsPage";
import SchedulePage from "@/pages/SchedulePage";
import TeamPage from "@/pages/TeamPage";
import BadgesPage from "@/pages/BadgesPage";
import MarketplacePage from "@/pages/MarketplacePage";
import ImagerPage from "@/pages/ImagerPage";
import ForumPage from "@/pages/ForumPage";
import ForumThreadPage from "@/pages/ForumThreadPage";
import ContactPage from "@/pages/ContactPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminPanel from "@/pages/AdminPanel";
import DJPanelPage from "@/pages/DJPanelPage";
import MessagesPage from "@/pages/MessagesPage";
import ArmarioPage from "@/pages/ArmarioPage";
import MaintenancePage from "@/pages/MaintenancePage";
import HerramientasPage from "@/pages/HerramientasPage";
import LegalPage from "@/pages/LegalPage";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      toast({
        title: "Acceso restringido",
        description: "Inicia sesión para entrar a este panel.",
        variant: "destructive",
      });
      setLocation("/login");
    } else if (!allowedRoles.includes(user.role)) {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para acceder a esta sección.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [user, allowedRoles, setLocation, toast]);

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

function Layout() {
  const [location] = useLocation();
  const { user } = useAuth();
  usePageTitle(location);

  // Check maintenance mode from config
  const { data: config } = useQuery<any>({
    queryKey: ["/api/config"],
    retry: false,
    staleTime: 30000,
  });

  const isMaintenanceMode = config?.maintenanceMode === true;
  const isStaff = user && (user.role === "admin" || user.role === "dj");

  // If maintenance mode is ON and user is NOT staff → show maintenance page
  if (isMaintenanceMode && !isStaff) {
    return (
      <div className="dark min-h-screen bg-background">
        <MaintenancePage />
      </div>
    );
  }

  return (
    <div className="dark min-h-screen flex flex-col bg-background">
      <TopNavBar />
      <ThemeDecoBar />
      <ThemeParticles />

      <main className="flex-1">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/news" component={NewsPage} />
          <Route path="/news/:id" component={NewsDetailPage} />
          <Route path="/events" component={EventsPage} />
          <Route path="/schedule" component={SchedulePage} />
          <Route path="/team" component={TeamPage} />
          <Route path="/badges" component={BadgesPage} />
          <Route path="/marketplace" component={MarketplacePage} />
          <Route path="/imager" component={ImagerPage} />
          <Route path="/herramientas" component={HerramientasPage} />
          <Route path="/forum" component={ForumPage} />
          <Route path="/forum/:threadId" component={ForumThreadPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/profile/:username" component={ProfilePage} />
          <Route path="/panel">
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPanel />
            </ProtectedRoute>
          </Route>
          <Route path="/panel/:section">
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPanel />
            </ProtectedRoute>
          </Route>
          <Route path="/djpanel">
            <ProtectedRoute allowedRoles={["admin", "dj"]}>
              <DJPanelPage />
            </ProtectedRoute>
          </Route>
          <Route path="/messages" component={MessagesPage} />
          <Route path="/armario" component={ArmarioPage} />
          <Route path="/maintenance" component={MaintenancePage} />
          <Route path="/legal" component={LegalPage} />
          <Route path="/privacy" component={LegalPage} />
          <Route component={NotFound} />
        </Switch>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router hook={useHashLocation}>
          <ThemeProvider>
            <Layout />
            <Toaster />
          </ThemeProvider>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}
