"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatPrice, STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";

type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  product: { name: string };
};

type Order = {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  tailleCouette: string | null;
  tailleDrap: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => {
        if (r.status === 401) {
          router.push("/admin/login");
          return [];
        }
        return r.json();
      })
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [router]);

  async function updateStatus(id: string, status: string) {
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });

    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
    }
  }

  if (loading) {
    return <div className="p-10 text-center text-muted">Chargement...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 text-primary">Commandes</h1>

      {orders.length === 0 ? (
        <p className="text-muted">Aucune commande pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const total = order.items.reduce(
              (sum, item) => sum + item.unitPrice * item.quantity,
              0
            );

            return (
              <div key={order.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{order.customerName}</h3>
                    <p className="text-sm text-muted">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className={`badge ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 text-sm mb-4">
                  <p>
                    <span className="text-muted">Email :</span> {order.email}
                  </p>
                  <p>
                    <span className="text-muted">Tél :</span> {order.phone}
                  </p>
                  <p className="sm:col-span-2">
                    <span className="text-muted">Adresse :</span> {order.address}
                  </p>
                  {order.tailleCouette && (
                    <p>
                      <span className="text-muted">Taille couette :</span>{" "}
                      {order.tailleCouette}
                    </p>
                  )}
                  {order.tailleDrap && (
                    <p>
                      <span className="text-muted">Taille drap :</span>{" "}
                      {order.tailleDrap}
                    </p>
                  )}
                  {order.notes && (
                    <p className="sm:col-span-2">
                      <span className="text-muted">Notes :</span> {order.notes}
                    </p>
                  )}
                </div>

                <div className="border-t border-border pt-3 mb-4">
                  <p className="text-sm font-medium mb-2">Produits commandés :</p>
                  <ul className="text-sm space-y-1">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.product.name} × {item.quantity} —{" "}
                        {formatPrice(item.unitPrice * item.quantity)}
                      </li>
                    ))}
                  </ul>
                  <p className="font-semibold mt-2 text-primary">
                    Total : {formatPrice(total)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateStatus(order.id, "EN_COURS")}
                    disabled={order.status === "EN_COURS"}
                    className="btn btn-outline text-sm py-1.5 px-3 disabled:opacity-40"
                  >
                    Marquer en cours
                  </button>
                  <button
                    onClick={() => updateStatus(order.id, "TERMINEE")}
                    disabled={order.status === "TERMINEE"}
                    className="btn btn-primary text-sm py-1.5 px-3 disabled:opacity-40"
                  >
                    Marquer terminée
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
