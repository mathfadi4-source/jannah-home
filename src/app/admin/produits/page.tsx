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
import { upload } from "@vercel/blob/client";
import { CATEGORY_LABELS, formatPrice } from "@/lib/utils";

/**
 * Uploads a file and returns its public URL.
 * Prefers client-direct upload to Vercel Blob (no serverless body-size limit);
 * falls back to a multipart POST (local dev / Docker filesystem) when Blob is
 * not configured.
 */
async function uploadFile(file: File): Promise<string> {
  try {
    const blob = await upload(file.name, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
    });
    return blob.url;
  } catch {
    // Blob not configured (e.g. local dev) — fall back to the server route.
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) {
      throw new Error(data.error || "Échec de l'upload");
    }
    return data.url as string;
  }
}

type Product = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  promoPrice: number | null;
  imageUrl: string | null;
  videoUrl: string | null;
  active: boolean;
};

const emptyForm = {
  name: "",
  description: "",
  category: "COUETTE",
  price: "",
  promoPrice: "",
  imageUrl: "",
  videoUrl: "",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"image" | "video" | null>(null);
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
      videoUrl: product.videoUrl || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
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
              <option value="COUETTE">Matla couette</option>
              <option value="DRAP">Drap de lit</option>
              <option value="PARURE">Parure complète</option>
            </select>
          </div>
        </div>

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
