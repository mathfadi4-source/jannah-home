import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAdminAuthenticated();

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      {authenticated && (
        <header className="bg-primary text-white shadow-md">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <p className="font-bold">Jannah Home — Admin</p>
            <nav className="flex gap-4 text-sm">
              <Link href="/admin" className="hover:underline">
                Tableau de bord
              </Link>
              <Link href="/admin/commandes" className="hover:underline">
                Commandes
              </Link>
              <Link href="/admin/produits" className="hover:underline">
                Produits
              </Link>
              <Link href="/admin/promotions" className="hover:underline">
                Promotions
              </Link>
              <Link href="/fr" className="hover:underline opacity-80">
                Voir le site
              </Link>
            </nav>
          </div>
        </header>
      )}
      {children}
    </div>
  );
}
