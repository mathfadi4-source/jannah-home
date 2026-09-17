"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, ChangeEvent } from "react";

type HeroImage = {
  id: string;
  url: string;
  alt: string | null;
  position: number;
  active: boolean;
};

/** The hero collage shows at most this many active images. */
const HERO_IMAGE_SLOTS = 3;

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) {
    throw new Error(data.error || "Échec de l'upload");
  }
  return data.url as string;
}

export default function AdminHeroPage() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/hero-images");
    if (!res.ok) {
      setError("Impossible de charger les images.");
      setLoading(false);
      return;
    }
    setImages(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const url = await uploadFile(file);
      const res = await fetch("/api/hero-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        throw new Error("Échec de l'enregistrement");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function patch(id: string, data: Record<string, unknown>) {
    await fetch("/api/hero-images", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    await load();
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;

    const reordered = [...images];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);
    setImages(reordered);

    await fetch("/api/hero-images", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: reordered.map((img) => img.id) }),
    });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette image du hero ?")) return;
    await fetch(`/api/hero-images?id=${id}`, { method: "DELETE" });
    await load();
  }

  if (loading) {
    return <div className="p-10 text-center text-muted">Chargement...</div>;
  }

  const displayedIds = new Set(
    images
      .filter((img) => img.active)
      .slice(0, HERO_IMAGE_SLOTS)
      .map((img) => img.id)
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2 text-primary">Images du hero</h1>
      <p className="text-sm text-muted mb-6">
        Les {HERO_IMAGE_SLOTS} premières images actives sont affichées sur la page
        d&apos;accueil. Sans image active, les images par défaut sont utilisées.
      </p>

      <div className="card p-6 mb-8">
        <h2 className="font-semibold mb-3">Ajouter une image</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="text-sm"
        />
        {uploading && <p className="text-sm text-muted mt-2">Envoi en cours...</p>}
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        <p className="text-xs text-muted mt-3">
          Format paysage conseillé, 4 Mo maximum.
        </p>
      </div>

      {images.length === 0 ? (
        <p className="text-muted text-sm">
          Aucune image personnalisée : la page d&apos;accueil affiche les images par
          défaut.
        </p>
      ) : (
        <div className="space-y-3">
          {images.map((img, index) => {
            const displayed = displayedIds.has(img.id);
            return (
              <div key={img.id} className="card p-4 flex items-center gap-4">
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-background">
                  <Image
                    src={img.url}
                    alt={img.alt ?? ""}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{img.url}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span
                      className={`badge ${
                        img.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {img.active ? "Active" : "Inactive"}
                    </span>
                    {displayed && (
                      <span className="badge bg-blue-100 text-blue-800">
                        Affichée
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-1.5">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      className="btn btn-outline text-xs py-1 px-2 disabled:opacity-40"
                      aria-label="Monter"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => move(index, 1)}
                      disabled={index === images.length - 1}
                      className="btn btn-outline text-xs py-1 px-2 disabled:opacity-40"
                      aria-label="Descendre"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    onClick={() => patch(img.id, { active: !img.active })}
                    className="btn btn-outline text-xs py-1 px-2"
                  >
                    {img.active ? "Désactiver" : "Activer"}
                  </button>
                  <button
                    onClick={() => remove(img.id)}
                    className="btn btn-outline text-xs py-1 px-2 text-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
