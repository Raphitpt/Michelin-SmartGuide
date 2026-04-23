"use client";

import { useState, useActionState } from "react";
import { Upload, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { uploadMissingDocsAction, type UploadMissingState } from "@/lib/auth/actions";

type DocType = {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  accepted_formats: string;
};

type RefusedDoc = {
  id: string;
  document_type_id: string;
  admin_comment: string | null;
  docType: DocType | null;
};

type Props = {
  claimId: string;
  refusedDocs: RefusedDoc[];
  unsubmittedTypes: DocType[];
};

function FileUploadField({
  docTypeId,
  label,
  description,
  adminComment,
}: {
  docTypeId: string;
  label: string;
  description: string | null;
  adminComment?: string | null;
}) {
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-2">
        <span className="text-white/70 text-xs font-medium tracking-wider uppercase">{label}</span>
        {adminComment && (
          <span className="text-orange-400 text-[10px] font-medium px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 leading-tight">
            Refusé
          </span>
        )}
      </div>
      {adminComment && (
        <p className="text-orange-300/70 text-xs italic border-l-2 border-orange-500/30 pl-2">
          {adminComment}
        </p>
      )}
      {description && !adminComment && (
        <p className="text-white/30 text-xs">{description}</p>
      )}
      <label
        htmlFor={`field_${docTypeId}`}
        className={`w-full rounded-sm border px-4 py-3 flex items-center gap-3 cursor-pointer transition-all duration-200 ${
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
          id={`field_${docTypeId}`}
          name={`doc_${docTypeId}`}
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </label>
    </div>
  );
}

export default function MissingDocsForm({ claimId, refusedDocs, unsubmittedTypes }: Props) {
  const [state, formAction, isPending] = useActionState<UploadMissingState, FormData>(
    uploadMissingDocsAction,
    {},
  );

  const hasAnything = refusedDocs.length > 0 || unsubmittedTypes.length > 0;
  if (!hasAnything) return null;

  return (
    <form action={formAction} className="flex flex-col gap-4 mt-2">
      <input type="hidden" name="claim_id" value={claimId} />

      {state.message && (
        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-sm px-4 py-3">
          {state.message}
        </div>
      )}

      {/* Refused docs — re-upload required */}
      {refusedDocs.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={13} className="text-orange-400 shrink-0" strokeWidth={1.5} />
            <p className="text-orange-300 text-xs font-medium tracking-wider uppercase">
              Documents à corriger
            </p>
          </div>
          {refusedDocs.map((doc) =>
            doc.docType ? (
              <FileUploadField
                key={doc.id}
                docTypeId={doc.docType.id}
                label={doc.docType.label}
                description={doc.docType.description}
                adminComment={doc.admin_comment}
              />
            ) : null,
          )}
        </div>
      )}

      {/* Unsubmitted doc types — optional */}
      {unsubmittedTypes.length > 0 && (
        <div className="flex flex-col gap-3">
          {refusedDocs.length > 0 && (
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/20 text-xs">documents supplémentaires</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          )}
          {unsubmittedTypes.map((dt) => (
            <FileUploadField
              key={dt.id}
              docTypeId={dt.id}
              label={dt.label}
              description={dt.description}
            />
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-michelin-red text-white text-sm font-semibold py-4 rounded-sm hover:bg-red-700 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Envoi en cours…
          </>
        ) : (
          "Envoyer les documents complémentaires"
        )}
      </button>
    </form>
  );
}
