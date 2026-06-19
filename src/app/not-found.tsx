import Link from "next/link";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="card p-8 max-w-md w-full text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-light/40 text-accent-dark">
          <Compass className="h-7 w-7" />
        </span>
        <p className="font-display text-5xl font-bold text-primary mb-1">404</p>
        <h1 className="text-lg font-semibold text-foreground mb-2">
          Page introuvable · الصفحة غير موجودة
        </h1>
        <p className="text-muted text-sm mb-6">
          La page que vous cherchez n&apos;existe pas.
        </p>
        <Link href="/fr" className="btn btn-primary">
          <Home className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
