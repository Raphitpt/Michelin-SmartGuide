"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ROUTES } from "@/constants";

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    + "-" + Date.now();
}

async function getChef() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié", supabase, user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "chef") {
    return { error: "Accès réservé aux chefs", supabase, user, profile: null };
  }

  return { error: null, supabase, user, profile };
}

// ─── Create ───────────────────────────────────────────────────────────────────

export type ArticleFormState = {
  error?: string;
  success?: boolean;
  articleId?: string;
};

export async function createArticleAction(
  _prevState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  const { error, supabase, profile } = await getChef();
  if (error || !profile) return { error: error ?? "Accès refusé" };

  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string) ?? "";
  const status = (formData.get("status") as "draft" | "published") ?? "draft";

  if (!title || title.length < 2) return { error: "Le titre est requis (2 caractères min)." };

  const slug = toSlug(title);

  const { data, error: dbError } = await supabase
    .from("articles")
    .insert({
      chef_id: profile.id,
      title,
      slug,
      content_blocks: { html: content },
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (dbError) {
    console.error("[createArticleAction]", dbError);
    return { error: "Erreur lors de la création de l'article." };
  }

  redirect(ROUTES.CHEF_ARTICLES);
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateArticleAction(
  _prevState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  const { error, supabase, profile } = await getChef();
  if (error || !profile) return { error: error ?? "Accès refusé" };

  const id = formData.get("id") as string;
  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string) ?? "";
  const status = (formData.get("status") as "draft" | "published") ?? "draft";

  if (!id) return { error: "ID de l'article manquant." };
  if (!title || title.length < 2) return { error: "Le titre est requis (2 caractères min)." };

  const { data: existing } = await supabase
    .from("articles")
    .select("id, published_at")
    .eq("id", id)
    .eq("chef_id", profile.id)
    .single();

  if (!existing) return { error: "Article introuvable ou accès refusé." };

  const { error: dbError } = await supabase
    .from("articles")
    .update({
      title,
      content_blocks: { html: content },
      status,
      published_at:
        status === "published"
          ? (existing.published_at ?? new Date().toISOString())
          : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("chef_id", profile.id);

  if (dbError) {
    console.error("[updateArticleAction]", dbError);
    return { error: "Erreur lors de la mise à jour de l'article." };
  }

  redirect(ROUTES.CHEF_ARTICLES);
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteArticleAction(id: string): Promise<{ error?: string }> {
  const { error, supabase, profile } = await getChef();
  if (error || !profile) return { error: error ?? "Accès refusé" };

  const { error: dbError } = await supabase
    .from("articles")
    .delete()
    .eq("id", id)
    .eq("chef_id", profile.id);

  if (dbError) {
    console.error("[deleteArticleAction]", dbError);
    return { error: "Erreur lors de la suppression." };
  }

  return {};
}

// ─── Get my articles ──────────────────────────────────────────────────────────

export async function getMyArticles() {
  const { error, supabase, profile } = await getChef();
  if (error || !profile) return { error, articles: [] };

  const { data, error: dbError } = await supabase
    .from("articles")
    .select("id, title, slug, status, published_at, created_at, updated_at")
    .eq("chef_id", profile.id)
    .order("updated_at", { ascending: false });

  if (dbError) return { error: "Erreur lors du chargement.", articles: [] };

  return { error: null, articles: data ?? [] };
}

// ─── Get article by id (chef only) ───────────────────────────────────────────

export async function getArticleById(id: string) {
  const { error, supabase, profile } = await getChef();
  if (error || !profile) return { error, article: null };

  const { data, error: dbError } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .eq("chef_id", profile.id)
    .single();

  if (dbError || !data) return { error: "Article introuvable.", article: null };

  return { error: null, article: data };
}
