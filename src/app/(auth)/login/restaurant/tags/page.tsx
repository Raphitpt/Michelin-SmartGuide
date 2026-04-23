import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import TagsClient from "./TagsClient";

type Trait = { id: string; code: string; label: string };
type Dimension = { id: string; nom: string; question: string; max_tags: number; reco_traits: Trait[] };

export default async function RestaurantTagsPage({
  searchParams,
}: {
  searchParams: Promise<{ restaurant_id?: string }>;
}) {
  const { restaurant_id } = await searchParams;
  if (!restaurant_id) redirect("/login/restaurant/verify");

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "chef") redirect("/");

  // Verify user has a claim for this restaurant
  const { data: claim } = await supabase
    .from("ownership_claims")
    .select("id")
    .eq("user_id", user.id)
    .eq("restaurant_id", restaurant_id)
    .maybeSingle();
  if (!claim) redirect("/login/restaurant/verify");

  // Fetch dimensions + their traits
  const { data: rawDimensions } = await supabase
    .from("reco_dimensions")
    .select("id, nom, question, max_tags, reco_traits(id, code, label)")
    .order("sort_order");

  const dimensions: Dimension[] = (rawDimensions ?? []).map((d: any) => ({
    id: d.id,
    nom: d.nom,
    question: d.question,
    max_tags: d.max_tags ?? 5,
    reco_traits: Array.isArray(d.reco_traits) ? d.reco_traits : [],
  }));

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name")
    .eq("id", restaurant_id)
    .single();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(160deg, #2a1810 0%, #1C0907 40%, #110503 100%)",
      }}
    >
      <header className="bg-white/[0.03] border-b border-white/5 px-5 py-4 flex items-center shrink-0">
        <Link href="/login" className="flex items-center gap-1.5">
          <span className="text-michelin-red font-bold text-sm tracking-widest uppercase">
            Michelin
          </span>
          <span className="font-normal text-sm text-white/70">SmartGuide</span>
        </Link>
      </header>

      <div className="flex-1 flex flex-col px-6 py-8">
        <div className="mb-8">
          <p className="text-white/40 text-xs tracking-widest uppercase font-medium mb-2">
            Étape finale
          </p>
          <h1 className="text-white font-bold text-2xl leading-snug">
            Profil de votre
            <br />
            restaurant
          </h1>
          <p className="text-white/40 text-sm mt-2">
            {restaurant?.name
              ? `Confirmez les tags qui définissent ${restaurant.name}.`
              : "Confirmez les tags qui définissent votre restaurant."}
            <br />
            Notre IA a présélectionné des suggestions — ajustez librement.
          </p>
        </div>

        <TagsClient restaurantId={restaurant_id} dimensions={dimensions} />
      </div>
    </div>
  );
}
