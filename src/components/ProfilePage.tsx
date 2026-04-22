"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Settings,
  Heart,
  Clock,
  Star,
  Bell,
  ChevronRight,
  LogOut,
  Newspaper,
} from "lucide-react";
import { ROUTES, UTILISATEUR } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import { signOutAction } from "@/lib/auth/actions";

const MENU_ROWS = [
  {
    icon: Heart,
    iconBg: "bg-michelin-red",
    iconColor: "text-white",
    label: "Mes favoris",
    sub: "128 restaurants sauvegardés",
    href: ROUTES.FAVORIS,
  },
  {
    icon: Clock,
    iconBg: "bg-michelin-light-gray",
    iconColor: "text-michelin-black",
    label: "Mon historique",
    sub: "47 restaurants visités",
    href: ROUTES.HISTORIQUE,
  },
  {
    icon: Star,
    iconBg: "bg-michelin-red",
    iconColor: "text-white",
    label: "Mon profil gastronomique",
    sub: `${UTILISATEUR.TYPE_PROFIL} · ${UTILISATEUR.MATCH}%`,
    href: ROUTES.PROFIL_GASTRO,
  },
  {
    icon: Bell,
    iconBg: "bg-michelin-light-gray",
    iconColor: "text-michelin-black",
    label: "Notifications",
    sub: "Activées",
    href: ROUTES.PROFIL_NOTIFICATIONS,
  },
  {
    icon: Settings,
    iconBg: "bg-michelin-light-gray",
    iconColor: "text-michelin-black",
    label: "Paramètres",
    sub: "",
    href: ROUTES.PROFIL_PARAMETRES,
  },
];

function getInitiales(fullName: string | null | undefined) {
  if (!fullName) return "?";
  return fullName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function getMembreDateLabel(createdAt: string | undefined) {
  if (!createdAt) return "";
  return `Membre depuis ${new Date(createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`;
}

const STATS = [
  { value: "47", label: "Visités" },
  { value: "128", label: "Favoris" },
  { value: "12", label: "Avis" },
];

const ROLE_LABELS: Record<string, string> = {
  visitor: "Visiteur",
  user: "Utilisateur",
  chef: "Chef",
  admin: "Administrateur",
};

export default function ProfilePage() {
  const { profile, user, role } = useAuth();

  const fullName =
    profile?.full_name ?? user?.user_metadata?.full_name ?? "Utilisateur";
  const initiales = getInitiales(fullName);
  const membreDepuis = getMembreDateLabel(user?.created_at);

  return (
    <div className="flex flex-col pb-20">
      {/* Header dark */}
      <div
        className="relative px-4 pt-12 pb-8 flex flex-col items-center"
        style={{
          background:
            "radial-gradient(ellipse at 30% 60%, #5C0A0A 0%, #1C0907 60%, #110503 100%)",
        }}
      >
        {/* Settings */}
        <Link
          href={ROUTES.PROFIL_PARAMETRES}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
        >
          <Settings size={16} className="text-white" strokeWidth={1.5} />
        </Link>

        {/* Avatar */}
        <div className="relative w-20 h-20 rounded-full bg-white flex items-center justify-center mb-3 overflow-hidden">
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt={fullName} fill sizes="80px" className="object-cover" />
          ) : (
            <span className="text-michelin-black font-bold text-xl tracking-wide">
              {initiales}
            </span>
          )}
        </div>

        <h1 className="text-white font-bold text-xl">{fullName}</h1>
        {role ? (
          <p className="text-white/70 text-xs font-medium mt-1 uppercase tracking-widest">
            {ROLE_LABELS[role] ?? role}
          </p>
        ) : (
          <p className="text-white/70 text-xs font-medium mt-1 uppercase tracking-widest">
            {ROLE_LABELS["visitor"]}
          </p>
        )}
        {membreDepuis && (
          <p className="text-white/50 text-sm mt-0.5">{membreDepuis}</p>
        )}

        {/* Badge */}
        <div className="mt-4 flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-4 py-2">
          <Star size={11} fill="white" stroke="none" />
          <span className="text-white text-xs font-medium">
            {UTILISATEUR.TYPE_PROFIL}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-michelin-light-gray bg-white border-b border-michelin-light-gray">
        {STATS.map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center py-5">
            <span className="text-michelin-black font-bold text-2xl leading-none">
              {value}
            </span>
            <span className="text-michelin-gray text-xs mt-1">{label}</span>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="flex flex-col gap-2 px-4 pt-4">
        {role === "chef" && (
          <Link
            href={ROUTES.CHEF_ARTICLES}
            className="flex items-center justify-between bg-white rounded-xl px-4 py-4 hover:opacity-80 transition-opacity border border-michelin-red/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-michelin-red flex items-center justify-center shrink-0">
                <Newspaper size={16} className="text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-michelin-black text-sm font-medium">Mes articles</p>
                <p className="text-michelin-gray text-xs mt-0.5">Gérer mes publications</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-michelin-gray shrink-0" />
          </Link>
        )}

        {MENU_ROWS.map(
          ({ icon: Icon, iconBg, iconColor, label, sub, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center justify-between bg-white rounded-xl px-4 py-4 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center shrink-0`}
                >
                  <Icon size={16} className={iconColor} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-michelin-black text-sm font-medium">
                    {label}
                  </p>
                  {sub && (
                    <p className="text-michelin-gray text-xs mt-0.5">{sub}</p>
                  )}
                </div>
              </div>
              <ChevronRight size={16} className="text-michelin-gray shrink-0" />
            </Link>
          ),
        )}

        {user && (
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 bg-white rounded-xl px-4 py-4 hover:opacity-80 transition-opacity text-left"
            >
              <div className="w-9 h-9 rounded-full bg-michelin-light-gray flex items-center justify-center shrink-0">
                <LogOut
                  size={16}
                  className="text-michelin-black"
                  strokeWidth={1.5}
                />
              </div>
              <p className="text-michelin-black text-sm font-medium">
                Se déconnecter
              </p>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
