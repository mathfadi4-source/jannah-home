"use client";

import { useState, useEffect, FormEvent } from "react";

type Promotion = {
  id: string;
  title: string;
  description: string | null;
  discountPct: number | null;
  active: boolean;
  createdAt: string;
};

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [form, setForm] = useState({ title: "", description: "", discountPct: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPromotions();
  }, []);

  async function loadPromotions() {
    const res = await fetch("/api/promotions");
    setPromotions(await res.json());
    setLoading(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ title: "", description: "", discountPct: "" });
    loadPromotions();
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch("/api/promotions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });
    loadPromotions();
  }

  async function deletePromo(id: string) {
    if (!confirm("Supprimer cette promotion ?")) return;
    await fetch(`/api/promotions?id=${id}`, { method: "DELETE" });
    loadPromotions();
  }

  if (loading) {
    return <div className="p-10 text-center text-muted">Chargement...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 text-primary">Promotions</h1>

      <form onSubmit={handleSubmit} className="card p-6 mb-8 space-y-4">
        <h2 className="font-semibold">Nouvelle promotion</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Titre *</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Réduction (%)</label>
          <input
            type="number"
            value={form.discountPct}
            onChange={(e) => setForm({ ...form, discountPct: e.target.value })}
            placeholder="Ex: 15"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Créer la promotion
        </button>
      </form>

      <div className="space-y-3">
        {promotions.map((promo) => (
          <div key={promo.id} className="card p-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">{promo.title}</h3>
              {promo.description && (
                <p className="text-sm text-muted">{promo.description}</p>
              )}
              {promo.discountPct && (
                <p className="text-sm text-red-600 font-medium">
                  -{promo.discountPct}%
                </p>
              )}
              <span
                className={`badge mt-1 ${
                  promo.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                {promo.active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => toggleActive(promo.id, promo.active)}
                className="btn btn-outline text-xs py-1 px-2"
              >
                {promo.active ? "Désactiver" : "Activer"}
              </button>
              <button
                onClick={() => deletePromo(promo.id)}
                className="btn btn-outline text-xs py-1 px-2 text-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
