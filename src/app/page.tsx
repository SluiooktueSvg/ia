
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4 text-gradient-animated">
          Bienvenido a LSAIG
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Esta es tu nueva página de inicio. Desde aquí puedes navegar a nuestra increíble experiencia de chat con IA.
        </p>
      </header>

      <main className="flex flex-col items-center">
        <div className="mb-8">
          <img 
            src="https://placehold.co/600x400.png" 
            alt="Placeholder representativo de la página" 
            className="rounded-lg shadow-xl"
            data-ai-hint="welcome technology"
          />
        </div>
        <Link href="/chat" passHref>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Ir al Chat con IA
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </main>

      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} LSAIG. Todos los derechos reservados.</p>
        <p>Desarrollado con cariño.</p>
      </footer>
    </div>
  );
}
