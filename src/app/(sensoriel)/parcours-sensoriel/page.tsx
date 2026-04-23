// src/app/(sensoriel)/parcours-sensoriel/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
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
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");
  const [restaurants, setRestaurants] = useState<RestaurantForSwipe[]>([]);
  const [result, setResult] = useState<ResultData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [matchRestaurant, setMatchRestaurant] =
    useState<MatchRestaurant | null>(null);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [hasGeoloc, setHasGeoloc] = useState(false);

  useEffect(() => {
    fetchRestaurantsForSwipe().then((data) => {
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setRestaurants(shuffled);
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
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const id = await createSwipeSession(user.id);
      setSessionId(id);
    } catch {
      // session non critique
    }
    setStep("swipe");
  }

  async function handleComplete(swipes: SwipeRecord[]) {
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

  if (step === "intro") return <IntroScreen onStart={handleStart} />;
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
