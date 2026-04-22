import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Clock, CheckCircle, XCircle, AlertCircle, ArrowRight, LogOut } from "lucide-react";
import { signOutAction } from "@/lib/auth/actions";

type ClaimStatus = "pending" | "accepted" | "refused" | "missing_infos";

const STATUS_CONFIG: Record<ClaimStatus, {
  icon: React.ElementType;
  iconClass: string;
  bgClass: string;
  borderClass: string;
  title: string;
  description: string;
}> = {
  pending: {
    icon: Clock,
    iconClass: "text-yellow-400",
    bgClass: "bg-yellow-500/10",
    borderClass: "border-yellow-500/20",
    title: "Demande en cours d'examen",
    description: "Votre dossier est en cours de vérification par notre équipe. Ce processus prend généralement 24 à 48h ouvrées.",
  },
  accepted: {
    icon: CheckCircle,
    iconClass: "text-green-400",
    bgClass: "bg-green-500/10",
    borderClass: "border-green-500/20",
    title: "Demande acceptée",
    description: "Félicitations ! Votre restaurant a été validé. Vous pouvez maintenant accéder à votre espace restaurateur.",
  },
  refused: {
    icon: XCircle,
    iconClass: "text-red-400",
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/20",
    title: "Demande refusée",
    description: "Votre demande n'a pas pu être validée. Consultez le commentaire ci-dessous pour en savoir plus.",
  },
  missing_infos: {
    icon: AlertCircle,
    iconClass: "text-orange-400",
    bgClass: "bg-orange-500/10",
    borderClass: "border-orange-500/20",
    title: "Informations manquantes",
    description: "Des informations complémentaires sont nécessaires pour finaliser votre demande.",
  },
};

export default async function RestaurantStatusPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "chef") redirect("/");

  // Get latest claim
  const { data: claim } = await supabase
    .from("ownership_claims")
    .select(`
      id,
      status,
      admin_comment,
      created_at,
      updated_at,
      restaurants (id, name, city)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // No claim yet — redirect to verify
  if (!claim) redirect("/login/restaurant/verify");

  // Accepted — redirect to app
  if (claim.status === "accepted") redirect("/");

  const status = claim.status as ClaimStatus;
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = config.icon;
  const restaurant = Array.isArray(claim.restaurants) ? claim.restaurants[0] : claim.restaurants;

  const submittedAt = new Date(claim.created_at).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(160deg, #2a1810 0%, #1C0907 45%, #110503 100%)" }}
    >
      {/* Header */}
      <header className="bg-white/[0.03] border-b border-white/5 px-5 py-4 flex items-center justify-between shrink-0">
        <Link href="/login" className="flex items-center gap-1.5">
          <span className="text-michelin-red font-bold text-sm tracking-widest uppercase">Michelin</span>
          <span className="font-normal text-sm text-white/70">SmartGuide</span>
        </Link>
        <form action={signOutAction}>
          <button type="submit" className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors text-xs">
            <LogOut size={13} strokeWidth={1.5} />
            Déconnexion
          </button>
        </form>
      </header>

      <div className="flex-1 flex flex-col px-6 py-10 gap-6">
        {/* Status card */}
        <div className={`rounded-sm border ${config.borderClass} ${config.bgClass} p-6 flex flex-col items-center text-center gap-4`}>
          <div className={`w-16 h-16 rounded-full ${config.bgClass} border ${config.borderClass} flex items-center justify-center`}>
            <Icon size={28} className={config.iconClass} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-white/40 text-xs tracking-widest uppercase font-medium mb-2">Statut de votre demande</p>
            <h1 className="text-white font-bold text-xl leading-snug mb-2">{config.title}</h1>
            <p className="text-white/50 text-sm leading-relaxed">{config.description}</p>
          </div>
        </div>

        {/* Restaurant info */}
        {restaurant && (
          <div className="rounded-sm border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-1">
            <p className="text-white/40 text-xs tracking-wider uppercase font-medium">Restaurant</p>
            <p className="text-white font-semibold text-base">{restaurant.name}</p>
            {restaurant.city && <p className="text-white/40 text-sm">{restaurant.city}</p>}
          </div>
        )}

        {/* Admin comment */}
        {claim.admin_comment && (
          <div className="rounded-sm border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-2">
            <p className="text-white/40 text-xs tracking-wider uppercase font-medium">Commentaire Michelin</p>
            <p className="text-white/70 text-sm leading-relaxed">{claim.admin_comment}</p>
          </div>
        )}

        {/* Submitted date */}
        <p className="text-white/25 text-xs text-center">Demande soumise le {submittedAt}</p>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-auto">
          {(status === "refused" || status === "missing_infos") && (
            <Link
              href="/login/restaurant/verify"
              className="w-full bg-michelin-red text-white text-sm font-semibold text-center py-4 rounded-sm hover:bg-red-700 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
            >
              Soumettre une nouvelle demande <ArrowRight size={14} />
            </Link>
          )}
          {status === "pending" && (
            <div className="w-full border border-white/10 text-white/40 text-sm font-medium text-center py-4 rounded-sm flex items-center justify-center gap-2 cursor-not-allowed">
              <Clock size={14} />
              En attente de vérification
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
