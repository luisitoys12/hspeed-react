import ContactForm from '@/components/habbospeed/contact-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 flex justify-center items-start">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-2xl">
            <Mail className="text-primary" />
            Contact Us
          </CardTitle>
          <CardDescription>
            Have a question, suggestion, or just want to say hi? Drop us a message!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactForm />
        </CardContent>
      </Card>
    </div>
  );
}
