"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="card p-8 max-w-md w-full text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-danger">
          <AlertTriangle className="h-7 w-7" />
        </span>
        <h1 className="font-display text-xl font-bold text-primary mb-2">Erreur de chargement</h1>
        <p className="text-muted text-sm mb-6">{error.message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn btn-primary">
            <RotateCcw className="h-4 w-4" />
            Réessayer
          </button>
          <Link href="/fr" className="btn btn-outline">
            <Home className="h-4 w-4" />
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
