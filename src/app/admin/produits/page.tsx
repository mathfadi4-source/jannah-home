"use client";

import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import {
  Upload,
  X,
  ImageIcon,
  Film,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { CATEGORY_LABELS, formatPrice } from "@/lib/utils";

// Keep in sync with the server route (Vercel serverless body limit ~4.5 MB).
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/**
 * Uploads a file through the server route and returns its public URL.
 * In production the server stores it on Vercel Blob; in local dev/Docker it
 * falls back to the local filesystem.
 */
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

type Product = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  promoPrice: number | null;
  imageUrl: string | null;
  galleryUrls: string[];
  videoUrl: string | null;
  active: boolean;
  askSize: boolean;
  sizes: string[];
};

const emptyForm = {
  name: "",
  description: "",
  category: "COUETTE",
  price: "",
  promoPrice: "",
  imageUrl: "",
  galleryUrls: [] as string[],
  videoUrl: "",
  askSize: true,
  sizes: [] as string[],
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"image" | "video" | "gallery" | null>(null);
  const [sizeDraft, setSizeDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const res = await fetch("/api/products?all=true");
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    kind: "image" | "video"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    if (file.size > MAX_UPLOAD_BYTES) {
      setError("Fichier trop volumineux (max 4 Mo). Compressez l'image avant l'envoi.");
      e.target.value = "";
      return;
    }

    setUploading(kind);

    try {
      const url = await uploadFile(file);
      if (url) {
        setForm((f) => ({
          ...f,
          ...(kind === "video" ? { videoUrl: url } : { imageUrl: url }),
        }));
      } else {
        setError("Échec de l'upload");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    // A product must contain an image.
    if (!form.imageUrl) {
      setError("Veuillez ajouter une image au produit.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const payload = { ...form, ...(editingId && { id: editingId }) };
    const res = await fetch("/api/products", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setForm(emptyForm);
      setEditingId(null);
      loadProducts();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erreur lors de l'enregistrement");
    }
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setError("");
    setForm({
      name: product.name,
      description: product.description || "",
      category: product.category,
      price: String(product.price),
      promoPrice: product.promoPrice ? String(product.promoPrice) : "",
      imageUrl: product.imageUrl || "",
      galleryUrls: product.galleryUrls ?? [],
      videoUrl: product.videoUrl || "",
      askSize: product.askSize,
      sizes: product.sizes ?? [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /** Uploads one or more gallery photos and appends them to the product. */
  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setError("");

    if (files.some((file) => file.size > MAX_UPLOAD_BYTES)) {
      setError("Chaque photo doit faire moins de 4 Mo.");
      e.target.value = "";
      return;
    }

    setUploading("gallery");
    try {
      const urls: string[] = [];
      for (const file of files) {
        urls.push(await uploadFile(file));
      }
      setForm((f) => ({
        ...f,
        galleryUrls: [...f.galleryUrls, ...urls.filter((u) => !f.galleryUrls.includes(u))],
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  }

  function removeGalleryImage(url: string) {
    setForm((f) => ({ ...f, galleryUrls: f.galleryUrls.filter((u) => u !== url) }));
  }

  /** Swaps a gallery photo with the featured one, keeping both in the product. */
  function makeFeatured(url: string) {
    setForm((f) => ({
      ...f,
      imageUrl: url,
      galleryUrls: [
        ...f.galleryUrls.filter((u) => u !== url),
        ...(f.imageUrl && f.imageUrl !== url ? [f.imageUrl] : []),
      ],
    }));
  }

  function addSize() {
    const label = sizeDraft.trim();
    if (label === "" || form.sizes.includes(label)) {
      setSizeDraft("");
      return;
    }
    setForm((f) => ({ ...f, sizes: [...f.sizes, label] }));
    setSizeDraft("");
  }

  function removeSize(label: string) {
    setForm((f) => ({ ...f, sizes: f.sizes.filter((s) => s !== label) }));
  }

  function cancelEdit() {
    setSizeDraft("");
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function deleteProduct(id: string) {
    if (!confirm("Supprimer ce produit ?")) return;
    await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    loadProducts();
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-muted flex items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        Chargement...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-6 text-primary">Produits</h1>

      <form onSubmit={handleSubmit} className="card p-6 mb-8 space-y-4">
        <h2 className="font-semibold">
          {editingId ? "Modifier le produit" : "Ajouter un produit"}
        </h2>

        {error && (
          <p className="flex items-center gap-2 text-danger text-sm bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Nom *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Catégorie *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="COUETTE">Collection Été</option>
              <option value="DRAP">Collection Housse de Couette</option>
              <option value="PARURE">Collection Couette</option>
            </select>
          </div>
        </div>

        <fieldset className="rounded-lg border border-border p-4">
          <legend className="px-1 text-sm font-medium">Tailles de ce produit</legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.askSize}
              onChange={(e) => setForm({ ...form, askSize: e.target.checked })}
              className="h-4 w-4"
            />
            Demander une taille à la commande
          </label>

          {form.askSize && (
            <>
              <div className="mt-3 flex flex-wrap gap-2">
                {form.sizes.length === 0 ? (
                  <p className="text-xs text-muted">
                    Aucune taille : le menu déroulant reste masqué pour ce produit.
                  </p>
                ) : (
                  form.sizes.map((size) => (
                    <span
                      key={size}
                      className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-sm"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => removeSize(size)}
                        className="text-danger cursor-pointer"
                        aria-label={`Retirer ${size}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  value={sizeDraft}
                  onChange={(e) => setSizeDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSize();
                    }
                  }}
                  placeholder="Ex: 160 x 200"
                  className="flex-1"
                />
                <button type="button" onClick={addSize} className="btn btn-outline">
                  Ajouter
                </button>
              </div>
            </>
          )}
        </fieldset>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Prix (TND) *</label>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prix promo (TND)</label>
            <input
              type="number"
              step="0.01"
              value={form.promoPrice}
              onChange={(e) => setForm({ ...form, promoPrice: e.target.value })}
            />
          </div>
        </div>

        {/* Image (required) */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Image du produit *</label>
            {form.imageUrl ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-[#f5ede0]">
                <Image src={form.imageUrl} alt="Aperçu" fill className="object-cover" sizes="300px" />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                  className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-danger shadow cursor-pointer hover:bg-white"
                  aria-label="Retirer l'image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 w-full aspect-video rounded-lg border-2 border-dashed border-border bg-background cursor-pointer hover:border-accent transition-colors text-muted">
                {uploading === "image" ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-6 w-6" />
                    <span className="text-sm">Choisir une image</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUpload(e, "image")}
                />
              </label>
            )}
          </div>

          {/* Video (optional) */}
          <div>
            <label className="block text-sm font-medium mb-1">Vidéo (optionnel)</label>
            {form.videoUrl ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-black">
                <video src={form.videoUrl} controls className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, videoUrl: "" }))}
                  className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-danger shadow cursor-pointer hover:bg-white"
                  aria-label="Retirer la vidéo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 w-full aspect-video rounded-lg border-2 border-dashed border-border bg-background cursor-pointer hover:border-accent transition-colors text-muted">
                {uploading === "video" ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <Film className="h-6 w-6" />
                    <span className="text-sm">Choisir une vidéo</span>
                  </>
                )}
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleUpload(e, "video")}
                />
              </label>
            )}
          </div>
        </div>

        {/* Gallery (optional, shown next to the featured image on the product page) */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Galerie photos (optionnel)
          </label>
          <p className="text-xs text-muted mb-2">
            Photos supplémentaires affichées avec la photo principale sur la page
            produit. 4 Mo par photo.
          </p>

          <div className="flex flex-wrap gap-3">
            {form.galleryUrls.map((url) => (
              <div
                key={url}
                className="relative h-24 w-24 overflow-hidden rounded-lg border border-border bg-[#f5ede0]"
              >
                <Image src={url} alt="" fill className="object-cover" sizes="96px" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(url)}
                  className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-danger shadow cursor-pointer hover:bg-white"
                  aria-label="Retirer la photo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => makeFeatured(url)}
                  className="absolute inset-x-0 bottom-0 bg-black/55 py-0.5 text-[10px] text-white cursor-pointer hover:bg-black/70"
                >
                  Principale
                </button>
              </div>
            ))}

            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border bg-background text-muted transition-colors hover:border-accent">
              {uploading === "gallery" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span className="text-xs">Ajouter</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleGalleryUpload}
              />
            </label>
          </div>
        </div>


        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={uploading !== null} className="btn btn-primary">
            <Plus className="h-4 w-4" />
            {editingId ? "Enregistrer" : "Ajouter"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="btn btn-outline">
              Annuler
            </button>
          )}
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="card overflow-hidden">
            <div className="aspect-video bg-[#f5ede0] relative">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="300px"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-accent-dark/40">
                  <ImageIcon className="h-10 w-10" />
                </div>
              )}
              {product.videoUrl && (
                <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                  <Film className="h-3 w-3" /> Vidéo
                </span>
              )}
              {!product.active && (
                <span className="absolute top-2 left-2 badge bg-muted text-white">Masqué</span>
              )}
            </div>
            <div className="p-4">
              <span className="badge bg-[#f5ede0] text-primary text-xs">
                {CATEGORY_LABELS[product.category]}
              </span>
              <h3 className="font-semibold mt-2">{product.name}</h3>
              <p className="text-primary font-bold">
                {formatPrice(product.price)}
                {product.promoPrice && (
                  <span className="text-sm text-danger ml-2">
                    Promo: {formatPrice(product.promoPrice)}
                  </span>
                )}
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => startEdit(product)}
                  className="btn btn-outline text-xs py-1.5 px-3"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Modifier
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="btn btn-outline text-xs py-1.5 px-3 text-danger border-red-200"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
