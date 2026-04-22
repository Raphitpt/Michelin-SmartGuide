import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { ROUTES } from "@/constants";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

function readingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { slug } = await params;

  const { data: article } = await supabase
    .from("articles")
    .select("id, title, content_blocks, published_at, chef_id, profiles(full_name, avatar_url)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!article) notFound();

  const html = (article.content_blocks as { html?: string } | null)?.html ?? "";
  const chef = article.profiles as { full_name: string | null; avatar_url: string | null } | null;
  const initiales = chef?.full_name
    ? chef.full_name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "?";
  const minutes = readingTime(html);
  const publishedAt = article.published_at
    ? new Date(article.published_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24">

      {/* Hero */}
      <div
        className="relative px-4 pt-12 pb-10 flex flex-col justify-end min-h-[260px]"
        style={{
          background:
            "radial-gradient(ellipse at 20% 80%, #5C0A0A 0%, #1C0907 55%, #0D0403 100%)",
        }}
      >
        {/* Back */}
        <Link
          href={ROUTES.ARTICLES}
          className="absolute top-5 left-4 flex items-center gap-1 text-white/60 hover:text-white transition-colors text-sm"
        >
          <ChevronLeft size={18} />
          Articles
        </Link>

        {/* Catégorie */}
        <span className="self-start text-[10px] font-semibold uppercase tracking-[0.2em] text-michelin-red bg-white/10 rounded-full px-3 py-1 mb-4">
          Article
        </span>

        <h1 className="text-white font-bold text-2xl leading-tight tracking-tight">
          {article.title}
        </h1>

        {/* Ligne rouge décorative */}
        <div className="w-10 h-0.5 bg-michelin-red mt-4 mb-5" />

        {/* Chef + meta */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full bg-[#4A1C1C] flex items-center justify-center shrink-0 overflow-hidden border-2 border-white/20">
            {chef?.avatar_url ? (
              <Image src={chef.avatar_url} alt="" fill sizes="36px" className="object-cover" />
            ) : (
              <span className="text-white text-xs font-bold">{initiales}</span>
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-white text-sm font-medium leading-none">
              {chef?.full_name ?? "Chef"}
            </span>
            <div className="flex items-center gap-1.5 text-white/40 text-xs">
              {publishedAt && <span>{publishedAt}</span>}
              <span>·</span>
              <span>{minutes} min de lecture</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="px-5 pt-8">
        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      <style>{`
        .article-content {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 17px;
          line-height: 1.8;
          color: #1a1a1a;
        }
        .article-content p {
          margin-bottom: 1.4em;
        }
        .article-content h1,
        .article-content h2,
        .article-content h3 {
          font-family: Helvetica, Arial, sans-serif;
          font-weight: 700;
          color: #111;
          margin-top: 2em;
          margin-bottom: 0.6em;
          line-height: 1.3;
        }
        .article-content h1 { font-size: 1.5rem; }
        .article-content h2 { font-size: 1.25rem; }
        .article-content h3 { font-size: 1.1rem; }
        .article-content strong { font-weight: 700; }
        .article-content em { font-style: italic; }
        .article-content ul,
        .article-content ol {
          padding-left: 1.5em;
          margin-bottom: 1.4em;
        }
        .article-content li { margin-bottom: 0.4em; }
        .article-content blockquote {
          border-left: 3px solid #E4002B;
          margin: 1.6em 0;
          padding: 0.6em 1.2em;
          color: #555;
          font-style: italic;
          background: #faf8f5;
          border-radius: 0 8px 8px 0;
        }
        .article-content a {
          color: #E4002B;
          text-decoration: underline;
        }
        .article-content img {
          width: 100%;
          border-radius: 12px;
          margin: 1.4em 0;
        }
        .article-content hr {
          border: none;
          border-top: 1px solid #e5e5e5;
          margin: 2em 0;
        }
      `}</style>
    </div>
  );
}
