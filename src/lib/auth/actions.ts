"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
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

// ─── Sign Up (client) ─────────────────────────────────────────────────────────

export async function signUpAction(
  prevState: SignUpState,
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

  const values = { nom: raw.nom, prenom: raw.prenom, date_naissance: raw.date_naissance, email: raw.email }

  const validated = signUpSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, values }
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
      return { errors: { email: ["Un compte existe déjà avec cet email."] }, values }
    }
    if (error.code === "over_email_send_rate_limit") {
      return { message: "Trop de tentatives. Attendez quelques minutes avant de réessayer.", values }
    }
    console.error("[signUpAction] Supabase error:", { code: error.code, message: error.message, status: error.status });
    return { message: "Une erreur est survenue. Veuillez réessayer.", values };
  }

  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      full_name: `${prenom} ${nom}`,
      role: "visitor",
    });
  }

  // Si confirmation email requise, l'identité n'est pas encore active
  if (data.user && data.user.identities?.length === 0) {
    return { message: "Un compte existe déjà avec cet email.", values }
  }

  redirect("/");
}

// ─── Sign Up (restaurant) ─────────────────────────────────────────────────────

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

  const validated = signUpRestaurantSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
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
      return { errors: { email: ["Un compte existe déjà avec cet email."] } };
    }
    return { message: "Une erreur est survenue. Veuillez réessayer." };
  }

  if (data.user) {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      full_name: nom,
      role: "chef",
    });
  }

  redirect("/login/restaurant/verify");
}

// ─── Submit claim (restaurant verify) ────────────────────────────────────────

export async function submitClaimAction(
  prevState: ClaimState,
  formData: FormData,
): Promise<ClaimState> {
  const raw = { restaurant_id: formData.get("restaurant_id") as string };

  const validated = claimSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "Vous devez être connecté." };

  // Load restaurant + its country
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
    return { message: "Une demande de revendication existe déjà pour ce restaurant." };
  }

  // Load required document types for this country
  const { data: docTypes } = await supabase
    .from("country_document_types")
    .select("id, slug, label, required")
    .eq("country_id", restaurant.country_id)
    .order("sort_order");

  if (!docTypes || docTypes.length === 0) {
    return { message: "Aucun type de document configuré pour ce pays." };
  }

  const allowedMime = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024;

  // Validate all required files
  const fileErrors: Record<string, string[]> = {};
  for (const dt of docTypes) {
    if (!dt.required) continue;
    const file = formData.get(dt.slug) as File | null;
    if (!file || file.size === 0) {
      fileErrors[dt.slug] = [`${dt.label} est requis.`];
    } else if (!allowedMime.includes(file.type)) {
      fileErrors[dt.slug] = ["Format non supporté (PDF, JPG, PNG, WEBP)."];
    } else if (file.size > maxSize) {
      fileErrors[dt.slug] = ["Fichier trop volumineux (max 5 Mo)."];
    }
  }
  if (Object.keys(fileErrors).length > 0) return { errors: fileErrors };

  // Create the ownership claim
  const { data: claim, error: claimError } = await supabase
    .from("ownership_claims")
    .insert({ user_id: user.id, restaurant_id: restaurant.id, status: "pending" })
    .select("id")
    .single();

  if (claimError || !claim) {
    return { message: "Erreur lors de la création de la demande." };
  }

  // Upload and save each document
  const uploadFile = async (file: File, prefix: string) => {
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${prefix}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("claim-documents")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    return supabase.storage.from("claim-documents").getPublicUrl(path).data.publicUrl;
  };

  try {
    for (const dt of docTypes) {
      const file = formData.get(dt.slug) as File | null;
      if (!file || file.size === 0) continue;
      const url = await uploadFile(file, dt.slug);
      await supabase.from("claim_documents").insert({
        claim_id: claim.id,
        document_type_id: dt.id,
        file_url: url,
        mime_type: file.type,
        file_size_kb: Math.round(file.size / 1024),
        status: "pending",
      });
    }
  } catch {
    return { message: "Erreur lors de l'upload des documents. Veuillez réessayer." };
  }

  return { success: true };
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

  const { data } = await supabase
    .from("country_document_types")
    .select("id, slug, label, description, required, accepted_formats")
    .eq("country_id", countryId)
    .order("sort_order");

  return data ?? [];
}

export async function getClaimStatusAction() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("ownership_claims")
    .select(`
      id,
      status,
      admin_comment,
      created_at,
      updated_at,
      restaurants (id, name, city)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return data ?? null;
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
