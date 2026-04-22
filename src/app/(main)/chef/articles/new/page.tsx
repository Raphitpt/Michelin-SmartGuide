import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import ArticleEditor from "@/components/ArticleEditor";
import { createArticleAction } from "@/lib/articles/actions";
import { ROUTES } from "@/constants";

export default async function NewArticlePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.LOGIN);

  return <ArticleEditor action={createArticleAction} />;
}
