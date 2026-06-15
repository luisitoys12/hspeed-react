import { Suspense, lazy } from "react";
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
import AdminPanel from "@/pages/AdminPanel";
import DJPanelPage from "@/pages/DJPanelPage";
import MessagesPage from "@/pages/MessagesPage";
import ArmarioPage from "@/pages/ArmarioPage";
import HerramientasPage from "@/pages/HerramientasPage";
import ShopPage from "@/pages/ShopPage";
import CatalogPage from "@/pages/CatalogPage";
import LegalPage from "@/pages/LegalPage";
import MaintenancePage from "@/pages/MaintenancePage";
import ProfilePage from "@/pages/ProfilePage";
import MundialPage from "@/pages/MundialPage";
import SongHistoryPage from "@/pages/SongHistoryPage";
import VipPage from "@/pages/VipPage";
import RoomsPage from "@/pages/RoomsPage";
import SupportPage from "@/pages/SupportPage";
import NotFound from "@/pages/not-found";

const Habbo3D = lazy(() => import("@/pages/Habbo3D"));

function AppContent() {
	const [location] = useLocation();
	const { user, loading } = useAuth();
	usePageTitle(location);

	const { data: config } = useQuery<any>({
		queryKey: ["/api/config"],
		retry: false,
	});

	const maintenanceEnabled = config?.maintenanceMode === true;
	const canBypassMaintenance = user?.role === "admin";

	if (maintenanceEnabled && !loading && !canBypassMaintenance) {
		return <MaintenancePage />;
	}

	return (
		<div className="min-h-screen flex flex-col">
			<ThemeParticles />
			<TopNavBar />
			<ThemeDecoBar />
			<main className="flex-1">
				<Suspense fallback={null}>
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
						<Route path="/habbo3d" component={Habbo3D} />
						<Route path="/legal" component={LegalPage} />
						<Route path="/privacy" component={LegalPage} />
						<Route path="/maintenance" component={MaintenancePage} />
						<Route path="/profile/:username" component={ProfilePage} />
						<Route path="/mundial" component={MundialPage} />
						<Route path="/mundial/*" component={MundialPage} />
						<Route path="/song-history" component={SongHistoryPage} />
						<Route path="/vip" component={VipPage} />
						<Route path="/rooms" component={RoomsPage} />
						<Route path="/soporte" component={SupportPage} />
						<Route component={NotFound} />
					</Switch>
				</Suspense>
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
