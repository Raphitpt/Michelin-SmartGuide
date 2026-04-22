import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { FileText, Plus, Pencil } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import AppHeader from "@/components/AppHeader";
import { ROUTES } from "@/constants";

function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&[a-zA-Z]+;/g, (entity) => {
      const entities: Record<string, string> = {
        "&eacute;": "é", "&egrave;": "è", "&ecirc;": "ê", "&euml;": "ë",
        "&agrave;": "à", "&acirc;": "â", "&auml;": "ä", "&aring;": "å",
        "&oacute;": "ó", "&ograve;": "ò", "&ocirc;": "ô", "&ouml;": "ö",
        "&uacute;": "ú", "&ugrave;": "ù", "&ucirc;": "û", "&uuml;": "ü",
        "&iacute;": "í", "&igrave;": "ì", "&icirc;": "î", "&iuml;": "ï",
        "&ccedil;": "ç", "&ntilde;": "ñ", "&aelig;": "æ", "&oelig;": "œ",
        "&laquo;": "«", "&raquo;": "»", "&hellip;": "…", "&mdash;": "—",
        "&ndash;": "–", "&rsquo;": "'", "&lsquo;": "'", "&ldquo;": "“",
        "&rdquo;": "”",
      };
      return entities[entity] ?? entity;
    });
}

function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

function excerpt(content_blocks: unknown, max = 400): string {
  const html = (content_blocks as { html?: string } | null)?.html ?? "";
  const text = stripHtml(html);
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

interface ArticlesPageProps {
  searchParams: Promise<{ filter?: string }>;
}

type Filter = "all" | "mine" | "drafts";

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { filter: rawFilter } = await searchParams;
  const filter: Filter =
    rawFilter === "mine" ? "mine" : rawFilter === "drafts" ? "drafts" : "all";

  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  const isChef = profile?.role === "chef";

  let query = supabase
    .from("articles")
    .select("id, title, slug, status, published_at, updated_at, chef_id, content_blocks, profiles(full_name, avatar_url)")
    .order("updated_at", { ascending: false });

  if (filter === "drafts" && user) {
    query = query.eq("status", "draft").eq("chef_id", user.id);
  } else if (filter === "mine" && user) {
    query = query.eq("status", "published").eq("chef_id", user.id);
  } else {
    query = query.eq("status", "published");
  }

  const { data: articles } = await query;

  const subtitles: Record<Filter, string> = {
    all: "publiés",
    mine: "publiés par moi",
    drafts: "en brouillon",
  };

  const emptyMessages: Record<Filter, string> = {
    all: "Aucun article publié pour l'instant",
    mine: "Vous n'avez pas encore d'articles publiés",
    drafts: "Aucun brouillon en cours",
  };

  return (
    <div className="flex flex-col min-h-screen bg-michelin-cream pb-20">
      <AppHeader />

      <div
        className="relative px-4 pt-8 pb-6"
        style={{
          background:
            "radial-gradient(ellipse at 30% 60%, #5C0A0A 0%, #1C0907 60%, #110503 100%)",
        }}
      >
        <h1 className="text-white font-bold text-2xl">Articles</h1>
        <p className="text-white/50 text-sm mt-1">
          {articles?.length ?? 0} article{(articles?.length ?? 0) !== 1 ? "s" : ""}{" "}
          {subtitles[filter]}
        </p>

        {isChef && (
          <Link
            href={ROUTES.CHEF_ARTICLES_NEW}
            className="absolute top-8 right-4 w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"
          >
            <Plus size={18} className="text-white" />
          </Link>
        )}
      </div>

      {/* Filtres */}
      {isChef && (
        <div className="flex gap-2 px-4 pt-4 overflow-x-auto pb-1">
          {(["all", "mine", "drafts"] as Filter[]).map((f) => {
            const labels: Record<Filter, string> = {
              all: "Tous",
              mine: "Mes articles",
              drafts: "Brouillons",
            };
            const href = f === "all" ? "/articles" : `/articles?filter=${f}`;
            return (
              <Link
                key={f}
                href={href}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === f
                    ? "bg-michelin-black text-white"
                    : "bg-white text-michelin-gray border border-michelin-light-gray"
                }`}
              >
                {labels[f]}
              </Link>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-3 px-4 pt-4">
        {!articles || articles.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-michelin-gray">
            <FileText size={40} strokeWidth={1} />
            <p className="text-sm">{emptyMessages[filter]}</p>
            {(filter === "mine" || filter === "drafts") && (
              <Link
                href={ROUTES.CHEF_ARTICLES_NEW}
                className="mt-2 flex items-center gap-1.5 bg-michelin-red text-white rounded-full px-4 py-2 text-xs font-medium"
              >
                <Plus size={13} />
                Créer un article
              </Link>
            )}
          </div>
        ) : (
          articles.map((article) => {
            const isOwner = user && article.chef_id === user.id;
            const chef = article.profiles as { full_name: string | null; avatar_url: string | null } | null;
            const initiales = chef?.full_name
              ? chef.full_name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
              : "?";
            const date = (article.published_at ?? article.updated_at)
              ? new Date((article.published_at ?? article.updated_at)!).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : null;

            return (
              <div key={article.id} className="relative group">
                <Link
                  href={
                    article.status === "draft"
                      ? `/chef/articles/${article.id}/edit`
                      : `/articles/${article.slug}`
                  }
                  className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Bandeau supérieur coloré */}
                  <div
                    className="h-1.5 w-full"
                    style={{
                      background:
                        "linear-gradient(90deg, #E4002B 0%, #5C0A0A 100%)",
                    }}
                  />

                  <div className="px-4 pt-3 pb-4 flex flex-col gap-3">
                    {/* Statut brouillon */}
                    {article.status === "draft" && (
                      <span className="self-start text-[10px] font-semibold uppercase tracking-widest text-michelin-gray bg-michelin-light-gray rounded-full px-2.5 py-0.5">
                        Brouillon
                      </span>
                    )}

                    {/* Titre */}
                    <p className="text-michelin-black font-bold text-base leading-snug pr-6">
                      {article.title}
                    </p>

                    {/* Extrait */}
                    {excerpt(article.content_blocks) && (
                      <p className="text-michelin-gray text-xs leading-relaxed">
                        {excerpt(article.content_blocks)}
                      </p>
                    )}

                    {/* Séparateur */}
                    <div className="h-px bg-michelin-light-gray" />

                    {/* Footer chef + date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="relative w-7 h-7 rounded-full bg-[#4A1C1C] flex items-center justify-center shrink-0 overflow-hidden">
                          {chef?.avatar_url ? (
                            <Image src={chef.avatar_url} alt="" fill sizes="28px" className="object-cover" />
                          ) : (
                            <span className="text-white text-[10px] font-bold">{initiales}</span>
                          )}
                        </div>
                        <span className="text-michelin-black text-xs font-medium">
                          {chef?.full_name ?? "Chef"}
                        </span>
                      </div>
                      {date && (
                        <span className="text-michelin-gray text-[11px]">{date}</span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Crayon propriétaire */}
                {isOwner && (
                  <Link
                    href={`/chef/articles/${article.id}/edit`}
                    className="absolute top-5 right-4 w-7 h-7 rounded-full bg-michelin-light-gray flex items-center justify-center text-michelin-gray hover:bg-michelin-black hover:text-white transition-colors"
                  >
                    <Pencil size={13} />
                  </Link>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
