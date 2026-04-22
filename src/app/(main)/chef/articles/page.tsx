import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Plus, FileText, Pencil, Trash2, Eye } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { getMyArticles, deleteArticleAction } from "@/lib/articles/actions";
import { ROUTES } from "@/constants";

const STATUS_LABELS = {
  draft: { label: "Brouillon", className: "bg-michelin-light-gray text-michelin-gray" },
  published: { label: "Publié", className: "bg-green-100 text-green-700" },
  archived: { label: "Archivé", className: "bg-yellow-100 text-yellow-700" },
} as const;

export default async function ChefArticlesPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.LOGIN);

  const { articles, error } = await getMyArticles();

  return (
    <div className="flex flex-col min-h-screen bg-michelin-cream pb-20">
      {/* Header */}
      <div
        className="px-4 pt-12 pb-6"
        style={{
          background:
            "radial-gradient(ellipse at 30% 60%, #5C0A0A 0%, #1C0907 60%, #110503 100%)",
        }}
      >
        <h1 className="text-white font-bold text-2xl">Mes articles</h1>
        <p className="text-white/50 text-sm mt-1">{articles.length} article{articles.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">
        {/* Nouveau */}
        <Link
          href={ROUTES.CHEF_ARTICLES_NEW}
          className="flex items-center justify-center gap-2 bg-michelin-red text-white rounded-xl px-4 py-4 font-medium text-sm"
        >
          <Plus size={16} />
          Nouvel article
        </Link>

        {error && (
          <p className="text-michelin-red text-sm text-center">{error}</p>
        )}

        {/* Liste */}
        {articles.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-michelin-gray">
            <FileText size={40} strokeWidth={1} />
            <p className="text-sm">Aucun article pour l'instant</p>
          </div>
        ) : (
          articles.map((article) => {
            const badge = STATUS_LABELS[article.status as keyof typeof STATUS_LABELS];
            return (
              <div
                key={article.id}
                className="bg-white rounded-xl px-4 py-4 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-michelin-black font-medium text-sm flex-1">
                    {article.title}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
                <p className="text-michelin-gray text-xs">
                  Modifié le{" "}
                  {new Date(article.updated_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  {article.status === "published" && (
                    <Link
                      href={`${ROUTES.ARTICLES}/${article.slug}`}
                      className="flex items-center gap-1 text-xs text-michelin-gray hover:text-michelin-black transition-colors"
                    >
                      <Eye size={13} />
                      Voir
                    </Link>
                  )}
                  <Link
                    href={`/chef/articles/${article.id}/edit`}
                    className="flex items-center gap-1 text-xs text-michelin-gray hover:text-michelin-black transition-colors"
                  >
                    <Pencil size={13} />
                    Modifier
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await deleteArticleAction(article.id);
                    }}
                    className="ml-auto"
                  >
                    <button
                      type="submit"
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-michelin-red transition-colors"
                    >
                      <Trash2 size={13} />
                      Supprimer
                    </button>
                  </form>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
