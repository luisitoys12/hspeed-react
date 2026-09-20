import { Suspense, lazy, Component, ErrorInfo } from "react";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Route, Switch, useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Toaster } from "@/components/ui/toaster";
import TopNavBar from "@/components/TopNavBar";
import ThemeDecoBar from "@/components/ThemeDecoBar";
import ThemeParticles from "@/components/ThemeParticles";
import Footer from "@/components/Footer";
import { lazyWithPreload } from "@/lib/lazyLoader";

// Error Boundary
class ErrorBoundary extends Component<{ children: any; fallback?: React.ReactNode }> {
  state: { hasError: boolean; error?: Error };
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[HSpeed ErrorBoundary]", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-black text-primary">Ups, algo salió mal</h2>
            <p className="text-muted-foreground">
              {this.state.error?.message || "Ocurrió un error inesperado"}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="bg-primary text-black px-6 py-2 rounded-xl font-bold hover:opacity-90 transition-all"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy-loaded pages with preload support
const HomePage = lazyWithPreload(() => import("@/pages/HomePage"));
const NewsPage = lazyWithPreload(() => import("@/pages/NewsPage"));
const NewsDetailPage = lazyWithPreload(() => import("@/pages/NewsDetailPage"));
const EventsPage = lazyWithPreload(() => import("@/pages/EventsPage"));
const SchedulePage = lazyWithPreload(() => import("@/pages/SchedulePage"));
const TeamPage = lazyWithPreload(() => import("@/pages/TeamPage"));
const BadgesPage = lazyWithPreload(() => import("@/pages/BadgesPage"));
const MarketplacePage = lazyWithPreload(() => import("@/pages/MarketplacePage"));
const ImagerPage = lazyWithPreload(() => import("@/pages/ImagerPage"));
const ForumPage = lazyWithPreload(() => import("@/pages/ForumPage"));
const ForumThreadPage = lazyWithPreload(() => import("@/pages/ForumThreadPage"));
const ContactPage = lazyWithPreload(() => import("@/pages/ContactPage"));
const LoginPage = lazyWithPreload(() => import("@/pages/LoginPage"));
const RegisterPage = lazyWithPreload(() => import("@/pages/RegisterPage"));
const AdminPanel = lazyWithPreload(() => import("@/pages/AdminPanel"));
const DJPanelPage = lazyWithPreload(() => import("@/pages/DJPanelPage"));
const MessagesPage = lazyWithPreload(() => import("@/pages/MessagesPage"));
const ArmarioPage = lazyWithPreload(() => import("@/pages/ArmarioPage"));
const HerramientasPage = lazyWithPreload(() => import("@/pages/HerramientasPage"));
const ShopPage = lazyWithPreload(() => import("@/pages/ShopPage"));
const CatalogPage = lazyWithPreload(() => import("@/pages/CatalogPage"));
const LegalPage = lazyWithPreload(() => import("@/pages/LegalPage"));
const MaintenancePage = lazyWithPreload(() => import("@/pages/MaintenancePage"));
const ProfilePage = lazyWithPreload(() => import("@/pages/ProfilePage"));
const FutbolHubPage = lazyWithPreload(() => import("@/pages/FutbolHubPage"));
const SongHistoryPage = lazyWithPreload(() => import("@/pages/SongHistoryPage"));
const RadioPage = lazyWithPreload(() => import("@/pages/RadioPage"));
const VipPage = lazyWithPreload(() => import("@/pages/VipPage"));
const RoomsPage = lazyWithPreload(() => import("@/pages/RoomsPage"));
const FeriaPage = lazyWithPreload(() => import("@/pages/FeriaPage"));
const SupportPage = lazyWithPreload(() => import("@/pages/SupportPage"));
const TendenciasPage = lazyWithPreload(() => import("@/pages/TendenciasPage"));
const SpeedShortDetailPage = lazyWithPreload(() => import("@/pages/SpeedShortDetailPage"));
const MemeCreatorPage = lazyWithPreload(() => import("@/pages/MemeCreatorPage"));
const DjHorariosPage = lazyWithPreload(() => import("@/pages/DjHorariosPage"));
const Habbo3D = lazyWithPreload(() => import("@/pages/Habbo3D"));
const ReaccionesPage = lazyWithPreload(() => import("@/pages/ReaccionesPage"));
const JuegosPage = lazyWithPreload(() => import("@/pages/JuegosPage"));
const CartasPage = lazyWithPreload(() => import("@/pages/CartasPage"));
const CinePage = lazyWithPreload(() => import("@/pages/CinePage"));
const MisionesPage = lazyWithPreload(() => import("@/pages/MisionesPage"));
const UserYoutubePage = lazyWithPreload(() => import("@/pages/UserYoutubePage"));
const NotFound = lazyWithPreload(() => import("@/pages/not-found"));

// Loading fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse space-y-4 w-full max-w-2xl mx-auto">
        <div className="h-8 bg-card rounded-lg w-3/4 mx-auto" />
        <div className="h-4 bg-card rounded-lg w-1/2 mx-auto" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-64 bg-card rounded-xl" />
          <div className="h-64 bg-card rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [location] = useLocation();
  const { user, loading } = useAuth();
  usePageTitle(location);

  const { data: config } = useQuery<any>({
    queryKey: ["/api/config"],
    retry: false,
  });

  // Modo de mantenimiento activo sin menús
  const maintenanceEnabled = true;
  const canBypassMaintenance = user?.role === "admin";

  if (maintenanceEnabled && !canBypassMaintenance) {
    return (
      <Suspense fallback={<PageLoader />}>
        <MaintenancePage />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ThemeParticles />
      <TopNavBar />
      <ThemeDecoBar />
      <main className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
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
              <Route path="/forum" component={ForumPage} />
              <Route path="/forum/:id" component={ForumThreadPage} />
              <Route path="/contact" component={ContactPage} />
              <Route path="/login" component={LoginPage} />
              <Route path="/register" component={RegisterPage} />
              <Route path="/panel" component={AdminPanel} />
              <Route path="/djpanel" component={DJPanelPage} />
              <Route path="/messages" component={MessagesPage} />
              <Route path="/armario" component={ArmarioPage} />
              <Route path="/herramientas" component={HerramientasPage} />
              <Route path="/tienda" component={ShopPage} />
              <Route path="/shop" component={ShopPage} />
              <Route path="/catalog" component={CatalogPage} />
              <Route path="/legal" component={LegalPage} />
              <Route path="/privacy" component={LegalPage} />
              <Route path="/maintenance" component={MaintenancePage} />
              <Route path="/profile/:username" component={ProfilePage} />
              <Route path="/futbol-hub" component={FutbolHubPage} />
              <Route path="/futbol-hub/pronosticos" component={FutbolHubPage} />
              <Route path="/futbol-hub/ranking" component={FutbolHubPage} />
              <Route path="/futbol-hub/equipos" component={FutbolHubPage} />
              <Route path="/futbol-hub/aventura" component={FutbolHubPage} />
              <Route path="/futbol-hub/mini/rapido" component={FutbolHubPage} />
              <Route path="/futbol-hub/mini/sorteos" component={FutbolHubPage} />
              <Route path="/futbol-hub/torneos" component={FutbolHubPage} />
              <Route path="/futbol-hub/:rest*" component={FutbolHubPage} />
              <Route path="/song-history" component={SongHistoryPage} />
              <Route path="/radio" component={RadioPage} />
              <Route path="/vip" component={VipPage} />
              <Route path="/rooms" component={RoomsPage} />
              <Route path="/feria" component={FeriaPage} />
              <Route path="/soporte" component={SupportPage} />
              <Route path="/tendencias" component={TendenciasPage} />
              <Route path="/tendencias/:id" component={SpeedShortDetailPage} />
              <Route path="/memes" component={MemeCreatorPage} />
              <Route path="/dj-horarios" component={DjHorariosPage} />
              <Route path="/habbo3d" component={Habbo3D} />
              <Route path="/reacciones" component={ReaccionesPage} />
              <Route path="/juegos" component={JuegosPage} />
              <Route path="/cartas" component={CartasPage} />
              <Route path="/cine" component={CinePage} />
              <Route path="/misiones" component={MisionesPage} />
              <Route path="/mis-shorts" component={UserYoutubePage} />
              <Route path="/youtube" component={UserYoutubePage} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
