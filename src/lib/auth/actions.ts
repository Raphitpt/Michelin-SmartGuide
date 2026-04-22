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

  const { error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error) {
    return { message: "Email ou mot de passe incorrect." };
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
  const raw = {
    restaurant_name: formData.get("restaurant_name") as string,
    siret: formData.get("siret") as string,
  };

  const validated = claimSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const kbisFile = formData.get("kbis") as File | null;
  const factureFile = formData.get("facture") as File | null;

  if (!kbisFile || kbisFile.size === 0) {
    return { errors: { kbis: ["Le Kbis est requis."] } };
  }
  if (!factureFile || factureFile.size === 0) {
    return { errors: { facture: ["La facture professionnelle est requise."] } };
  }

  const allowedMime = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];
  if (!allowedMime.includes(kbisFile.type)) {
    return { errors: { kbis: ["Format non supporté (PDF, JPG, PNG, WEBP)."] } };
  }
  if (!allowedMime.includes(factureFile.type)) {
    return {
      errors: { facture: ["Format non supporté (PDF, JPG, PNG, WEBP)."] },
    };
  }

  const maxSize = 5 * 1024 * 1024; // 5 MB
  if (kbisFile.size > maxSize) {
    return { errors: { kbis: ["Fichier trop volumineux (max 5 Mo)."] } };
  }
  if (factureFile.size > maxSize) {
    return { errors: { facture: ["Fichier trop volumineux (max 5 Mo)."] } };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "Vous devez être connecté." };
  }

  // Find the restaurant by name
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, name")
    .ilike("name", `%${validated.data.restaurant_name}%`)
    .limit(1);

  if (!restaurants || restaurants.length === 0) {
    return {
      errors: { restaurant_name: ["Aucun restaurant trouvé avec ce nom."] },
    };
  }

  const restaurant = restaurants[0];

  // Check no pending claim already exists
  const { data: existingClaim } = await supabase
    .from("ownership_claims")
    .select("id")
    .eq("user_id", user.id)
    .eq("restaurant_id", restaurant.id)
    .single();

  if (existingClaim) {
    return {
      message: "Une demande de revendication existe déjà pour ce restaurant.",
    };
  }

  // Upload files to Supabase Storage
  const uploadFile = async (file: File, prefix: string) => {
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${prefix}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("claim-documents")
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
    if (error) throw error;
    const { data: urlData } = supabase.storage
      .from("claim-documents")
      .getPublicUrl(path);
    return { url: urlData.publicUrl, path };
  };

  let kbisUrl: string;
  let factureUrl: string;

  try {
    const [kbisResult, factureResult] = await Promise.all([
      uploadFile(kbisFile, "kbis"),
      uploadFile(factureFile, "facture"),
    ]);
    kbisUrl = kbisResult.url;
    factureUrl = factureResult.url;
  } catch {
    return {
      message: "Erreur lors de l'upload des documents. Veuillez réessayer.",
    };
  }

  // Create the ownership claim
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

  // Look up document types by slug
  const { data: docTypes } = await supabase
    .from("country_document_types")
    .select("id, slug")
    .in("slug", ["kbis", "facture-pro"]);

  const kbisTypeId = docTypes?.find((d) => d.slug === "kbis")?.id;
  const factureTypeId = docTypes?.find((d) => d.slug === "facture-pro")?.id;

  if (kbisTypeId) {
    await supabase.from("claim_documents").insert({
      claim_id: claim.id,
      document_type_id: kbisTypeId,
      file_url: kbisUrl,
      mime_type: kbisFile.type,
      file_size_kb: Math.round(kbisFile.size / 1024),
      status: "pending",
    });
  }

  if (factureTypeId) {
    await supabase.from("claim_documents").insert({
      claim_id: claim.id,
      document_type_id: factureTypeId,
      file_url: factureUrl,
      mime_type: factureFile.type,
      file_size_kb: Math.round(factureFile.size / 1024),
      status: "pending",
    });
  }

  return { success: true };
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
