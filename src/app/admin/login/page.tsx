"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        router.push("/admin");
        router.refresh();
        return;
      }

      if (res.status === 401) {
        setError("Mot de passe incorrect");
      } else {
        setError(data.error || "Erreur serveur. Réessayez.");
      }
    } catch {
      setError("Impossible de contacter le serveur. Vérifiez que npm run dev est lancé.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="card p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold">JH</span>
          </div>
          <h1 className="text-xl font-bold text-primary">Jannah Home — Admin</h1>
          <p className="text-sm text-muted mt-1">Connexion propriétaire</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="admin123"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        <p className="text-xs text-muted text-center mt-4">
          Mot de passe par défaut : admin123
        </p>
      </div>
    </div>
  );
}
