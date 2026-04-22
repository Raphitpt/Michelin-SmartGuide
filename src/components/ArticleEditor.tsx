"use client";

import { useActionState, useState } from "react";
import { ChevronLeft, Save } from "lucide-react";
import Link from "next/link";
import CustomEditor from "@/components/Editor";
import { ROUTES } from "@/constants";
import type { ArticleFormState } from "@/lib/articles/actions";

interface ArticleEditorProps {
  action: (prevState: ArticleFormState, formData: FormData) => Promise<ArticleFormState>;
  article?: {
    id: string;
    title: string;
    content_blocks: { html: string } | null;
    status: "draft" | "published" | "archived";
  };
}

export default function ArticleEditor({ action, article }: ArticleEditorProps) {
  const [content, setContent] = useState(article?.content_blocks?.html ?? "");
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <div className="flex flex-col min-h-screen bg-michelin-cream pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-michelin-light-gray">
        <Link
          href={ROUTES.CHEF_ARTICLES}
          className="flex items-center gap-1 text-michelin-gray"
        >
          <ChevronLeft size={18} />
          <span className="text-sm">Mes articles</span>
        </Link>
        <h1 className="text-michelin-black font-bold text-base">
          {article ? "Modifier l'article" : "Nouvel article"}
        </h1>
        <div className="w-20" />
      </div>

      <form action={formAction} className="flex flex-col gap-4 px-4 pt-5">
        {article && <input type="hidden" name="id" value={article.id} />}
        <input type="hidden" name="content" value={content} />

        {/* Titre */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-michelin-gray uppercase tracking-wider">
            Titre
          </label>
          <input
            type="text"
            name="title"
            defaultValue={article?.title ?? ""}
            placeholder="Titre de l'article"
            required
            className="w-full bg-white rounded-xl px-4 py-3 text-michelin-black text-sm outline-none border border-michelin-light-gray focus:border-michelin-red transition-colors"
          />
        </div>

        {/* Statut */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-michelin-gray uppercase tracking-wider">
            Statut
          </label>
          <select
            name="status"
            defaultValue={article?.status ?? "draft"}
            className="w-full bg-white rounded-xl px-4 py-3 text-michelin-black text-sm outline-none border border-michelin-light-gray focus:border-michelin-red transition-colors"
          >
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
          </select>
        </div>

        {/* Contenu */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-michelin-gray uppercase tracking-wider">
            Contenu
          </label>
          <div className="rounded-xl overflow-hidden border border-michelin-light-gray">
            <CustomEditor
              initialValue={content}
              onEditorChange={setContent}
            />
          </div>
        </div>

        {/* Erreur */}
        {state.error && (
          <p className="text-michelin-red text-sm text-center">{state.error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={pending}
          className="flex items-center justify-center gap-2 bg-michelin-red text-white rounded-xl px-4 py-4 font-medium text-sm disabled:opacity-50 transition-opacity"
        >
          <Save size={16} />
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
