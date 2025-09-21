import ContactForm from '@/components/habbospeed/contact-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 flex justify-center items-start">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-xl md:text-2xl">
            <Mail className="text-primary" />
            Contáctanos
          </CardTitle>
          <CardDescription>
            ¿Tienes alguna pregunta, sugerencia o simplemente quieres saludar? ¡Escríbenos un mensaje!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactForm />
        </CardContent>
      </Card>
    </div>
  );
}
