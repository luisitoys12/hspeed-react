import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, FileText } from "lucide-react";

const TABS = [
  { id: "aviso", label: "Aviso Legal", icon: Shield },
  { id: "privacidad", label: "Política de Privacidad", icon: Lock },
  { id: "terminos", label: "Términos de Uso", icon: FileText },
];

export default function LegalPage() {
  const [active, setActive] = useState("aviso");

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold">Información Legal</h1>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 bg-secondary/50 border border-border rounded-lg p-1 flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              active === id
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid={`tab-legal-${id}`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Aviso Legal */}
      {active === "aviso" && (
        <Card className="bg-card border-border">
          <CardContent className="p-6 space-y-4 text-sm text-foreground/85 leading-relaxed">
            <h2 className="text-base font-bold text-foreground">Aviso Legal</h2>
            <p>
              <strong>HabboSpeed</strong> es un fansite no oficial creado por y para la comunidad de Habbo en español. Este sitio web no está afiliado, respaldado, patrocinado ni de ninguna otra forma conectado con <strong>Sulake Corporation Oy</strong>.
            </p>
            <p>
              Habbo® es una marca registrada de Sulake Corporation Oy. Todos los derechos sobre el nombre, logotipo y elementos gráficos de Habbo pertenecen a sus respectivos propietarios.
            </p>
            <p>
              El contenido publicado en HabboSpeed es generado por usuarios de la comunidad y no representa de ningún modo la opinión oficial de Sulake Corporation Oy.
            </p>
            <p>
              HabboSpeed no se hace responsable del contenido publicado por usuarios en el foro, comentarios u otras secciones participativas del sitio. Cada usuario es responsable de sus propias publicaciones.
            </p>
            <p className="text-muted-foreground text-xs">
              Última actualización: enero de 2026
            </p>
          </CardContent>
        </Card>
      )}

      {/* Política de Privacidad */}
      {active === "privacidad" && (
        <Card className="bg-card border-border">
          <CardContent className="p-6 space-y-4 text-sm text-foreground/85 leading-relaxed">
            <h2 className="text-base font-bold text-foreground">Política de Privacidad</h2>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">1. Datos que recopilamos</h3>
              <p>
                HabboSpeed recopila los siguientes datos cuando te registras: dirección de correo electrónico, nombre de usuario (Habbo) y contraseña (almacenada de forma cifrada). No recopilamos datos de pago ni información sensible adicional.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">2. Uso de los datos</h3>
              <p>
                Los datos recopilados se utilizan exclusivamente para:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                <li>Gestionar tu cuenta y acceso al sitio</li>
                <li>Mostrar tu avatar e información en el perfil</li>
                <li>Enviarte notificaciones relacionadas con la comunidad</li>
                <li>Mejorar la experiencia del sitio</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">3. Cookies</h3>
              <p>
                Este sitio utiliza cookies técnicas necesarias para el funcionamiento del mismo (sesión, preferencias de tema). No utilizamos cookies de seguimiento ni publicidad de terceros. Al continuar usando el sitio, aceptas el uso de estas cookies.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">4. Tus derechos</h3>
              <p>
                Tienes derecho a acceder, rectificar y eliminar tus datos personales en cualquier momento. Para ejercer estos derechos, contacta con nosotros a través de la sección de <a href="#/contact" className="text-primary hover:underline">Contacto</a>.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">5. Seguridad</h3>
              <p>
                Implementamos medidas de seguridad técnicas para proteger tus datos. Las contraseñas se almacenan cifradas y nunca en texto plano.
              </p>
            </div>

            <p className="text-muted-foreground text-xs">
              Última actualización: enero de 2026
            </p>
          </CardContent>
        </Card>
      )}

      {/* Términos de Uso */}
      {active === "terminos" && (
        <Card className="bg-card border-border">
          <CardContent className="p-6 space-y-4 text-sm text-foreground/85 leading-relaxed">
            <h2 className="text-base font-bold text-foreground">Términos de Uso</h2>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">1. Uso aceptable</h3>
              <p>
                Al usar HabboSpeed, te comprometes a respetar las normas de convivencia de la comunidad. Queda prohibido:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                <li>Publicar contenido ofensivo, discriminatorio o ilegal</li>
                <li>Hacer spam o publicidad no autorizada</li>
                <li>Suplantar la identidad de otros usuarios</li>
                <li>Compartir información personal de terceros sin su consentimiento</li>
                <li>Intentar vulnerar la seguridad del sitio</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">2. Contenido de usuarios</h3>
              <p>
                El contenido que publicas en el foro, comentarios y otras secciones es de tu exclusiva responsabilidad. HabboSpeed se reserva el derecho de eliminar cualquier contenido que incumpla estas normas sin previo aviso.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">3. Cuentas</h3>
              <p>
                Cada usuario puede tener una sola cuenta. Las cuentas creadas con fines fraudulentos o que incumplan estas normas podrán ser suspendidas o eliminadas permanentemente.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">4. Modificaciones</h3>
              <p>
                HabboSpeed se reserva el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados a través del sitio y entrarán en vigor inmediatamente.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">5. Limitación de responsabilidad</h3>
              <p>
                HabboSpeed no garantiza la disponibilidad continua del servicio y no se hace responsable de daños derivados del uso o imposibilidad de uso del sitio.
              </p>
            </div>

            <p className="text-muted-foreground text-xs">
              Última actualización: enero de 2026
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
