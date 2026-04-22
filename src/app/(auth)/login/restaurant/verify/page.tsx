"use client";

import Link from "next/link";
import { useState, useCallback, useRef, useEffect } from "react";
import { useActionState } from "react";
import { Upload, CheckCircle, Search, ChevronDown, X, Loader2 } from "lucide-react";
import { submitClaimAction, searchRestaurantsAction, getDocumentTypesAction } from "@/lib/auth/actions";
import type { ClaimState } from "@/lib/auth/schemas";

type Restaurant = { id: string; name: string; city: string | null; country_id: string | null };
type DocType = { id: string; slug: string; label: string; description: string | null; required: boolean; accepted_formats: string };

function RestaurantSearch({
  onSelect,
}: {
  onSelect: (r: Restaurant | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Restaurant[]>([]);
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    const data = await searchRestaurantsAction(q);
    setResults(data);
    setLoading(false);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 300);
  };

  const handleSelect = (r: Restaurant) => {
    setSelected(r);
    setQuery(r.name);
    setOpen(false);
    onSelect(r);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery("");
    setResults([]);
    onSelect(null);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5">
      <label className="text-white/70 text-xs font-medium tracking-wider uppercase">
        Restaurant
      </label>
      <div className={`relative flex items-center rounded-sm border transition-all duration-200 ${open ? "border-michelin-red/70 bg-white/5" : "border-white/15 bg-white/5"}`}>
        <Search size={15} strokeWidth={1.5} className={`absolute left-3.5 shrink-0 transition-colors ${open ? "text-michelin-red/80" : "text-white/30"}`} />
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher un restaurant…"
          className="w-full bg-transparent py-4 pl-10 pr-10 text-sm text-white placeholder-white/25 outline-none"
          autoComplete="off"
        />
        <div className="absolute right-3 flex items-center">
          {loading && <Loader2 size={14} className="text-white/30 animate-spin" />}
          {selected && !loading && (
            <button type="button" onClick={handleClear} className="text-white/30 hover:text-white/60 transition-colors">
              <X size={14} />
            </button>
          )}
          {!selected && !loading && <ChevronDown size={14} className="text-white/25" />}
        </div>
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="rounded-sm border border-white/15 bg-[#1a0c06] overflow-hidden shadow-2xl">
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onMouseDown={() => handleSelect(r)}
              className="w-full px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
            >
              <div>
                <p className="text-white text-sm font-medium leading-tight">{r.name}</p>
                {r.city && <p className="text-white/40 text-xs mt-0.5">{r.city}</p>}
              </div>
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 2 && !loading && results.length === 0 && (
        <div className="rounded-sm border border-white/15 bg-[#1a0c06] px-4 py-3">
          <p className="text-white/40 text-sm">Aucun restaurant trouvé</p>
        </div>
      )}

      {/* Hidden input for form */}
      <input type="hidden" name="restaurant_id" value={selected?.id ?? ""} />
    </div>
  );
}

function FileField({
  slug,
  label,
  description,
  required,
  error,
}: {
  slug: string;
  label: string;
  description: string | null;
  required: boolean;
  error?: string[];
}) {
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <label htmlFor={slug} className="text-white/70 text-xs font-medium tracking-wider uppercase">
          {label}
        </label>
        {required && <span className="text-michelin-red text-xs">*</span>}
      </div>
      {description && <p className="text-white/30 text-xs">{description}</p>}
      <label
        htmlFor={slug}
        className={`w-full rounded-sm border px-4 py-4 flex items-center gap-3 cursor-pointer transition-all duration-200 ${
          fileName
            ? "border-green-500/40 bg-green-500/5"
            : "border-white/15 bg-white/5 hover:border-white/25 hover:bg-white/[0.07]"
        }`}
      >
        {fileName ? (
          <CheckCircle size={15} className="text-green-400 shrink-0" strokeWidth={1.5} />
        ) : (
          <Upload size={15} className="text-white/30 shrink-0" strokeWidth={1.5} />
        )}
        <span className={`text-sm truncate ${fileName ? "text-green-300" : "text-white/30"}`}>
          {fileName ?? "Choisir un fichier…"}
        </span>
        <input
          id={slug}
          name={slug}
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </label>
      {error && <p className="text-red-400 text-xs">{error[0]}</p>}
    </div>
  );
}

export default function RestaurantVerifyPage() {
  const [state, action, pending] = useActionState<ClaimState, FormData>(submitClaimAction, undefined);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [docTypes, setDocTypes] = useState<DocType[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const handleRestaurantSelect = useCallback(async (r: Restaurant | null) => {
    setSelectedRestaurant(r);
    if (!r?.country_id) { setDocTypes([]); return; }
    setLoadingDocs(true);
    const docs = await getDocumentTypesAction(r.country_id);
    setDocTypes(docs);
    setLoadingDocs(false);
  }, []);

  if (state?.success) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-6"
        style={{ background: "linear-gradient(160deg, #2a1810 0%, #1C0907 45%, #110503 100%)" }}
      >
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <CheckCircle size={28} className="text-green-400" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-white font-bold text-xl mb-2">Demande envoyée</h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Votre demande est en cours d&apos;examen. Vous recevrez une réponse par email sous 48h.
          </p>
        </div>
        <Link
          href="/login/restaurant/status"
          className="w-full bg-michelin-red text-white text-sm font-semibold text-center py-4 rounded-sm hover:bg-red-700 active:scale-[0.98] transition-all duration-150"
        >
          Voir le statut de ma demande
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(160deg, #2a1810 0%, #1C0907 40%, #110503 100%)" }}
    >
      <header className="bg-white/[0.03] border-b border-white/5 px-5 py-4 flex items-center shrink-0">
        <Link href="/login" className="flex items-center gap-1.5">
          <span className="text-michelin-red font-bold text-sm tracking-widest uppercase">Michelin</span>
          <span className="font-normal text-sm text-white/70">SmartGuide</span>
        </Link>
      </header>

      <div className="flex-1 flex flex-col px-6 py-8">
        <div className="mb-8">
          <p className="text-white/40 text-xs tracking-widest uppercase font-medium mb-2">Étape 2 / 2</p>
          <h1 className="text-white font-bold text-2xl leading-snug">
            Justificatifs<br />du restaurant
          </h1>
          <p className="text-white/40 text-sm mt-2">
            Sélectionnez votre restaurant puis fournissez les documents requis selon votre pays.
          </p>
        </div>

        <form action={action} className="flex flex-col gap-5">
          {state?.message && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-sm px-4 py-3">
              {state.message}
            </div>
          )}

          <RestaurantSearch onSelect={handleRestaurantSelect} />
          {state?.errors?.restaurant_id && (
            <p className="text-red-400 text-xs -mt-3">{state.errors.restaurant_id[0]}</p>
          )}

          {/* Documents section — appears after restaurant selection */}
          {selectedRestaurant && (
            <>
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-white/20 text-xs">documents requis</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {loadingDocs ? (
                <div className="flex items-center justify-center py-6 gap-2">
                  <Loader2 size={16} className="text-white/30 animate-spin" />
                  <span className="text-white/30 text-sm">Chargement des documents…</span>
                </div>
              ) : docTypes.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-4">
                  Aucun document configuré pour ce pays.
                </p>
              ) : (
                docTypes.map((dt) => (
                  <FileField
                    key={dt.slug}
                    slug={dt.slug}
                    label={dt.label}
                    description={dt.description}
                    required={dt.required}
                    error={state?.errors?.[dt.slug]}
                  />
                ))
              )}
            </>
          )}

          <button
            type="submit"
            disabled={pending || !selectedRestaurant || loadingDocs}
            className="w-full bg-michelin-red text-white text-sm font-semibold py-4 rounded-sm mt-2 hover:bg-red-700 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {pending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Envoi en cours…
              </span>
            ) : "Envoyer les documents"}
          </button>
        </form>
      </div>
    </div>
  );
}
