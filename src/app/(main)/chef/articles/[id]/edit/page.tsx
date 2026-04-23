import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import ArticleEditor from "@/components/editor/ArticleEditor";
import { getArticleById, updateArticleAction } from "@/lib/articles/actions";
import { ROUTES } from "@/constants";

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.LOGIN);

  const { id } = await params;
  const { article, error } = await getArticleById(id);

  if (error || !article) notFound();

  return (
    <ArticleEditor
      action={updateArticleAction}
      article={{
        id: article.id,
        title: article.title,
        content_blocks: article.content_blocks as { html: string } | null,
        status: article.status as "draft" | "published" | "archived",
      }}
    />
  );
}
