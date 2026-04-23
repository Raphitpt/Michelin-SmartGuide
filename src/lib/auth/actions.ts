"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  signInSchema,
  signUpSchema,
  signUpRestaurantSchema,
  forgotPasswordSchema,
  claimSchema,
  type SignInState,
  type SignUpState,
  type SignUpRestaurantState,
  type ForgotPasswordState,
  type ClaimState,
  type RestaurantRegistrationState,
} from "./schemas";

// ─── Sign In ──────────────────────────────────────────────────────────────────

export async function signInAction(
  prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validated = signInSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error) {
    return { message: "Email ou mot de passe incorrect." };
  }

  // Block chefs with unverified/rejected claims
  if (authData.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (profile?.role === "chef") {
      const { data: claim } = await supabase
        .from("ownership_claims")
        .select("status")
        .eq("user_id", authData.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!claim || claim.status !== "accepted") {
        redirect("/login/restaurant/status");
      }
    }
  }

  redirect("/");
}

// ─── Sign Up (restaurant) ────────────────────────────────────────────────────

export async function signUpRestaurantAction(
  prevState: SignUpRestaurantState,
  formData: FormData,
): Promise<SignUpRestaurantState> {
  const raw = {
    nom: formData.get("nom") as string,
    job_title: formData.get("job_title") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirm_password: formData.get("confirm_password") as string,
  };

  const values = {
    nom: raw.nom,
    job_title: raw.job_title,
    email: raw.email,
  };

  const validated = signUpRestaurantSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, values };
  }

  const { nom, job_title, email, password } = validated.data;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: nom,
        job_title,
      },
    },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return {
        errors: { email: ["Un compte existe déjà avec cet email."] },
        values,
      };
    }
    if (error.code === "over_email_send_rate_limit") {
      return {
        message:
          "Trop de tentatives. Attendez quelques minutes avant de réessayer.",
        values,
      };
    }
    console.error("[signUpRestaurantAction] Supabase error:", {
      code: error.code,
      message: error.message,
      status: error.status,
    });
    return { message: "Une erreur est survenue. Veuillez réessayer.", values };
  }

  // Si confirmation email requise, l'identité n'est pas encore active
  if (data.user && data.user.identities?.length === 0) {
    return { message: "Un compte existe déjà avec cet email.", values };
  }

  // Create profile with chef role
  if (data.user) {
    const admin = createAdminClient();
    await admin.from("profiles").upsert({
      id: data.user.id,
      full_name: nom,
      role: "chef",
    });
  }

  redirect("/login/restaurant/verify");
}

// ─── Sign Up (client) ─────────────────────────────────────────────────────────

export async function signUpAction(
  prevState: SignUpState | undefined,
  formData: FormData,
): Promise<SignUpState> {
  const raw = {
    nom: formData.get("nom") as string,
    prenom: formData.get("prenom") as string,
    date_naissance: formData.get("date_naissance") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirm_password: formData.get("confirm_password") as string,
  };

  const values = {
    nom: raw.nom,
    prenom: raw.prenom,
    date_naissance: raw.date_naissance,
    email: raw.email,
  };

  const validated = signUpSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, values };
  }

  const { nom, prenom, date_naissance, email, password } = validated.data;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: `${prenom} ${nom}`,
        date_naissance,
      },
    },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return {
        errors: { email: ["Un compte existe déjà avec cet email."] },
        values,
      };
    }
    if (error.code === "over_email_send_rate_limit") {
      return {
        message:
          "Trop de tentatives. Attendez quelques minutes avant de réessayer.",
        values,
      };
    }
    console.error("[signUpAction] Supabase error:", {
      code: error.code,
      message: error.message,
      status: error.status,
    });
    return { message: "Une erreur est survenue. Veuillez réessayer.", values };
  }

  // Si confirmation email requise, l'identité n'est pas encore active
  if (data.user && data.user.identities?.length === 0) {
    return { message: "Un compte existe déjà avec cet email.", values };
  }

  redirect("/");
}

// ─── Complete restaurant registration (account + docs in one shot) ──────────

export async function completeRestaurantRegistrationAction(
  prevState: RestaurantRegistrationState,
  formData: FormData,
): Promise<RestaurantRegistrationState> {
  // ── Step 1 validation ──────────────────────────────────────────────────────
  const step1 = signUpRestaurantSchema.safeParse({
    nom: formData.get("nom"),
    job_title: formData.get("job_title"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  });
  if (!step1.success) {
    return { errors: step1.error.flatten().fieldErrors };
  }

  // ── Step 2 validation ──────────────────────────────────────────────────────
  const step2 = claimSchema.safeParse({
    restaurant_id: formData.get("restaurant_id"),
    siret: formData.get("siret"),
  });
  if (!step2.success) {
    return { errors: step2.error.flatten().fieldErrors };
  }

  const { nom, job_title, email, password } = step1.data;
  const { restaurant_id, siret: _siret } = step2.data;

  // ── Fetch restaurant + doc types ───────────────────────────────────────────
  const admin = createAdminClient();

  const { data: restaurant } = await admin
    .from("restaurants")
    .select("id, name, country_id")
    .eq("id", restaurant_id)
    .single();

  if (!restaurant) {
    return { errors: { restaurant_id: ["Restaurant introuvable."] } };
  }

  const { data: docTypes } = await admin
    .from("country_document_types")
    .select("id, slug, label, required")
    .eq("country_id", restaurant.country_id ?? "")
    .order("sort_order");

  // ── Validate doc files ─────────────────────────────────────────────────────
  const docErrors: Record<string, string[]> = {};
  for (const dt of docTypes ?? []) {
    const file = formData.get(dt.slug) as File | null;
    if (dt.required && (!file || file.size === 0)) {
      docErrors[dt.slug] = [`${dt.label} est requis.`];
    } else if (file && file.size > 0) {
      if (!ALLOWED_MIME.includes(fileMime(file)))
        docErrors[dt.slug] = ["Format non supporté (PDF, JPG, PNG, WEBP)."];
      else if (file.size > MAX_FILE_SIZE)
        docErrors[dt.slug] = ["Fichier trop volumineux (max 5 Mo)."];
    }
  }
  if (Object.keys(docErrors).length > 0) return { errors: { docs: docErrors } };

  // ── Create auth user ───────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: nom, job_title } },
  });

  if (authError) {
    if (authError.code === "user_already_exists") {
      return { errors: { email: ["Un compte existe déjà avec cet email."] } };
    }
    return {
      message: "Erreur lors de la création du compte. Veuillez réessayer.",
    };
  }

  const userId = authData.user?.id;
  if (!userId) return { message: "Erreur lors de la création du compte." };

  // ── Create profile via admin (bypasses RLS) ────────────────────────────────
  await admin
    .from("profiles")
    .upsert({ id: userId, full_name: nom, role: "chef" });

  // ── Upload docs + create claim ────────────────────────────────────────────
  const { data: claim, error: claimError } = await admin
    .from("ownership_claims")
    .insert({
      user_id: userId,
      restaurant_id: restaurant.id,
      status: "pending",
    })
    .select("id")
    .single();

  if (claimError || !claim) {
    return { message: "Erreur lors de la création de la demande." };
  }

  const folder = slugifyFolder(nom, restaurant.name);

  for (const dt of docTypes ?? []) {
    const file = formData.get(dt.slug) as File | null;
    if (!file || file.size === 0) continue;
    const path = `${folder}/${dt.slug}.${fileExt(file)}`;
    const { error: uploadError } = await admin.storage
      .from(CLAIM_BUCKET)
      .upload(path, file, { contentType: fileMime(file), upsert: false });
    if (uploadError) {
      return {
        message: "Erreur lors de l'upload des documents. Veuillez réessayer.",
      };
    }
    const { data: urlData } = admin.storage
      .from(CLAIM_BUCKET)
      .getPublicUrl(path);
    await admin.from("claim_documents").insert({
      claim_id: claim.id,
      document_type_id: dt.id,
      file_url: urlData.publicUrl,
      mime_type: fileMime(file),
      file_size_kb: Math.round(file.size / 1024),
      status: "pending",
    });
  }

  redirect("/login/restaurant/status");
}

// ─── Submit claim (restaurant verify) ────────────────────────────────────────

const CLAIM_BUCKET = "official_docs";
const ALLOWED_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function slugifyFolder(chefName: string, restaurantName: string): string {
  const slug = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
  return `${slug(chefName)}_${slug(restaurantName)}_${Date.now()}`;
}

const EXT_TO_MIME: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function fileExt(file: File): string {
  const fromName = file.name?.split(".").pop()?.toLowerCase();
  if (fromName && fromName.length > 0 && fromName.length <= 5) return fromName;
  return MIME_TO_EXT[file.type] ?? "bin";
}

function fileMime(file: File): string {
  if (file.type) return file.type;
  const ext = fileExt(file);
  return EXT_TO_MIME[ext] ?? "application/octet-stream";
}

export async function submitClaimAction(
  prevState: ClaimState,
  formData: FormData,
): Promise<ClaimState> {
  const validated = claimSchema.safeParse({
    restaurant_id: formData.get("restaurant_id"),
    siret: formData.get("siret"),
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { message: "Vous devez être connecté." };

  // Verify restaurant exists and get its country
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, country_id")
    .eq("id", validated.data.restaurant_id)
    .single();

  if (!restaurant) {
    return { errors: { restaurant_id: ["Restaurant introuvable."] } };
  }

  // Check no existing claim
  const { data: existingClaim } = await supabase
    .from("ownership_claims")
    .select("id")
    .eq("user_id", user.id)
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();

  if (existingClaim) {
    return {
      message: "Une demande de revendication existe déjà pour ce restaurant.",
    };
  }

  // Load document types for this country to validate server-side
  const { data: docTypes } = await supabase
    .from("country_document_types")
    .select("id, slug, label, required")
    .eq("country_id", restaurant.country_id ?? "")
    .order("sort_order");

  // Validate files
  const docErrors: Record<string, string[]> = {};
  for (const dt of docTypes ?? []) {
    const file = formData.get(dt.slug) as File | null;
    if (dt.required && (!file || file.size === 0)) {
      docErrors[dt.slug] = [`${dt.label} est requis.`];
    } else if (file && file.size > 0) {
      if (!ALLOWED_MIME.includes(fileMime(file)))
        docErrors[dt.slug] = ["Format non supporté (PDF, JPG, PNG, WEBP)."];
      else if (file.size > MAX_FILE_SIZE)
        docErrors[dt.slug] = ["Fichier trop volumineux (max 5 Mo)."];
    }
  }
  if (Object.keys(docErrors).length > 0) return { errors: { docs: docErrors } };

  // Create ownership claim
  const { data: claim, error: claimError } = await supabase
    .from("ownership_claims")
    .insert({
      user_id: user.id,
      restaurant_id: restaurant.id,
      status: "pending",
    })
    .select("id")
    .single();

  if (claimError || !claim) {
    return { message: "Erreur lors de la création de la demande." };
  }

  // Upload and save each document (admin client bypasses storage RLS)
  const adminForUpload = createAdminClient();

  const { data: profile } = await adminForUpload
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const folder = slugifyFolder(profile?.full_name ?? user.id, restaurant.name);

  try {
    for (const dt of docTypes ?? []) {
      const file = formData.get(dt.slug) as File | null;
      if (!file || file.size === 0) continue;
      const path = `${folder}/${dt.slug}.${fileExt(file)}`;
      const { error } = await adminForUpload.storage
        .from(CLAIM_BUCKET)
        .upload(path, file, { contentType: fileMime(file), upsert: false });
      if (error) throw error;
      const { data: urlData } = adminForUpload.storage
        .from(CLAIM_BUCKET)
        .getPublicUrl(path);
      await adminForUpload.from("claim_documents").insert({
        claim_id: claim.id,
        document_type_id: dt.id,
        file_url: urlData.publicUrl,
        mime_type: fileMime(file),
        file_size_kb: Math.round(file.size / 1024),
        status: "pending",
      });
    }
  } catch (err) {
    console.error("[submitClaimAction] upload error:", err);
    return {
      message: "Erreur lors de l'upload des documents. Veuillez réessayer.",
    };
  }

  redirect("/login/restaurant/status");
}

// ─── Upload missing/refused docs (chef resubmission) ─────────────────────────

export type UploadMissingState = {
  success?: boolean;
  message?: string;
};

export async function uploadMissingDocsAction(
  _prevState: UploadMissingState,
  formData: FormData,
): Promise<UploadMissingState> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { message: "Vous devez être connecté." };

  const claimId = formData.get("claim_id") as string;
  if (!claimId) return { message: "Demande introuvable." };

  const { data: claim } = await supabase
    .from("ownership_claims")
    .select("id, status, restaurants(id, name, country_id)")
    .eq("id", claimId)
    .eq("user_id", user.id)
    .single();

  if (!claim || claim.status !== "missing_infos") {
    return { message: "Demande invalide ou déjà traitée." };
  }

  const restaurant = Array.isArray(claim.restaurants)
    ? claim.restaurants[0]
    : claim.restaurants;
  if (!restaurant) return { message: "Restaurant introuvable." };

  const adminForUpload = createAdminClient();

  const { data: docTypes } = await adminForUpload
    .from("country_document_types")
    .select("id, slug, label")
    .eq(
      "country_id",
      (restaurant as { country_id: string | null }).country_id ?? "",
    );

  if (!docTypes?.length) return { message: "Aucun type de document défini." };

  const { data: profile } = await adminForUpload
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const baseFolder = slugifyFolder(
    profile?.full_name ?? user.id,
    (restaurant as { name: string }).name,
  );
  const resubmitTag = `resubmit_${Date.now()}`;

  const uploads: { file: File; docTypeId: string; slug: string }[] = [];
  for (const dt of docTypes) {
    const file = formData.get(`doc_${dt.id}`) as File | null;
    if (!file || file.size === 0) continue;
    if (!ALLOWED_MIME.includes(fileMime(file)))
      return {
        message: `Format invalide pour ${dt.label} (PDF, JPG, PNG, WEBP).`,
      };
    if (file.size > MAX_FILE_SIZE)
      return { message: `${dt.label} dépasse 5 Mo.` };
    uploads.push({ file, docTypeId: dt.id, slug: dt.slug });
  }

  if (uploads.length === 0) {
    return { message: "Veuillez sélectionner au moins un document." };
  }

  try {
    for (const { file, docTypeId, slug } of uploads) {
      const path = `${baseFolder}/${resubmitTag}_${slug}.${fileExt(file)}`;
      const { error: uploadError } = await adminForUpload.storage
        .from(CLAIM_BUCKET)
        .upload(path, file, { contentType: fileMime(file), upsert: false });
      if (uploadError) throw uploadError;

      const { data: urlData } = adminForUpload.storage
        .from(CLAIM_BUCKET)
        .getPublicUrl(path);

      await adminForUpload.from("claim_documents").insert({
        claim_id: claimId,
        document_type_id: docTypeId,
        file_url: urlData.publicUrl,
        mime_type: fileMime(file),
        file_size_kb: Math.round(file.size / 1024),
        status: "pending",
      });
    }

    await adminForUpload
      .from("ownership_claims")
      .update({ status: "pending" })
      .eq("id", claimId);
  } catch (err) {
    console.error("[uploadMissingDocsAction]", err);
    return { message: "Erreur lors de l'upload. Veuillez réessayer." };
  }

  redirect("/login/restaurant/status");
}

// ─── Restaurant search (for claim form) ──────────────────────────────────────

export async function searchRestaurantsAction(query: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (!query || query.trim().length < 2) return [];

  const { data } = await supabase
    .from("restaurants")
    .select("id, name, city, country_id")
    .ilike("name", `%${query.trim()}%`)
    .limit(10);

  return data ?? [];
}

export async function getDocumentTypesAction(countryId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  console.log(countryId);
  try {
    const { data } = await supabase
      .from("country_document_types")
      .select("id, slug, label, description, required, accepted_formats")
      .eq("country_id", countryId)
      .order("sort_order");
    console.log(data);
    return data ?? [];
  } catch (e) {
    console.error("Error fetching document types:", e);
    return [];
  }
}

export async function getClaimStatusAction() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("ownership_claims")
    .select(
      `
      id,
      status,
      admin_comment,
      created_at,
      updated_at,
      restaurants (
        id,
        name,
        city,
        slug,
        michelin_awards (stars, label, slug)
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return data ?? null;
}

export async function markClaimNotificationReadAction(
  notifId: string,
): Promise<void> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notifId)
    .eq("user_id", user.id);
}

// ─── Forgot password ──────────────────────────────────────────────────────────

export async function forgotPasswordAction(
  prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const raw = { email: formData.get("email") as string };

  const validated = forgotPasswordSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/callback?type=recovery`;

  const { error } = await supabase.auth.resetPasswordForEmail(
    validated.data.email,
    {
      redirectTo,
    },
  );

  // Always return success to avoid email enumeration
  if (error && process.env.NODE_ENV === "development") {
    console.error("resetPasswordForEmail error:", error);
  }

  return { success: true };
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOutAction() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();
  redirect("/login");
}
