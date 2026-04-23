"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getPresignedUrl } from "@/utils/s3";
import type { Database } from "@/types/supabase";

type ClaimStatus = Database["public"]["Enums"]["claim_status"];

async function requireAdmin() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/");
  return user;
}

export async function listClaimsAction(status?: ClaimStatus | "all") {
  await requireAdmin();
  const admin = createAdminClient();

  let query = admin
    .from("ownership_claims")
    .select(
      `
      id,
      status,
      admin_comment,
      created_at,
      updated_at,
      restaurants (id, name, city),
      profiles!ownership_claims_user_id_fkey (id, full_name),
      claim_documents (
        id,
        file_url,
        mime_type,
        file_size_kb,
        status,
        admin_comment,
        country_document_types (label)
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[listClaimsAction]", error);
    return [];
  }
  return data ?? [];
}

export async function getClaimDetailAction(claimId: string) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("ownership_claims")
    .select(
      `
      id,
      status,
      admin_comment,
      created_at,
      updated_at,
      restaurants (id, name, city),
      profiles!ownership_claims_user_id_fkey (id, full_name),
      claim_documents (
        id,
        file_url,
        mime_type,
        file_size_kb,
        status,
        admin_comment,
        country_document_types (label)
      )
    `,
    )
    .eq("id", claimId)
    .single();

  if (error) return null;
  return data;
}

export type UpdateClaimState = {
  success?: boolean;
  message?: string;
};

export async function updateClaimStatusAction(
  _prevState: UpdateClaimState,
  formData: FormData,
): Promise<UpdateClaimState> {
  const adminUser = await requireAdmin();
  const claimId = formData.get("claim_id") as string;
  const newStatus = formData.get("status") as ClaimStatus;
  const adminComment = (formData.get("admin_comment") as string) || null;

  if (!claimId || !newStatus) {
    return { message: "Données manquantes." };
  }

  const admin = createAdminClient();

  const updatePayload: {
    status: ClaimStatus;
    admin_comment: string | null;
    reviewed_at: string;
    reviewed_by: string;
  } = {
    status: newStatus,
    admin_comment: adminComment,
    reviewed_at: new Date().toISOString(),
    reviewed_by: adminUser.id,
  };

  const { data: existingClaim } = await admin
    .from("ownership_claims")
    .select("user_id, restaurant_id")
    .eq("id", claimId)
    .single();

  const { error } = await admin
    .from("ownership_claims")
    .update(updatePayload)
    .eq("id", claimId);

  if (error) {
    console.error("[updateClaimStatusAction]", error);
    return { message: "Erreur lors de la mise à jour." };
  }

  // When claim is accepted, update chef_id on restaurant
  if (
    newStatus === "accepted" &&
    existingClaim?.user_id &&
    existingClaim?.restaurant_id
  ) {
    const { error: restaurantError } = await admin
      .from("restaurants")
      .update({ chef_id: existingClaim.user_id })
      .eq("id", existingClaim.restaurant_id);

    if (restaurantError) {
      console.error(
        "[updateClaimStatusAction] Failed to update chef_id",
        restaurantError,
      );
    }

    await admin.from("notifications").insert({
      user_id: existingClaim.user_id,
      title: "Revendication acceptée 🎉",
      body: "Votre demande a été validée. Vous pouvez maintenant gérer votre restaurant depuis votre profil.",
      type: "claim" as const,
      payload: {},
      read: false,
    });
  }

  return { success: true };
}

export async function getAdminKpisAction() {
  await requireAdmin();
  const admin = createAdminClient();

  const [
    { count: usersCount },
    { count: chefsCount },
    { count: articlesCount },
    { count: restaurantsCount },
    { count: pendingClaimsCount },
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "chef"),
    admin
      .from("articles")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    admin.from("restaurants").select("*", { count: "exact", head: true }),
    admin
      .from("ownership_claims")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return {
    users: usersCount ?? 0,
    chefs: chefsCount ?? 0,
    articles: articlesCount ?? 0,
    restaurants: restaurantsCount ?? 0,
    pendingClaims: pendingClaimsCount ?? 0,
  };
}

const CLAIM_BUCKET = "official_docs";

export type UpdateDocState = {
  success?: boolean;
  message?: string;
};

export async function updateDocumentStatusAction(
  _prevState: UpdateDocState,
  formData: FormData,
): Promise<UpdateDocState> {
  await requireAdmin();
  const docId = formData.get("doc_id") as string;
  const status = formData.get("status") as "accepted" | "refused";
  const adminComment = (formData.get("admin_comment") as string) || null;

  if (!docId || !status) return { message: "Données manquantes." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("claim_documents")
    .update({ status, admin_comment: adminComment })
    .eq("id", docId);

  if (error) {
    console.error("[updateDocumentStatusAction]", error);
    return { message: "Erreur lors de la mise à jour." };
  }

  return { success: true };
}

export async function getDocumentPresignedUrlAction(
  fileUrl: string,
): Promise<string | null> {
  await requireAdmin();
  try {
    return await getPresignedUrl(CLAIM_BUCKET, fileUrl, 300);
  } catch (err) {
    console.error("[getDocumentPresignedUrlAction]", err);
    return null;
  }
}
