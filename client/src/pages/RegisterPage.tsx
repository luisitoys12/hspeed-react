import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ email: "", password: "", displayName: "", habboUsername: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");

  const handleHabboChange = (val: string) => {
    setForm(p => ({ ...p, habboUsername: val }));
    if (val.trim()) {
      setAvatarPreview(`https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(val.trim())}&size=l`);
    } else {
      setAvatarPreview("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 flex items-center justify-center min-h-[calc(100vh-52px)]">
      <div className="w-full max-w-md space-y-4">
        {/* Logo */}
        <div className="text-center space-y-2">
          <p className="font-pixel text-[10px] text-primary glow-text">HABBO<span className="text-primary/60">SPEED</span></p>
          <h1 className="text-lg font-bold">Crear Cuenta</h1>
          <p className="text-xs text-muted-foreground">Únete a la comunidad HabboSpeed</p>
        </div>

        <div className="flex gap-4">
          <Card className="bg-card border-border glow-purple flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" />
                Información de registro
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
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Nombre en la comunidad *</Label>
                  <Input
                    placeholder="Como quieres que te conozcan"
                    value={form.displayName}
                    onChange={(e) => setForm(p => ({ ...p, displayName: e.target.value }))}
                    required
                    data-testid="input-register-displayname"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Correo electrónico *</Label>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={form.email}
                    onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                    required
                    data-testid="input-register-email"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Usuario de Habbo <span className="text-muted-foreground/60">(opcional)</span>
                  </Label>
                  <Input
                    placeholder="Tu nick en Habbo.es"
                    value={form.habboUsername}
                    onChange={(e) => handleHabboChange(e.target.value)}
                    data-testid="input-register-habbo"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Contraseña *</Label>
                  <div className="relative">
                    <Input
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                      required
                      className="pr-9"
                      data-testid="input-register-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPw(!showPw)}
                      data-testid="button-toggle-password-register"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-secondary/40 rounded-lg p-3 border border-border">
                  <p className="text-[10px] text-muted-foreground">
                    Tu cuenta quedará en estado <Badge variant="outline" className="text-[8px] border-yellow-500/30 text-yellow-400">pendiente</Badge> hasta que un administrador la apruebe.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/80 text-white"
                  disabled={loading}
                  data-testid="button-register-submit"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Registrando...
                    </span>
                  ) : (
                    <><UserPlus className="w-4 h-4 mr-2" />Crear cuenta</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Avatar Preview */}
          {avatarPreview && (
            <div className="w-32 flex flex-col items-center gap-2 pt-16">
              <div className="bg-secondary/50 rounded-lg p-2 border border-border w-24 h-32 flex items-end justify-center">
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="h-full w-auto object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
                  data-testid="img-register-avatar-preview"
                />
              </div>
              <p className="text-[10px] text-muted-foreground text-center truncate w-full">@{form.habboUsername}</p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login">
            <a className="text-primary hover:text-primary/80 transition-colors" data-testid="link-to-login">
              Inicia sesión
            </a>
          </Link>
        </p>
      </div>
    </div>
  );
}
