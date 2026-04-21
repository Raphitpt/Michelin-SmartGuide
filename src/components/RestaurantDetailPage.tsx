import { createAdminClient } from "@/utils/supabase/server";
import { Heart, Share2, ChevronRight, Phone, Clock, Shirt } from "lucide-react";
import MichelinStar from "@/components/MichelinStar";
import BackButton from "@/components/BackButton";

const INFO_ROWS = [
    { icon: Clock, label: "Ouvert jusqu'à 23h", sub: "Aujourd'hui" },
    { icon: Shirt, label: "Tenue élégante", sub: "Recommandée" },
    { icon: Phone, label: "01 82 82 10 30", sub: "Appeler" },
];

export default async function RestaurantDetailPage({
    id,
}: Readonly<{ id: string }>) {
    const supabase = createAdminClient();
    const { data: restaurant } = await supabase
        .from("restaurants")
        .select("*, michelin_awards(*), price_categories(*)")
        .eq("id", id)
        .single();
    console.log(restaurant);
    if (!restaurant) return null;

    return (
        <div className="flex flex-col pb-28">
            <div className="relative w-full h-64 bg-gradient-to-br from-[#6B3A1F] to-[#C4722A] shrink-0">
                <BackButton />

                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                    <button className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow">
                        <Heart
                            size={16}
                            className="text-michelin-black"
                            strokeWidth={1.5}
                        />
                    </button>
                    <button className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow">
                        <Share2
                            size={16}
                            className="text-michelin-black"
                            strokeWidth={1.5}
                        />
                    </button>
                </div>

                {/* Photo counter */}
                <span className="absolute bottom-3 left-4 text-white text-xs bg-black/40 px-2 py-0.5 rounded-full">
                    1 / 12
                </span>
            </div>

            <div className="px-4 pt-4 flex flex-col gap-4">
                {restaurant.michelin_awards && (
                    <div className="self-start flex items-center gap-1.5 bg-michelin-black text-white text-xs font-medium px-3 py-1.5 rounded-full">
                        {restaurant.michelin_awards.stars > 0 ? (
                            <>
                                {Array.from(
                                    {
                                        length: restaurant.michelin_awards
                                            .stars,
                                    },
                                    (_, i) => (
                                        <MichelinStar key={i} size={10} />
                                    ),
                                )}
                                <span>
                                    {restaurant.michelin_awards.stars} étoile
                                    {restaurant.michelin_awards.stars > 1
                                        ? "s"
                                        : ""}
                                </span>
                            </>
                        ) : (
                            <span>{restaurant.michelin_awards.label}</span>
                        )}
                    </div>
                )}

                <div>
                    <h1 className="text-michelin-black font-bold text-3xl leading-tight">
                        {restaurant.name}
                    </h1>
                    <p className="text-michelin-gray text-sm mt-1">
                        {restaurant.city} · Française moderne ·{" "}
                        {restaurant.price_categories && '€'.repeat(restaurant.price_categories.rank)}
                    </p>
                </div>

                <p className="text-michelin-black text-sm leading-relaxed">
                    Dans un hôtel particulier du 8<sup>e</sup>, le chef
                    Christophe Pelé signe une cuisine précise et inspirée, où
                    chaque produit trouve sa juste place.
                </p>

                <div className="flex flex-col divide-y divide-michelin-light-gray">
                    {INFO_ROWS.map(({ icon: Icon, label, sub }) => (
                        <button
                            key={label}
                            className="flex items-center justify-between py-4 hover:opacity-70 transition-opacity"
                        >
                            <div className="flex items-center gap-3">
                                <Icon
                                    size={18}
                                    className="text-michelin-black shrink-0"
                                    strokeWidth={1.5}
                                />
                                <div className="text-left">
                                    <p className="text-michelin-black text-sm font-medium">
                                        {label}
                                    </p>
                                    <p className="text-michelin-gray text-xs">
                                        {sub}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight
                                size={16}
                                className="text-michelin-gray shrink-0"
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="fixed bottom-16 left-0 right-0 px-4 pb-3">
                <button className="w-full bg-michelin-red text-white text-sm font-medium py-4 rounded hover:opacity-90 transition-opacity">
                    Réserver une table
                </button>
            </div>
        </div>
    );
}
