"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ChevronRight,
  MapPin,
  Star,
  Globe,
  Phone,
  Pencil,
  Upload,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/constants";
import MichelinStar from "@/components/ui/MichelinStar";

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  area: string | null;
  phone: string | null;
  url: string | null;
  main_image: string | null;
  philosophy: string | null;
  history: string | null;
  hotel: string | null;
  opening_hours: Record<string, unknown> | null;
  price_avg_eur: number | null;
  delivery: boolean;
  take_away: boolean;
  online_booking: boolean;
  green_star: boolean;
  michelin_award_id: string | null;
};

export default function ChefRestaurantPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || role !== "chef") {
      router.push(ROUTES.LOGIN);
      return;
    }

    const fetchRestaurant = async () => {
      try {
        const supabase = createClient();
        const { data: restaurant, error } = await supabase
          .from("restaurants")
          .select(
            `id, name, slug, city, area, phone, url, main_image, philosophy, 
             history, hotel, opening_hours, price_avg_eur, delivery, take_away, 
             online_booking, green_star, michelin_award_id`,
          )
          .eq("chef_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Supabase error:", error);
          setError("Erreur lors du chargement du restaurant");
          return;
        }

        if (!restaurant) {
          setError("Aucun restaurant revendiqué trouvé");
          return;
        }

        setRestaurant(restaurant as Restaurant);
      } catch (err) {
        console.error("Erreur lors du chargement du restaurant:", err);
        setError("Impossible de charger les informations du restaurant");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [user, role, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-michelin-cream">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-michelin-light-gray rounded-full" />
          <p className="text-michelin-gray text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-michelin-cream px-4 pb-20">
        <AlertCircle size={48} className="text-michelin-red mb-4" />
        <p className="text-michelin-black font-medium text-center mb-2">
          {error || "Restaurant non trouvé"}
        </p>
        <Link
          href={ROUTES.PROFIL}
          className="text-michelin-red text-sm underline"
        >
          Retour au profil
        </Link>
      </div>
    );
  }

  const michelinAward = restaurant.michelin_award_id ? true : false;

  return (
    <div className="flex flex-col min-h-screen bg-michelin-cream pb-20">
      {/* Header with cover */}
      <div className="relative">
        {restaurant.main_image ? (
          <Image
            src={restaurant.main_image}
            alt={restaurant.name}
            width={400}
            height={200}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-michelin-red/20 to-michelin-black/20" />
        )}

        {/* Overlay info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
          <h1 className="text-white font-bold text-2xl">{restaurant.name}</h1>
          {restaurant.city && (
            <p className="text-white/80 text-sm flex items-center gap-1 mt-1">
              <MapPin size={14} />
              {restaurant.city}
            </p>
          )}
        </div>

        {/* Edit button */}
        <Link
          href="#"
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
        >
          <Pencil size={16} className="text-michelin-red" />
        </Link>
      </div>

      {/* Michelin award badge */}
      {restaurant.michelin_award_id && (
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 bg-white border border-michelin-red/20 rounded-lg px-3 py-2">
            <MichelinStar size={14} />
            <span className="text-michelin-black text-xs font-medium">
              {restaurant.green_star ? "Étoile Verte" : "Étoile Michelin"}
            </span>
          </div>
        </div>
      )}

      {/* Info cards */}
      <div className="px-4 pt-4 flex flex-col gap-3">
        {/* Contact & Hours info */}
        <div className="bg-white rounded-xl p-4">
          <h3 className="text-michelin-black font-semibold text-sm mb-3">
            Informations pratiques
          </h3>
          <div className="space-y-2">
            {restaurant.area && (
              <p className="text-michelin-gray text-xs flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                <span>{restaurant.area}</span>
              </p>
            )}
            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone}`}
                className="text-michelin-red text-xs flex items-center gap-2 hover:underline"
              >
                <Phone size={14} />
                {restaurant.phone}
              </a>
            )}
            {restaurant.url && (
              <a
                href={restaurant.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-michelin-red text-xs flex items-center gap-2 hover:underline"
              >
                <Globe size={14} />
                Site web
              </a>
            )}
            {restaurant.price_avg_eur && (
              <p className="text-michelin-gray text-xs flex items-center gap-2">
                <Star size={14} />
                Budget moyen : {restaurant.price_avg_eur}€
              </p>
            )}
          </div>
        </div>

        {/* Services */}
        {(restaurant.delivery ||
          restaurant.take_away ||
          restaurant.online_booking ||
          restaurant.hotel) && (
          <div className="bg-white rounded-xl p-4">
            <h3 className="text-michelin-black font-semibold text-sm mb-3">
              Services
            </h3>
            <div className="flex flex-wrap gap-2">
              {restaurant.online_booking && (
                <span className="text-xs bg-michelin-red/10 text-michelin-red px-2 py-1 rounded-full">
                  Réservation en ligne
                </span>
              )}
              {restaurant.delivery && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  Livraison
                </span>
              )}
              {restaurant.take_away && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  À emporter
                </span>
              )}
              {restaurant.hotel && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                  Hôtel
                </span>
              )}
              {restaurant.green_star && (
                <span className="text-xs bg-lime-100 text-lime-700 px-2 py-1 rounded-full">
                  Étoile Verte
                </span>
              )}
            </div>
          </div>
        )}

        {/* Philosophy */}
        {restaurant.philosophy && (
          <div className="bg-white rounded-xl p-4">
            <h3 className="text-michelin-black font-semibold text-sm mb-2">
              Philosophie
            </h3>
            <p className="text-michelin-gray text-xs leading-relaxed">
              {restaurant.philosophy}
            </p>
          </div>
        )}

        {/* History */}
        {restaurant.history && (
          <div className="bg-white rounded-xl p-4">
            <h3 className="text-michelin-black font-semibold text-sm mb-2">
              Historique
            </h3>
            <p className="text-michelin-gray text-xs leading-relaxed">
              {restaurant.history}
            </p>
          </div>
        )}

        {/* Management sections */}
        <div className="space-y-2">
          {/* Articles */}
          <Link
            href={ROUTES.CHEF_ARTICLES}
            className="flex items-center justify-between bg-white rounded-xl px-4 py-4 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-michelin-red/10 flex items-center justify-center">
                <Pencil size={16} className="text-michelin-red" />
              </div>
              <div>
                <p className="text-michelin-black text-sm font-medium">
                  Articles du restaurant
                </p>
                <p className="text-michelin-gray text-xs mt-0.5">
                  Gérer vos publications
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-michelin-gray" />
          </Link>

          {/* Documents */}
          <Link
            href="#"
            className="flex items-center justify-between bg-white rounded-xl px-4 py-4 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Upload size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-michelin-black text-sm font-medium">
                  Documents
                </p>
                <p className="text-michelin-gray text-xs mt-0.5">
                  Fichiers de revendication
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-michelin-gray" />
          </Link>

          {/* Statistics */}
          <Link
            href="#"
            className="flex items-center justify-between bg-white rounded-xl px-4 py-4 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Star size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-michelin-black text-sm font-medium">
                  Statistiques
                </p>
                <p className="text-michelin-gray text-xs mt-0.5">
                  Vues et interactions
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-michelin-gray" />
          </Link>

          {/* Updates coming soon */}
          <div className="flex items-center justify-between bg-white rounded-xl px-4 py-4 opacity-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock size={16} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-michelin-black text-sm font-medium">
                  Plus de fonctionnalités
                </p>
                <p className="text-michelin-gray text-xs mt-0.5">
                  Prochainement disponibles
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-michelin-gray" />
          </div>
        </div>
      </div>
    </div>
  );
}
