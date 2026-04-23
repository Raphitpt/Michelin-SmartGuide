"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useActionState,
} from "react";
import Link from "next/link";
import {
  Upload,
  CheckCircle,
  Building2,
  Hash,
  Search,
  X,
  Sparkles,
} from "lucide-react";
import {
  submitClaimAction,
  searchRestaurantsAction,
  getDocumentTypesAction,
} from "@/lib/auth/actions";
import { analyse } from "@/components/formRestaurant/analyse";
import type { ClaimState } from "@/lib/auth/schemas";
import { useRouter } from "next/navigation";

type Restaurant = {
  id: string;
  name: string;
  city?: string | null;
  country_id: string | null;
};
type DocType = {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  required: boolean;
  accepted_formats: string;
};

// ─── TextField ────────────────────────────────────────────────────────────────

function TextField({
  id,
  name,
  inputMode,
  maxLength,
  placeholder,
  label,
  icon: Icon,
  error,
}: {
  id: string;
  name: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  placeholder?: string;
  label: string;
  icon?: React.ElementType;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-white/70 text-xs font-medium tracking-wider uppercase"
      >
        {label}
      </label>
      <div
        className={`relative flex items-center rounded-sm border transition-all duration-200 ${
          focused
            ? "border-michelin-red/70 bg-white/5"
            : "border-white/15 bg-white/5"
        }`}
      >
        {Icon && (
          <Icon
            size={15}
            strokeWidth={1.5}
            className={`absolute left-3.5 shrink-0 transition-colors duration-200 ${
              focused ? "text-michelin-red/80" : "text-white/30"
            }`}
          />
        )}
        <input
          id={id}
          name={name}
          inputMode={inputMode}
          maxLength={maxLength}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full bg-transparent py-4 text-sm text-white placeholder-white/25 outline-none ${Icon ? "pl-10" : "pl-4"} pr-4`}
        />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

// ─── FileField ────────────────────────────────────────────────────────────────

function FileField({ docType, error }: { docType: DocType; error?: string[] }) {
  const [fileName, setFileName] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1">
        <label
          htmlFor={`file_${docType.slug}`}
          className="text-white/70 text-xs font-medium tracking-wider uppercase"
        >
          {docType.label}
        </label>
        {docType.required && (
          <span className="text-michelin-red text-xs">*</span>
        )}
      </div>
      {docType.description && (
        <p className="text-white/30 text-xs">{docType.description}</p>
      )}
      <label
        htmlFor={`file_${docType.slug}`}
        className={`w-full rounded-sm border px-4 py-4 flex items-center gap-3 cursor-pointer transition-all duration-200 ${
          fileName
            ? "border-green-500/40 bg-green-500/5"
            : "border-white/15 bg-white/5 hover:border-white/25 hover:bg-white/[0.07]"
        }`}
      >
        {fileName ? (
          <CheckCircle
            size={15}
            className="text-green-400 shrink-0"
            strokeWidth={1.5}
          />
        ) : (
          <Upload
            size={15}
            className="text-white/30 shrink-0"
            strokeWidth={1.5}
          />
        )}
        <span
          className={`text-sm truncate ${fileName ? "text-green-300" : "text-white/30"}`}
        >
          {fileName ?? "Choisir un fichier…"}
        </span>
        <input
          id={`file_${docType.slug}`}
          name={docType.slug}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RestaurantVerifyPage() {
  const [state, formAction, pending] = useActionState<ClaimState, FormData>(
    submitClaimAction,
    undefined,
  );
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Restaurant[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [docTypes, setDocTypes] = useState<DocType[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // AI analysis state
  const [analysisResult, setAnalysisResult] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Persist analysis to sessionStorage whenever it resolves so the tags page can read it
  useEffect(() => {
    if (analysisResult) {
      try {
        sessionStorage.setItem(
          "chefTagsAnalysis",
          JSON.stringify(analysisResult),
        );
      } catch {
        /* sessionStorage unavailable */
      }
    }
  }, [analysisResult]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (selected) {
        setSelected(null);
        setDocTypes([]);
        setAnalysisResult(null);
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (value.trim().length < 2) {
        setResults([]);
        setShowDropdown(false);
        return;
      }
      debounceRef.current = setTimeout(async () => {
        const data = await searchRestaurantsAction(value);
        setResults(data);
        setShowDropdown(data.length > 0);
      }, 300);
    },
    [selected],
  );

  useEffect(() => {
    if (state?.success === true && state.restaurantId) {
      router.push(`/login/restaurant/tags?restaurant_id=${state.restaurantId}`);
    }
  }, [state, router]);

  const handleSelect = useCallback(async (restaurant: Restaurant) => {
    setSelected(restaurant);
    setQuery(restaurant.name);
    setShowDropdown(false);
    setDocTypes([]);
    setAnalysisResult(null);
    setAnalysisLoading(true);

    // Load docs and trigger AI analysis in parallel
    if (restaurant.country_id) {
      setLoadingDocs(true);
      getDocumentTypesAction(restaurant.country_id).then((docs) => {
        setDocTypes(docs);
        setLoadingDocs(false);
      });
    }

    const fd = new FormData();
    fd.set("texte", restaurant.name);
    analyse(fd)
      .then((result) =>
        setAnalysisResult(result.reco_traits as Record<string, unknown>),
      )
      .catch(() => {
        /* silently ignore – tags page will show empty */
      })
      .finally(() => setAnalysisLoading(false));
  }, []);

  const handleClear = useCallback(() => {
    setSelected(null);
    setQuery("");
    setDocTypes([]);
    setResults([]);
    setAnalysisResult(null);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, #2a1810 0%, #1C0907 40%, #110503 100%)",
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
            Vérification
          </p>
          <h1 className="text-white font-bold text-2xl leading-snug">
            Justificatifs
            <br />
            du restaurant
          </h1>
          <p className="text-white/40 text-sm mt-2">
            Ces documents permettent de vérifier votre établissement.
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          {state?.message && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-sm px-4 py-3">
              {state.message}
            </div>
          )}
          {selected && (
            <input type="hidden" name="restaurant_id" value={selected.id} />
          )}
          {/* Restaurant search */}
          <div className="flex flex-col gap-1.5">
            <label className="text-white/70 text-xs font-medium tracking-wider uppercase">
              Restaurant
            </label>
            <div className="relative" ref={dropdownRef}>
              <div
                className={`relative flex items-center rounded-sm border transition-all duration-200 ${
                  state?.errors?.restaurant_id
                    ? "border-red-500/50 bg-white/5"
                    : "border-white/15 bg-white/5"
                }`}
              >
                <Search
                  size={15}
                  strokeWidth={1.5}
                  className="absolute left-3.5 text-white/30 shrink-0"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onFocus={() =>
                    results.length > 0 && !selected && setShowDropdown(true)
                  }
                  placeholder="Rechercher votre restaurant…"
                  className="w-full bg-transparent py-4 pl-10 pr-10 text-sm text-white placeholder-white/25 outline-none"
                />
                {(query || selected) && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-3 text-white/30 hover:text-white/60 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {showDropdown && results.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-sm border border-white/15 bg-[#1a0a05] overflow-hidden shadow-xl">
                  {results.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(r);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 flex items-center gap-2"
                    >
                      <Building2
                        size={13}
                        className="text-white/30 shrink-0"
                        strokeWidth={1.5}
                      />
                      <span>{r.name}</span>
                      {r.city && (
                        <span className="text-white/30 text-xs ml-auto">
                          {r.city}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {state?.errors?.restaurant_id && (
              <p className="text-red-400 text-xs">
                {state.errors.restaurant_id[0]}
              </p>
            )}
          </div>

          {selected && (
            <TextField
              id="siret"
              name="siret"
              label="N° SIRET"
              icon={Hash}
              inputMode="numeric"
              maxLength={14}
              placeholder="14 chiffres"
              error={state?.errors?.siret?.[0]}
            />
          )}
          {/* AI analysis indicator */}
          {selected && (
            <div className="flex items-center gap-2 text-xs">
              {analysisLoading ? (
                <>
                  <span className="animate-spin w-3 h-3 border border-white/20 border-t-michelin-red/60 rounded-full inline-block shrink-0" />
                  <span className="text-white/30">Analyse IA en cours…</span>
                </>
              ) : analysisResult ? (
                <>
                  <Sparkles
                    size={12}
                    className="text-michelin-red/60 shrink-0"
                  />
                  <span className="text-white/30">Tags suggérés prêts</span>
                </>
              ) : null}
            </div>
          )}
          {/* Dynamic document fields */}
          {selected && (
            <>
              {loadingDocs ? (
                <div className="flex items-center justify-center gap-2 py-6 text-white/30 text-sm">
                  <span className="animate-spin w-4 h-4 border border-white/20 border-t-white/60 rounded-full inline-block" />
                  Chargement des documents requis…
                </div>
              ) : docTypes.length > 0 ? (
                <>
                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-white/20 text-xs">documents</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                  {docTypes.map((dt) => (
                    <FileField
                      key={dt.id}
                      docType={dt}
                      error={state?.errors?.docs?.[dt.slug]}
                    />
                  ))}
                </>
              ) : (
                <p className="text-white/30 text-sm text-center py-2">
                  Aucun document requis pour ce pays.
                </p>
              )}
            </>
          )}
          <button
            type="submit"
            disabled={pending || !selected}
            className="w-full bg-michelin-red text-white text-sm font-semibold py-4 rounded-sm mt-2 hover:bg-red-700 active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
          >
            {pending ? "Envoi en cours…" : "Envoyer les documents"}
          </button>
        </form>
      </div>
    </div>
  );
}
