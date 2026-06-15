import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  Eye, 
  EyeOff, 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  Lock, 
  Sparkles, 
  Copy, 
  Check, 
  ArrowLeft 
} from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ email: "", password: "", displayName: "", habboUsername: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  // Motto verification states
  const [habboNick, setHabboNick] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [verified, setVerified] = useState(false);
  const [copied, setCopied] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [checkingNickExists, setCheckingNickExists] = useState(false);

  const generateVerificationCode = async () => {
    if (!habboNick.trim()) return;
    setVerificationError("");
    setCheckingNickExists(true);

    try {
      // First check if Habbo user exists
      const res = await fetch(`/api/habbo/user/${encodeURIComponent(habboNick.trim())}`);
      if (!res.ok) {
        setVerificationError(`El personaje '${habboNick}' no fue encontrado en Habbo.es. Asegúrate de escribirlo correctamente.`);
        setCheckingNickExists(false);
        return;
      }
      
      const profile = await res.json();
      // Keep avatar preview
      setAvatarPreview(`https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(profile.name)}&size=l`);
      
      // Generate unique single-use motto code
      const code = `HS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setVerificationCode(code);
      setHabboNick(profile.name); // Settle exact casing from Habbo API
    } catch (err) {
      setVerificationError("Error de conexión al buscar el personaje. Por favor, inténtalo de nuevo.");
    } finally {
      setCheckingNickExists(false);
    }
  };

  const handleVerifyMotto = async () => {
    setIsVerifying(true);
    setVerificationError("");
    try {
      const res = await fetch(`/api/habbo/user/${encodeURIComponent(habboNick)}`);
      if (!res.ok) {
        setVerificationError("No se pudo obtener tu perfil de Habbo. Inténtalo más tarde.");
        setIsVerifying(false);
        return;
      }
      const data = await res.json();
      
      const mottoClean = (data.motto || "").trim().toUpperCase();
      const codeClean = verificationCode.trim().toUpperCase();
      
      if (mottoClean === codeClean) {
        setVerified(true);
        setForm(p => ({ 
          ...p, 
          habboUsername: habboNick, 
          displayName: data.name 
        }));
      } else {
        setVerificationError(
          `Misión incorrecta. Misión actual detectada: "${data.motto || '[Vacía]'}". Asegúrate de cambiar tu misión a exactamente "${verificationCode}" en Habbo.es.`
        );
      }
    } catch (err) {
      setVerificationError("Error de conexión al conectar con la API de Habbo. Por favor, vuelve a intentarlo.");
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(verificationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetVerification = () => {
    setVerificationCode("");
    setVerificationError("");
    setVerified(false);
    setAvatarPreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verified) {
      setError("Debes verificar tu personaje de Habbo antes de registrarte.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register({
        ...form,
        verificationCode
      });
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 flex items-center justify-center min-h-[calc(100vh-52px)] relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg space-y-4 relative z-10">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <img src="/logo.png" alt="hSpeed Logo" className="h-12 w-auto object-contain" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Crear Cuenta</h1>
          <p className="text-xs text-muted-foreground">Únete a la comunidad de forma segura mediante verificación de personaje</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-stretch">
          <Card className="bg-card border-border glow-purple flex-1 overflow-hidden relative glass">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" />
                {verified ? "Paso 2: Datos de la Cuenta" : "Paso 1: Verificación de Personaje"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              
              {/* ERRORS */}
              {error && (
                <Alert variant="destructive" className="py-2 mb-4 bg-destructive/10 border-destructive/20 text-destructive text-xs">
                  <AlertCircle className="w-3.5 h-3.5 mr-2" />
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}

              {/* STEP 1: VERIFICATION (Not Verified Yet) */}
              {!verified && (
                <div className="space-y-4">
                  {verificationError && (
                    <Alert variant="destructive" className="py-2.5 bg-destructive/10 border-destructive/20 text-destructive text-xs">
                      <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                      <AlertDescription className="text-xs leading-relaxed">{verificationError}</AlertDescription>
                    </Alert>
                  )}

                  {!verificationCode ? (
                    /* Enter Nickname */
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">Usuario de Habbo.es *</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Tu nick en Habbo.es (ej: Luis)"
                            className="pl-9"
                            value={habboNick}
                            onChange={(e) => setHabboNick(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && generateVerificationCode()}
                            data-testid="input-verify-habbonick"
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
                          Ingresa tu nombre de Habbo. Generaremos un código exclusivo que deberás poner en tu misión para verificar tu identidad y evitar que otros usen tu nombre.
                        </p>
                      </div>

                      <Button
                        onClick={generateVerificationCode}
                        disabled={!habboNick.trim() || checkingNickExists}
                        className="w-full bg-primary hover:bg-primary/80 text-white"
                        data-testid="button-verify-generate"
                      >
                        {checkingNickExists ? (
                          <span className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Buscando en Habbo...
                          </span>
                        ) : (
                          <><Sparkles className="w-3.5 h-3.5 mr-2" />Generar Código de Verificación</>
                        )}
                      </Button>
                    </div>
                  ) : (
                    /* Verify Motto Instructions */
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="bg-secondary/40 border border-border rounded-xl p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground">Código de Misión:</span>
                          <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 py-0.5 px-2 rounded-full font-semibold">De un solo uso</span>
                        </div>
                        
                        <div className="flex gap-2 items-center">
                          <div className="flex-1 bg-black/40 border border-border/80 rounded-lg p-2.5 font-mono text-center text-lg font-bold text-primary tracking-wide shadow-inner select-all">
                            {verificationCode}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={copyToClipboard}
                            className="h-[46px] w-[46px]"
                            title="Copiar código"
                          >
                            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                        <p className="font-semibold text-foreground">Instrucciones de verificación:</p>
                        <ol className="list-decimal list-inside space-y-1 bg-secondary/20 p-2.5 rounded-lg border border-border/30">
                          <li>Inicia sesión con tu personaje <span className="text-foreground font-bold">@{habboNick}</span> en Habbo.es.</li>
                          <li>Cambia tu **misión** (motto) por exactamente: <span className="font-mono text-primary font-bold">{verificationCode}</span>.</li>
                          <li>Guarda los cambios de misión en Habbo.</li>
                          <li>Haz clic en el botón de abajo para verificar.</li>
                        </ol>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          type="button"
                          onClick={resetVerification}
                          disabled={isVerifying}
                          className="flex-1 text-xs"
                        >
                          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Cambiar Nick
                        </Button>
                        <Button
                          onClick={handleVerifyMotto}
                          disabled={isVerifying}
                          className="flex-[2] bg-green-600 hover:bg-green-700 text-white text-xs font-bold"
                          data-testid="button-verify-motto"
                        >
                          {isVerifying ? (
                            <span className="flex items-center gap-2 justify-center">
                              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Verificando misión...
                            </span>
                          ) : (
                            <><CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Verificar en Habbo</>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: DETAILS (When Verified successfully) */}
              {verified && (
                <form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-bottom duration-300">
                  {/* Verified Habbo Username display */}
                  <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl p-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Habbo Verificado</p>
                        <p className="text-sm font-semibold text-foreground">@{form.habboUsername}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={resetVerification}
                      className="text-xs text-muted-foreground hover:text-foreground h-8 px-2"
                    >
                      Cambiar
                    </Button>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Nombre en la comunidad *</Label>
                    <Input
                      placeholder="Como quieres que te conozcan en HabboSpeed"
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

                  <div className="bg-secondary/40 rounded-xl p-3 border border-border">
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Tu cuenta quedará en estado <Badge variant="outline" className="text-[8px] border-yellow-500/30 text-yellow-400">pendiente</Badge> hasta que un administrador la apruebe.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/80 text-white font-semibold"
                    disabled={loading}
                    data-testid="button-register-submit"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2 justify-center">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Registrando...
                      </span>
                    ) : (
                      <><UserPlus className="w-4 h-4 mr-2" />Completar Registro</>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Avatar Preview */}
          {avatarPreview && (
            <div className="w-full sm:w-32 flex flex-col items-center gap-3 pt-6 sm:pt-16 animate-in zoom-in duration-300">
              <div className="bg-secondary/50 rounded-xl p-2 border border-border w-24 h-32 flex items-end justify-center relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300" />
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="h-full w-auto object-contain relative z-10"
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
                  data-testid="img-register-avatar-preview"
                />
              </div>
              <p className="text-xs font-semibold text-center truncate w-full bg-secondary/40 border border-border/40 py-1 px-2 rounded-lg">
                @{habboNick}
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login">
            <a className="text-primary hover:text-primary/80 transition-colors font-semibold" data-testid="link-to-login">
              Inicia sesión
            </a>
          </Link>
        </p>
      </div>
    </div>
  );
}
