// src/app/(sensoriel)/parcours-sensoriel/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import IntroScreen from "@/components/sensoriel/IntroScreen";
import SwiperScreen from "@/components/sensoriel/SwiperScreen";
import ResultScreen from "@/components/sensoriel/ResultScreen";
import MatchScreen from "@/components/sensoriel/MatchScreen";
import {
  fetchRestaurantsForSwipe,
  fetchArchetypesAndWeights,
  fetchMatchRestaurant,
} from "@/lib/sensoriel/queries";
import {
  buildScoreVector,
  computeArchetypeScores,
  pickBestArchetype,
  getTopTags,
} from "@/lib/sensoriel/scoring";
import {
  createSwipeSession,
  saveSwipe,
  saveTasteProfile,
} from "@/lib/sensoriel/actions";
import type {
  RestaurantForSwipe,
  MatchRestaurant,
} from "@/lib/sensoriel/queries";

type Step = "intro" | "swipe" | "result" | "match";

type SwipeRecord = {
  restaurantId: string;
  liked: boolean;
  traitCodes: string[];
};

export type DimensionScore = {
  id: string;
  nom: string;
  question: string;
  score: number;
};

type ResultData = {
  archetypeName: string;
  archetypeDescription: string;
  archetypeId: string | null;
  scorePct: number;
  topTags: string[];
  dimensionScores: DimensionScore[];
};

const DEFAULT_RESULT: ResultData = {
  archetypeName: "Profil en cours de calibration",
  archetypeDescription:
    "Nous avons besoin d’un peu plus de données pour affiner votre profil. Continuez à explorer pour obtenir une recommandation plus précise.",
  archetypeId: null,
  scorePct: 0,
  topTags: [],
  dimensionScores: [],
};

type Coords = { lat: number; lng: number };

export default function ParcoursSensorielPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");
  const [restaurants, setRestaurants] = useState<RestaurantForSwipe[]>([]);
  const [result, setResult] = useState<ResultData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [matchRestaurant, setMatchRestaurant] =
    useState<MatchRestaurant | null>(null);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [hasGeoloc, setHasGeoloc] = useState(false);
  const [isLoadingResult, setIsLoadingResult] = useState(false);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true);

  useEffect(() => {
    fetchRestaurantsForSwipe().then((data) => {
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      const selected: typeof data = [];
      const seenTraits = new Set<string>();
      for (const r of shuffled) {
        if (selected.length >= 15) break;
        const newTraits = r.trait_codes.filter(t => !seenTraits.has(t));
        if (selected.length === 0 || newTraits.length > 0) {
          selected.push(r);
          r.trait_codes.forEach(t => seenTraits.add(t));
        }
      }
      if (selected.length < 15) {
        for (const r of shuffled) {
          if (selected.length >= 15) break;
          if (!selected.includes(r)) selected.push(r);
        }
      }
      setRestaurants(selected);
      setIsLoadingRestaurants(false);
    });
  }, []);

  const requestGeoloc = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        setHasGeoloc(true);
        if (result?.archetypeId) {
          fetchMatchRestaurant(result.archetypeId, c).then(setMatchRestaurant);
        }
      },
      () => {
        setHasGeoloc(false);
      },
    );
  }, [result?.archetypeId]);

  async function handleStart() {
    let resolvedUser = user;

    if (!resolvedUser) {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      resolvedUser = session?.user ?? null;
    }

    if (!resolvedUser) {
      router.push("/login");
      return;
    }
    try {
      const id = await createSwipeSession(resolvedUser.id);
      setSessionId(id);
    } catch {
      // session non critique
    }
    setStep("swipe");
  }

  async function handleComplete(swipes: SwipeRecord[]) {
    setIsLoadingResult(true);
    const { archetypes, weights, traitLabels, traitDimensions, dimensions } =
      await fetchArchetypesAndWeights();

    const vector = buildScoreVector(swipes);
    const archetypeScores = computeArchetypeScores(vector, weights);
    const { archetype, scorePct } = pickBestArchetype(
      archetypeScores,
      archetypes,
    );
    const topTags = getTopTags(vector, traitLabels, 3);

    const rawDimScores: Record<string, number> = {};
    for (const [traitCode, score] of Object.entries(vector)) {
      const dimId = traitDimensions[traitCode];
      if (dimId && score > 0) {
        rawDimScores[dimId] = (rawDimScores[dimId] ?? 0) + score;
      }
    }
    const maxDimScore = Math.max(...Object.values(rawDimScores), 1);
    const dimensionScores: DimensionScore[] = dimensions
      .filter((d) => rawDimScores[d.id] !== undefined)
      .map((d) => ({
        id: d.id,
        nom: d.nom,
        question: d.question,
        score: Math.round((rawDimScores[d.id] / maxDimScore) * 100),
      }))
      .sort((a, b) => b.score - a.score);

    if (user) {
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        activeSessionId = await createSwipeSession(user.id);
        setSessionId(activeSessionId);
      }

      for (const swipe of swipes) {
        await saveSwipe({
          sessionId: activeSessionId,
          userId: user.id,
          restaurantId: swipe.restaurantId,
          liked: swipe.liked,
        });
      }

      if (archetype) {
        await saveTasteProfile({
          userId: user.id,
          sessionId: activeSessionId,
          archetypeId: archetype.id,
          archetypeScore: scorePct,
          scoreVector: vector,
          swipeCount: swipes.length,
        });
      }
    }

    const resultData: ResultData = archetype
      ? {
          archetypeName: archetype.nom,
          archetypeDescription: archetype.description,
          archetypeId: archetype.id,
          scorePct,
          topTags,
          dimensionScores,
        }
      : DEFAULT_RESULT;

    setResult(resultData);
    setIsLoadingResult(false);
    setStep("result");
  }

  async function handleGoToMatch() {
    if (!result?.archetypeId) {
      router.push("/");
      return;
    }

    const archetypeId = result.archetypeId;

    const loadMatch = async (c?: { lat: number; lng: number }) => {
      const match = await fetchMatchRestaurant(archetypeId, c);
      setMatchRestaurant(match);
      setStep("match");
    };

    if (!navigator.geolocation) {
      await loadMatch();
      return;
    }

    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => resolve(), 3000);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          clearTimeout(timer);
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(c);
          setHasGeoloc(true);
          await loadMatch(c);
          resolve();
        },
        async () => {
          clearTimeout(timer);
          await loadMatch();
          resolve();
        },
        { timeout: 3000, maximumAge: 60000 },
      );
    });
  }

  if (isLoadingResult)
    return (
      <div className="min-h-screen bg-[#191919] flex flex-col items-center justify-center gap-6">
        <div className="w-10 h-10 border-2 border-white/20 border-t-[#ba0b2f] rounded-full animate-spin" />
        <p className="text-white/60 text-[14px] tracking-wide">Analyse de votre profil…</p>
      </div>
    );

  if (isLoadingRestaurants)
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-8"
        style={{ background: 'linear-gradient(160deg, #2a1810 0%, #1C0907 60%, #110503 100%)' }}
      >
        <div className="flex flex-col items-center gap-3">
          <span className="font-bold text-[#ba0b2f] text-lg tracking-widest uppercase">Michelin</span>
          <span className="font-normal text-white/60 text-sm">SmartGuide</span>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-[#ba0b2f]"
                style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
          <p className="text-white/40 text-[13px] tracking-wide">Préparation de votre sélection…</p>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.2; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
      </div>
    );

  if (step === "intro") return <IntroScreen onStart={handleStart} disabled={authLoading} />;
  if (step === "swipe")
    return (
      <SwiperScreen restaurants={restaurants} onComplete={handleComplete} />
    );
  if (step === "result" && result) {
    return (
      <ResultScreen
        archetypeName={result.archetypeName}
        archetypeDescription={result.archetypeDescription}
        scorePct={result.scorePct}
        topTags={result.topTags}
        dimensionScores={result.dimensionScores}
        onContinue={handleGoToMatch}
        hasMatch={!!result.archetypeId}
      />
    );
  }
  if (step === "match" && result) {
    return (
      <MatchScreen
        archetypeName={result.archetypeName}
        restaurant={matchRestaurant}
        hasGeoloc={hasGeoloc}
        onRequestGeoloc={requestGeoloc}
      />
    );
  }
  return null;
}
