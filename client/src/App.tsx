import { Router, Route, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import TopNavBar from "@/components/TopNavBar";
import ThemeDecoBar from "@/components/ThemeDecoBar";
import ThemeParticles from "@/components/ThemeParticles";
import Footer from "@/components/Footer";

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
import NotFound from "@/pages/not-found";

function Layout() {
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
          <Route path="/forum" component={ForumPage} />
          <Route path="/forum/:threadId" component={ForumThreadPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/profile/:username" component={ProfilePage} />
          <Route path="/panel" component={AdminPanel} />
          <Route path="/panel/:section" component={AdminPanel} />
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
