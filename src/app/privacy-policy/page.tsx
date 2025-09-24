
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl md:text-4xl font-headline font-bold">
          <Shield className="h-8 w-8 text-primary" />
          Política de Privacidad
        </h1>
        <p className="text-muted-foreground mt-2">
          Última actualización: 24 de Septiembre de 2024
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6 text-muted-foreground leading-relaxed">
            <section>
                <h2 className="font-headline text-xl text-primary mb-2">1. Introducción</h2>
                <p>Bienvenido a Habbospeed ("nosotros", "nuestro"). Nos comprometemos a proteger tu privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y salvaguardamos tu información cuando visitas nuestro sitio web.</p>
            </section>

            <section>
                <h2 className="font-headline text-xl text-primary mb-2">2. Información que Recopilamos</h2>
                <p>Podemos recopilar información sobre ti de varias maneras. La información que podemos recopilar en el Sitio incluye:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>Datos Personales:</strong> Información de identificación personal, como tu nombre de usuario de Habbo, dirección de correo electrónico, que nos proporcionas voluntariamente cuando te registras en el Sitio o eliges participar en diversas actividades relacionadas con el Sitio, como comentarios y peticiones.</li>
                    <li><strong>Datos Derivados:</strong> Información que nuestros servidores recopilan automáticamente cuando accedes al Sitio, como tu dirección IP, tipo de navegador, sistema operativo, etc.</li>
                    <li><strong>Datos de Firebase:</strong> Utilizamos Firebase Authentication para el registro y la gestión de usuarios. No almacenamos tus contraseñas.</li>
                </ul>
            </section>
            
            <section>
                <h2 className="font-headline text-xl text-primary mb-2">3. Uso de tu Información</h2>
                 <p>Tener información precisa sobre ti nos permite ofrecerte una experiencia fluida, eficiente y personalizada. Específicamente, podemos usar la información recopilada sobre ti a través del Sitio para:</p>
                 <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Crear y gestionar tu cuenta.</li>
                    <li>Permitir la interacción de usuario a usuario (comentarios).</li>
                    <li>Gestionar peticiones de canciones y eventos.</li>
                    <li>Monitorear y analizar el uso y las tendencias para mejorar tu experiencia con el Sitio.</li>
                </ul>
            </section>

            <section>
                <h2 className="font-headline text-xl text-primary mb-2">4. Divulgación de tu Información</h2>
                <p>No compartiremos, venderemos, alquilaremos ni intercambiaremos tu información con terceros para fines promocionales sin tu consentimiento.</p>
            </section>

             <section>
                <h2 className="font-headline text-xl text-primary mb-2">5. Seguridad de tu Información</h2>
                <p>Utilizamos medidas de seguridad administrativas, técnicas y físicas para ayudar a proteger tu información personal. Si bien hemos tomado medidas razonables para asegurar la información personal que nos proporcionas, ten en cuenta que a pesar de nuestros esfuerzos, ninguna medida de seguridad es perfecta o impenetrable.</p>
            </section>

             <section>
                <h2 className="font-headline text-xl text-primary mb-2">6. Contacto</h2>
                <p>Si tienes preguntas o comentarios sobre esta Política de Privacidad, por favor contáctanos a través de nuestro <a href="/contact" className="text-primary underline">formulario de contacto</a>.</p>
            </section>

        </CardContent>
      </Card>
    </div>
  );
}
