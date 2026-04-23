"use client";

import { useState, useEffect, useActionState } from "react";
import {
  FileCheck,
  FileX,
  FileQuestion,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
} from "lucide-react";
import {
  updateClaimStatusAction,
  updateDocumentStatusAction,
  getDocumentPresignedUrlAction,
  type UpdateClaimState,
  type UpdateDocState,
} from "@/lib/admin/actions";

type ClaimStatus = "pending" | "accepted" | "refused" | "missing_infos" | "all";

type Restaurant = { id: string; name: string; city: string | null } | null;
type Profile = { id: string; full_name: string | null } | null;
type ClaimDoc = {
  id: string;
  file_url: string;
  mime_type: string;
  file_size_kb: number | null;
  status: string;
  admin_comment: string | null;
  country_document_types: { label: string } | null;
};

type Claim = {
  id: string;
  status: string;
  admin_comment: string | null;
  created_at: string;
  updated_at: string;
  restaurants: Restaurant | Restaurant[];
  profiles: Profile | Profile[];
  claim_documents?: ClaimDoc[];
};

const STATUS_TABS: { value: ClaimStatus; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "pending", label: "En attente" },
  { value: "accepted", label: "Acceptées" },
  { value: "refused", label: "Refusées" },
  { value: "missing_infos", label: "Infos manquantes" },
];

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string; dotClass: string }
> = {
  pending: {
    label: "En attente",
    badgeClass: "bg-amber-100 text-amber-700",
    dotClass: "bg-amber-500",
  },
  accepted: {
    label: "Accepté",
    badgeClass: "bg-green-100 text-green-700",
    dotClass: "bg-green-500",
  },
  refused: {
    label: "Refusé",
    badgeClass: "bg-red-100 text-red-700",
    dotClass: "bg-red-500",
  },
  missing_infos: {
    label: "Infos manquantes",
    badgeClass: "bg-blue-100 text-blue-700",
    dotClass: "bg-blue-500",
  },
};

function StatusBadge({ status }: Readonly<{ status: string }>) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    badgeClass: "bg-gray-100 text-gray-600",
    dotClass: "bg-gray-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badgeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
      {cfg.label}
    </span>
  );
}

const DOC_STATUS_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  pending:  { label: "En attente", badgeClass: "bg-amber-100 text-amber-700" },
  accepted: { label: "Validé",     badgeClass: "bg-green-100 text-green-700" },
  refused:  { label: "Refusé",     badgeClass: "bg-red-100 text-red-700" },
};

function DocReviewForm({ docId, currentStatus }: Readonly<{ docId: string; currentStatus: string }>) {
  const [comment, setComment] = useState("");
  const [state, formAction, isPending] = useActionState<UpdateDocState, FormData>(
    updateDocumentStatusAction,
    {},
  );

  return (
    <div className="px-3 py-2.5 border-t border-gray-200 bg-gray-50/70 space-y-2">
      {state.success && (
        <p className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded">Statut mis à jour.</p>
      )}
      {state.message && (
        <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">{state.message}</p>
      )}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Commentaire sur ce document (optionnel)"
        rows={1}
        className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-michelin-black/20 bg-white"
      />
      <div className="flex gap-1.5">
        {(["accepted", "refused"] as const).map((s) => (
          <form key={s} action={formAction}>
            <input type="hidden" name="doc_id" value={docId} />
            <input type="hidden" name="status" value={s} />
            <input type="hidden" name="admin_comment" value={comment} />
            <button
              type="submit"
              disabled={isPending || currentStatus === s}
              className={`text-xs px-2.5 py-1 rounded font-medium transition-colors disabled:opacity-40 ${
                s === "accepted"
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              }`}
            >
              {isPending ? (
                <Loader2 size={11} className="animate-spin inline" />
              ) : s === "accepted" ? (
                "✓ Valider"
              ) : (
                "✗ Refuser"
              )}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}

function DocumentViewer({
  doc,
}: Readonly<{ doc: ClaimDoc }>) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    getDocumentPresignedUrlAction(doc.file_url).then((signed) => {
      if (cancelled) return;
      if (signed) setUrl(signed);
      else setError(true);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [doc.file_url]);

  const label = doc.country_document_types?.label ?? "Document";
  const isImage = doc.mime_type.startsWith("image/");
  const isPdf = doc.mime_type === "application/pdf";

  const docStatusCfg = DOC_STATUS_CONFIG[doc.status] ?? DOC_STATUS_CONFIG.pending;

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FileText size={13} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-700">{label}</span>
          {Boolean(doc.file_size_kb) && (
            <span className="text-xs text-gray-400">
              {Math.round(doc.file_size_kb!)} Ko
            </span>
          )}
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${docStatusCfg.badgeClass}`}>
            {docStatusCfg.label}
          </span>
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            Ouvrir ↗
          </a>
        )}
      </div>

      <div className="bg-gray-100 min-h-[120px] flex items-center justify-center">
        {loading && (
          <Loader2 size={20} className="text-gray-400 animate-spin" />
        )}
        {error && (
          <p className="text-xs text-red-500">Impossible de charger le document.</p>
        )}
        {!loading && !error && url && isImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={label}
            className="max-w-full max-h-64 object-contain"
          />
        )}
        {!loading && !error && url && isPdf && (
          <iframe
            src={url}
            className="w-full h-64 border-0"
            title={label}
          />
        )}
        {!loading && !error && url && !isImage && !isPdf && (
          <div className="flex flex-col items-center gap-2 py-4">
            <FileText size={24} className="text-gray-400" />
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              Télécharger {label}
            </a>
          </div>
        )}
      </div>

      {doc.admin_comment && (
        <div className="px-3 py-2 bg-amber-50 border-t border-amber-100 text-xs text-amber-800 italic">
          {doc.admin_comment}
        </div>
      )}

      <DocReviewForm docId={doc.id} currentStatus={doc.status} />
    </div>
  );
}

function ActionForm({
  claimId,
  currentStatus,
}: Readonly<{ claimId: string; currentStatus: string }>) {
  const [comment, setComment] = useState("");
  const [state, formAction, isPending] = useActionState<UpdateClaimState, FormData>(
    updateClaimStatusAction,
    {},
  );

  if (currentStatus === "accepted" || currentStatus === "refused") {
    return (
      <p className="text-xs text-gray-400 italic">
        Cette revendication a déjà été traitée.
      </p>
    );
  }

  const actions = [
    {
      status: "accepted",
      label: "Accepter",
      icon: FileCheck,
      className: "bg-green-600 hover:bg-green-700 text-white",
    },
    {
      status: "missing_infos",
      label: "Infos manquantes",
      icon: FileQuestion,
      className: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    {
      status: "refused",
      label: "Refuser",
      icon: FileX,
      className: "bg-red-600 hover:bg-red-700 text-white",
    },
  ];

  return (
    <div className="space-y-3">
      {state.message && (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {state.message}
        </p>
      )}
      {state.success && (
        <p className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
          Statut mis à jour avec succès.
        </p>
      )}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Commentaire admin (recommandé pour refus et infos manquantes)"
        rows={2}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-michelin-black/20"
      />
      <div className="flex gap-2 flex-wrap">
        {actions.map(({ status, label, icon: Icon, className }) => (
          <form key={status} action={formAction}>
            <input type="hidden" name="claim_id" value={claimId} />
            <input type="hidden" name="status" value={status} />
            <input type="hidden" name="admin_comment" value={comment} />
            <button
              type="submit"
              disabled={isPending}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${className}`}
            >
              {isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Icon size={13} />
              )}
              {label}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}

function ClaimCard({ claim }: Readonly<{ claim: Claim }>) {
  const [expanded, setExpanded] = useState(false);

  const restaurant = Array.isArray(claim.restaurants)
    ? claim.restaurants[0]
    : claim.restaurants;
  const profile = Array.isArray(claim.profiles)
    ? claim.profiles[0]
    : claim.profiles;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {restaurant?.name ?? "—"}
            </p>
            <StatusBadge status={claim.status} />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Chef : {profile?.full_name ?? "—"} ·{" "}
            {new Date(claim.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-gray-400 ml-2 shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-gray-400 ml-2 shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-4">
          {/* Infos */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-gray-400 font-medium">Restaurant</p>
              <p className="text-gray-800 font-semibold mt-0.5">
                {restaurant?.name ?? "—"}
              </p>
              <p className="text-gray-500">{restaurant?.city ?? ""}</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium">Chef</p>
              <p className="text-gray-800 font-semibold mt-0.5">
                {profile?.full_name ?? "—"}
              </p>
            </div>
            {claim.admin_comment && (
              <div className="col-span-2">
                <p className="text-gray-400 font-medium">Commentaire admin</p>
                <p className="text-gray-800 mt-0.5 italic">{claim.admin_comment}</p>
              </div>
            )}
          </div>

          {/* Documents */}
          {claim.claim_documents && claim.claim_documents.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-500">
                Documents joints ({claim.claim_documents.length})
              </p>
              {claim.claim_documents.map((doc) => (
                <DocumentViewer key={doc.id} doc={doc} />
              ))}
            </div>
          )}

          {/* Actions */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Action</p>
            <ActionForm claimId={claim.id} currentStatus={claim.status} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClaimsClient({
  claims,
}: Readonly<{ claims: Claim[] }>) {
  const [activeTab, setActiveTab] = useState<ClaimStatus>("all");

  const filtered =
    activeTab === "all"
      ? claims
      : claims.filter((c) => c.status === activeTab);

  const countByStatus = (s: ClaimStatus) =>
    s === "all" ? claims.length : claims.filter((c) => c.status === s).length;

  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {STATUS_TABS.map(({ value, label }) => {
          const count = countByStatus(value);
          return (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === value
                  ? "bg-michelin-black text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {label}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === value
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10">
          Aucune revendication pour ce filtre.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((claim) => (
            <ClaimCard key={claim.id} claim={claim} />
          ))}
        </div>
      )}
    </div>
  );
}
