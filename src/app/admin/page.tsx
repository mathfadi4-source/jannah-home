import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) redirect("/admin/login");

  const [orderCount, newOrders, productCount, promoCount] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "NOUVELLE" } }),
    prisma.product.count({ where: { active: true } }),
    prisma.promotion.count({ where: { active: true } }),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8 text-primary">Tableau de bord</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <StatCard label="Total commandes" value={orderCount} />
        <StatCard label="Nouvelles commandes" value={newOrders} highlight />
        <StatCard label="Produits actifs" value={productCount} />
        <StatCard label="Promotions actives" value={promoCount} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickLink href="/admin/commandes" title="Gérer les commandes" desc="Voir et traiter les commandes clients" />
        <QuickLink href="/admin/produits" title="Gérer les produits" desc="Ajouter images, vidéos et prix" />
        <QuickLink href="/admin/promotions" title="Gérer les promos" desc="Créer des offres promotionnelles" />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className={`card p-5 ${highlight ? "border-accent bg-[#faf6f0]" : ""}`}>
      <p className="text-sm text-muted">{label}</p>
      <p className="text-3xl font-bold text-primary mt-1">{value}</p>
    </div>
  );
}

function QuickLink({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href} className="card p-5 hover:shadow-md transition-shadow block">
      <h3 className="font-semibold text-primary">{title}</h3>
      <p className="text-sm text-muted mt-1">{desc}</p>
    </Link>
  );
}
