import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 flex items-center justify-center min-h-[calc(100vh-52px)]">
      <div className="w-full max-w-sm space-y-4">
        {/* Logo */}
        <div className="text-center space-y-2">
          <p className="font-pixel text-[10px] text-primary glow-text">HABBO<span className="text-primary/60">SPEED</span></p>
          <h1 className="text-lg font-bold">Iniciar Sesión</h1>
          <p className="text-xs text-muted-foreground">Bienvenido de vuelta a la comunidad</p>
        </div>

        <Card className="bg-card border-border glow-purple">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <LogIn className="w-4 h-4 text-primary" />
              Accede a tu cuenta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Correo electrónico</Label>
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                  data-testid="input-login-email"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Contraseña</Label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                    required
                    className="pr-9"
                    data-testid="input-login-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPw(!showPw)}
                    data-testid="button-toggle-password"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/80 text-white"
                disabled={loading}
                data-testid="button-login-submit"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Entrando...
                  </span>
                ) : (
                  <><LogIn className="w-4 h-4 mr-2" />Entrar</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link href="/register">
            <a className="text-primary hover:text-primary/80 transition-colors" data-testid="link-to-register">
              Regístrate aquí
            </a>
          </Link>
        </p>
      </div>
    </div>
  );
}
