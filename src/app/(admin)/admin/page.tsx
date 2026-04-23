import Link from "next/link";
import {
  Users,
  ChefHat,
  Newspaper,
  UtensilsCrossed,
  FileCheck,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { getAdminKpisAction, listClaimsAction } from "@/lib/admin/actions";
import { ROUTES } from "@/constants";

function KpiCard({
  label,
  value,
  icon: Icon,
  note,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  note?: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {note && <p className="text-xs text-gray-400 mt-0.5">{note}</p>}
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <Icon size={18} className="text-gray-500" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: "En attente", className: "bg-amber-100 text-amber-700" },
    accepted: { label: "Accepté", className: "bg-green-100 text-green-700" },
    refused: { label: "Refusé", className: "bg-red-100 text-red-700" },
    missing_infos: {
      label: "Infos manquantes",
      className: "bg-blue-100 text-blue-700",
    },
  };
  const { label, className } = map[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  );
}

export default async function AdminDashboardPage() {
  const [kpis, pendingClaims] = await Promise.all([
    getAdminKpisAction(),
    listClaimsAction("pending"),
  ]);

  const recentPending = pendingClaims.slice(0, 5);

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-500">Vue d&apos;ensemble de la plateforme</p>
      </div>

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-3">
        <KpiCard label="Utilisateurs" value={kpis.users} icon={Users} />
        <KpiCard label="Chefs" value={kpis.chefs} icon={ChefHat} />
        <KpiCard
          label="Articles publiés"
          value={kpis.articles}
          icon={Newspaper}
        />
        <KpiCard
          label="Restaurants"
          value={kpis.restaurants}
          icon={UtensilsCrossed}
        />
      </section>

      {/* Revendications en attente */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileCheck size={16} className="text-gray-500" />
            <h2 className="font-semibold text-sm text-gray-800">
              Revendications en attente
            </h2>
            {kpis.pendingClaims > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {kpis.pendingClaims}
              </span>
            )}
          </div>
          <Link
            href={ROUTES.ADMIN_REVENDICATIONS}
            className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"
          >
            Tout voir <ArrowRight size={12} />
          </Link>
        </div>
        {recentPending.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-400 text-center">
            Aucune revendication en attente
          </p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {recentPending.map((claim) => {
              const restaurant = Array.isArray(claim.restaurants)
                ? claim.restaurants[0]
                : claim.restaurants;
              const profile = Array.isArray(claim.profiles)
                ? claim.profiles[0]
                : claim.profiles;
              return (
                <li key={claim.id}>
                  <Link
                    href={`${ROUTES.ADMIN_REVENDICATIONS}?id=${claim.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {restaurant?.name ?? "—"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {profile?.full_name ?? "—"} ·{" "}
                        {new Date(claim.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <StatusBadge status={claim.status} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Sections mockées */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Bientôt disponible
        </h2>
        {[
          { label: "Graphique inscriptions / mois", icon: TrendingUp },
          { label: "Gestion des utilisateurs", icon: Users },
          { label: "Modération des articles", icon: Newspaper },
          { label: "Gestion des restaurants", icon: UtensilsCrossed },
        ].map(({ label, icon: Icon }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-dashed border-gray-200 px-4 py-3 flex items-center gap-3 opacity-50"
          >
            <Icon size={16} className="text-gray-400" />
            <span className="text-sm text-gray-500">{label}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
