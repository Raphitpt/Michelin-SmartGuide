import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import AppHeader from "@/components/AppHeader";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { slug } = await params;

  const { data: article } = await supabase
    .from("articles")
    .select("id, title, content_blocks, published_at, chef_id, profiles(full_name)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!article) notFound();

  const html = (article.content_blocks as { html?: string } | null)?.html ?? "";
  const chef = article.profiles as { full_name: string | null } | null;
  const publishedAt = article.published_at
    ? new Date(article.published_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-michelin-cream pb-20">
      <AppHeader />

      <div
        className="px-4 pt-8 pb-6"
        style={{
          background:
            "radial-gradient(ellipse at 30% 60%, #5C0A0A 0%, #1C0907 60%, #110503 100%)",
        }}
      >
        <h1 className="text-white font-bold text-2xl leading-snug">{article.title}</h1>
        <div className="flex items-center gap-2 mt-3 text-white/50 text-xs">
          {chef?.full_name && <span>{chef.full_name}</span>}
          {chef?.full_name && publishedAt && <span>·</span>}
          {publishedAt && <span>{publishedAt}</span>}
        </div>
      </div>

      <div className="px-4 pt-6">
        <div
          className="prose prose-sm max-w-none text-michelin-black"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
