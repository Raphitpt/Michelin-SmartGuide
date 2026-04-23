"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
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
  FileText,
  Store,
  X,
} from "lucide-react";
import { ROUTES } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import {
  signOutAction,
  getClaimStatusAction,
  markClaimNotificationReadAction,
} from "@/lib/auth/actions";
import { createClient } from "@/utils/supabase/client";
import MichelinStar from "@/components/ui/MichelinStar";

type TasteProfile = {
  archetypeName: string;
  archetypeScore: number;
};

type ClaimStatus = "pending" | "accepted" | "refused" | "missing_infos";

type MichelinAward = {
  stars: number;
  label: string;
  slug: string;
};

type ClaimRestaurant = {
  id: string;
  name: string;
  city: string | null;
  slug: string;
  michelin_awards: MichelinAward | MichelinAward[] | null;
};

const CLAIM_STATUS_CONFIG: Record<
  ClaimStatus,
  { label: string; color: string }
> = {
  pending: { label: "En cours d'examen", color: "text-yellow-500" },
  accepted: { label: "Acceptée", color: "text-green-500" },
  refused: { label: "Refusée", color: "text-red-500" },
  missing_infos: { label: "Infos manquantes", color: "text-orange-500" },
};

const MENU_ROWS_STATIC = [
  {
    icon: Heart,
    iconBg: "bg-michelin-red",
    iconColor: "text-white",
    label: "Mes favoris",
    href: ROUTES.FAVORIS,
    statKey: "favoris" as const,
  },
  {
    icon: Clock,
    iconBg: "bg-michelin-light-gray",
    iconColor: "text-michelin-black",
    label: "Mon historique",
    href: ROUTES.HISTORIQUE,
    statKey: "visites" as const,
  },
  {
    icon: Star,
    iconBg: "bg-michelin-red",
    iconColor: "text-white",
    label: "Mon profil gastronomique",
    sub: null,
    href: ROUTES.PROFIL_GASTRO,
    statKey: null,
  },
  {
    icon: Bell,
    iconBg: "bg-michelin-light-gray",
    iconColor: "text-michelin-black",
    label: "Notifications",
    href: ROUTES.PROFIL_NOTIFICATIONS,
    statKey: null,
  },
  {
    icon: Settings,
    iconBg: "bg-michelin-light-gray",
    iconColor: "text-michelin-black",
    label: "Paramètres",
    href: ROUTES.PROFIL_PARAMETRES,
    statKey: null,
  },
];

type UserStats = {
  visites: number;
  favoris: number;
};

const ROLE_LABELS: Record<string, string> = {
  visitor: "Visiteur",
  user: "Utilisateur",
  chef: "Chef",
  admin: "Administrateur",
};

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

export default function ProfilePage() {
  const { profile, user, role } = useAuth();
  const [tasteProfile, setTasteProfile] = useState<TasteProfile | null>(null);
  const [claimStatus, setClaimStatus] = useState<ClaimStatus | null>(null);
  const [claimRestaurant, setClaimRestaurant] =
    useState<ClaimRestaurant | null>(null);
  const [notification, setNotification] = useState<{
    id: string;
    title: string;
    body: string | null;
  } | null>(null);

  const isUserConnected = !!user;

  useEffect(() => {
    if (role !== "chef") return;
    getClaimStatusAction().then((claim) => {
      if (!claim) return;
      if (claim.status) setClaimStatus(claim.status as ClaimStatus);
      const restaurant = Array.isArray(claim.restaurants)
        ? claim.restaurants[0]
        : claim.restaurants;
      if (restaurant) setClaimRestaurant(restaurant as ClaimRestaurant);
    });
  }, [role]);

  useEffect(() => {
    if (!user || role !== "chef") return;
    const supabase = createClient();
    supabase
      .from("notifications")
      .select("id, title, body")
      .eq("user_id", user.id)
      .eq("type", "claim")
      .eq("read", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setNotification(data);
      });
  }, [user, role]);
  const [stats, setStats] = useState<UserStats>({ visites: 0, favoris: 0 });

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    // Taste profile
    supabase
      .from("user_taste_profiles")
      .select("archetype_id, archetype_score")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(async ({ data }) => {
        if (!data) return;
        const { data: arch } = await supabase
          .from("reco_archetypes")
          .select("nom")
          .eq("id", data.archetype_id)
          .maybeSingle();
        setTasteProfile({
          archetypeName: arch?.nom ?? data.archetype_id,
          archetypeScore: Math.round(data.archetype_score),
        });
      });

    // Stats réelles
    Promise.all([
      supabase
        .from("user_visited_restaurants")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("user_swipes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("liked", true),
    ]).then(([{ count: visites }, { count: favoris }]) => {
      setStats({ visites: visites ?? 0, favoris: favoris ?? 0 });
    });
  }, [user]);

  const fullName =
    profile?.full_name ?? user?.user_metadata?.full_name ?? "Utilisateur";
  const initiales = getInitiales(fullName);
  const membreDepuis = getMembreDateLabel(user?.created_at);

  const michelinAward =
    claimStatus === "accepted" && claimRestaurant
      ? Array.isArray(claimRestaurant.michelin_awards)
        ? claimRestaurant.michelin_awards[0]
        : claimRestaurant.michelin_awards
      : null;

  const handleDismissNotification = async () => {
    if (!notification) return;
    setNotification(null);
    await markClaimNotificationReadAction(notification.id);
  };

  return (
    <div className="flex flex-col pb-20">
      {/* Notification banner */}
      {notification && (
        <div className="flex items-start gap-3 bg-green-600 text-white px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight">
              {notification.title}
            </p>
            {notification.body && (
              <p className="text-xs text-green-100 mt-0.5 leading-snug">
                {notification.body}
              </p>
            )}
          </div>
          <button
            onClick={handleDismissNotification}
            className="shrink-0 p-0.5 hover:opacity-70 transition-opacity"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header dark */}
      <div
        className="relative px-4 pt-12 pb-8 flex flex-col items-center"
        style={{
          background:
            "radial-gradient(ellipse at 30% 60%, #5C0A0A 0%, #1C0907 60%, #110503 100%)",
        }}
      >
        {isUserConnected ? (
          <Link
            href={ROUTES.PROFIL_PARAMETRES}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
          >
            <Settings size={16} className="text-white" strokeWidth={1.5} />
          </Link>
        ) : (
          <Link
            href={ROUTES.LOGIN}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
          >
            Connectez-vous pour personnaliser votre profil
          </Link>
        )}

        <div className="relative w-20 h-20 rounded-full bg-white flex items-center justify-center mb-3 overflow-hidden">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={fullName}
              fill
              sizes="80px"
              className="object-cover"
            />
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

        {/* Michelin stars under avatar — shown when chef has an accepted starred restaurant */}
        {michelinAward && michelinAward.stars > 0 && (
          <div className="mt-3 flex items-center gap-1.5 bg-michelin-black/60 border border-white/10 rounded-full px-3 py-1.5">
            {Array.from({ length: michelinAward.stars }, (_, i) => (
              <MichelinStar key={i} size={12} />
            ))}
            <span className="text-white text-xs font-medium ml-0.5">
              {michelinAward.stars} étoile{michelinAward.stars > 1 ? "s" : ""}{" "}
              Michelin
            </span>
          </div>
        )}
        {michelinAward && michelinAward.stars === 0 && (
          <div className="mt-3 flex items-center gap-1.5 bg-michelin-black/60 border border-white/10 rounded-full px-3 py-1.5">
            <span className="text-white/80 text-xs font-medium">
              {michelinAward.label}
            </span>
          </div>
        )}

        {isUserConnected && tasteProfile && (
          <div className="mt-4 flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-4 py-2">
            <Star size={11} fill="white" stroke="none" />
            <span className="text-white text-xs font-medium">
              {tasteProfile.archetypeName} · {tasteProfile.archetypeScore}%
            </span>
          </div>
        )}
      </div>

      {isUserConnected && (
        <div className="grid grid-cols-2 divide-x divide-michelin-light-gray bg-white border-b border-michelin-light-gray">
          {[
            { value: stats.visites, label: "Visités" },
            { value: stats.favoris, label: "Favoris" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center py-5">
              <span className="text-michelin-black font-bold text-2xl leading-none">
                {value}
              </span>
              <span className="text-michelin-gray text-xs mt-1">{label}</span>
            </div>
          ))}
        </div>
      )}

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
                <p className="text-michelin-black text-sm font-medium">
                  Mes articles
                </p>
                <p className="text-michelin-gray text-xs mt-0.5">
                  Gérer mes publications
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-michelin-gray shrink-0" />
          </Link>
        )}

        {MENU_ROWS_STATIC.map(
          ({ icon: Icon, iconBg, iconColor, label, sub, href }) => {
            const resolvedSub =
              sub === null && href === ROUTES.PROFIL_GASTRO
                ? tasteProfile
                  ? `${tasteProfile.archetypeName} · ${tasteProfile.archetypeScore}%`
                  : "Profil en cours…"
                : sub;
            return (
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
                    {resolvedSub && (
                      <p className="text-michelin-gray text-xs mt-0.5">
                        {resolvedSub}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-michelin-gray shrink-0"
                />
              </Link>
            );
          },
        )}

        {isUserConnected && (
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

        {/* Claim tile — swaps to restaurant management when accepted */}
        {role === "chef" && claimStatus !== "accepted" && (
          <Link
            href={ROUTES.LOGIN_RESTAURANT_STATUS}
            className="flex items-center justify-between bg-white rounded-xl px-4 py-4 hover:opacity-80 transition-opacity border border-michelin-red/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-michelin-red flex items-center justify-center shrink-0">
                <FileText size={16} className="text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-michelin-black text-sm font-medium">
                  Ma demande de revendication
                </p>
                {claimStatus && (
                  <p
                    className={`text-xs mt-0.5 font-medium ${CLAIM_STATUS_CONFIG[claimStatus]?.color ?? "text-michelin-gray"}`}
                  >
                    {CLAIM_STATUS_CONFIG[claimStatus]?.label}
                  </p>
                )}
              </div>
            </div>
            <ChevronRight size={16} className="text-michelin-gray shrink-0" />
          </Link>
        )}

        {role === "chef" && claimStatus === "accepted" && (
          <Link
            href={ROUTES.CHEF_RESTAURANT}
            className="flex items-center justify-between bg-white rounded-xl px-4 py-4 hover:opacity-80 transition-opacity border border-green-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                <Store size={16} className="text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-michelin-black text-sm font-medium">
                  Gérer mon restaurant
                </p>
                <p className="text-michelin-gray text-xs mt-0.5 truncate max-w-[180px]">
                  {claimRestaurant?.name ?? "Mon restaurant"}
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-michelin-gray shrink-0" />
          </Link>
        )}
      </div>
    </div>
  );
}
