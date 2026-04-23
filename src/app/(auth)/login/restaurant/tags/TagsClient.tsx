"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ChevronDown, X, Sparkles, ArrowRight } from "lucide-react";
import { saveRestaurantTagsAction } from "@/lib/auth/actions";

type Trait = { id: string; code: string; label: string };
type Dimension = { id: string; nom: string; question: string; max_tags: number; reco_traits: Trait[] };

type AnalysisDimData = {
  selected: { id: string; code: string; label: string }[];
  available: { id: string; code: string; label: string }[];
};

// ─── TagSelector (dark Michelin theme) ───────────────────────────────────────

function TagSelector({
  dimension,
  selected,
  onChange,
}: {
  dimension: Dimension;
  selected: Trait[];
  onChange: (val: Trait[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const max = dimension.max_tags;

  const available = dimension.reco_traits.filter(
    (t) => !selected.some((s) => s.id === t.id),
  );
  const isMaxReached = selected.length >= max;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const addTag = (tag: Trait) => {
    if (isMaxReached) return;
    onChange([...selected, tag]);
    setOpen(false);
  };

  const removeTag = (id: string) => {
    onChange(selected.filter((t) => t.id !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <p className="text-white/70 text-xs font-medium tracking-wider uppercase">
          {dimension.nom}
        </p>
        <span className="text-white/25 text-xs">
          {selected.length}/{max}
        </span>
      </div>
      {dimension.question && (
        <p className="text-white/40 text-xs leading-relaxed -mt-1">{dimension.question}</p>
      )}

      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((tag) => (
            <span
              key={tag.id}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-michelin-red/80 bg-michelin-red/10 border border-michelin-red/20 rounded-full"
            >
              {tag.label}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="text-michelin-red/50 hover:text-michelin-red/90 transition-colors ml-0.5"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown */}
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => !isMaxReached && setOpen((v) => !v)}
          disabled={isMaxReached}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-sm border text-sm transition-all duration-200 ${
            isMaxReached
              ? "border-white/10 bg-white/[0.02] text-white/20 cursor-not-allowed"
              : "border-white/15 bg-white/5 text-white/40 hover:border-white/25 hover:bg-white/[0.07]"
          }`}
        >
          <span>{isMaxReached ? "Maximum atteint" : "Ajouter un tag…"}</span>
          {!isMaxReached && (
            <ChevronDown
              size={14}
              className={`text-white/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          )}
        </button>

        {open && available.length > 0 && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-sm border border-white/15 bg-[#1a0a05] shadow-xl max-h-52 overflow-auto">
            {available.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => addTag(tag)}
                className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0"
              >
                {tag.label}
              </button>
            ))}
          </div>
        )}

        {open && available.length === 0 && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-sm border border-white/15 bg-[#1a0a05] shadow-xl px-4 py-3 text-sm text-white/30">
            Aucun tag disponible
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TagsClient ───────────────────────────────────────────────────────────────

export default function TagsClient({
  restaurantId,
  dimensions,
}: {
  restaurantId: string;
  dimensions: Dimension[];
}) {
  const [selections, setSelections] = useState<Record<string, Trait[]>>({});
  const [aiLoaded, setAiLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  // Read AI analysis from sessionStorage on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("chefTagsAnalysis");
      if (!raw) return;
      const analysis: Record<string, AnalysisDimData> = JSON.parse(raw);
      sessionStorage.removeItem("chefTagsAnalysis");

      const initial: Record<string, Trait[]> = {};
      for (const dim of dimensions) {
        const dimData = analysis[dim.id];
        if (!dimData) continue;
        // Map AI selected IDs back to full Trait objects from this dimension
        const aiSelected = (dimData.selected ?? [])
          .map((aiTrait) => dim.reco_traits.find((t) => t.id === aiTrait.id))
          .filter(Boolean) as Trait[];
        if (aiSelected.length > 0) initial[dim.id] = aiSelected.slice(0, dim.max_tags);
      }
      setSelections(initial);
      setAiLoaded(Object.keys(initial).length > 0);
    } catch {/* sessionStorage unavailable or parse error */}
  }, [dimensions]);

  const handleChange = (dimId: string, val: Trait[]) => {
    setSelections((prev) => ({ ...prev, [dimId]: val }));
  };

  const handleSubmit = () => {
    const codes = Object.values(selections)
      .flat()
      .map((t) => t.code)
      .filter(Boolean);

    startTransition(async () => {
      const result = await saveRestaurantTagsAction(restaurantId, codes);
      if (result?.error) setError(result.error);
    });
  };

  const totalSelected = Object.values(selections).flat().length;

  return (
    <div className="flex flex-col gap-6">
      {aiLoaded && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-sm border border-michelin-red/20 bg-michelin-red/5">
          <Sparkles size={13} className="text-michelin-red/60 shrink-0" />
          <p className="text-white/50 text-xs leading-relaxed">
            Notre IA a présélectionné des tags basés sur votre restaurant. Ajustez-les selon votre vision.
          </p>
        </div>
      )}

      {dimensions.map((dim) => (
        <TagSelector
          key={dim.id}
          dimension={dim}
          selected={selections[dim.id] ?? []}
          onChange={(val) => handleChange(dim.id, val)}
        />
      ))}

      {error && (
        <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-sm px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 mt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full bg-michelin-red text-white text-sm font-semibold py-4 rounded-sm hover:bg-red-700 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? (
            "Enregistrement…"
          ) : (
            <>
              {totalSelected > 0
                ? `Confirmer ${totalSelected} tag${totalSelected > 1 ? "s" : ""}`
                : "Continuer sans tags"}
              <ArrowRight size={14} />
            </>
          )}
        </button>
        <p className="text-white/20 text-xs text-center">
          Vous pourrez modifier ces tags ultérieurement depuis votre espace restaurateur.
        </p>
      </div>
    </div>
  );
}
