import { z } from 'zod'

export const signInSchema = z.object({
  email: z.email({ error: 'Adresse email invalide.' }),
  password: z.string().min(1, { error: 'Le mot de passe est requis.' }),
})

export const signUpSchema = z
  .object({
    nom: z.string().min(2, { error: 'Le nom doit contenir au moins 2 caractères.' }).trim(),
    prenom: z.string().min(2, { error: 'Le prénom doit contenir au moins 2 caractères.' }).trim(),
    date_naissance: z.string().min(1, { error: 'La date de naissance est requise.' }),
    email: z.email({ error: 'Adresse email invalide.' }),
    password: z
      .string()
      .min(8, { error: 'Au moins 8 caractères.' })
      .regex(/[a-zA-Z]/, { error: 'Au moins une lettre.' })
      .regex(/\d/, { error: 'Au moins un chiffre.' }),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    error: 'Les mots de passe ne correspondent pas.',
    path: ['confirm_password'],
  })

export const signUpRestaurantSchema = z
  .object({
    nom: z.string().min(2, { error: 'Le nom doit contenir au moins 2 caractères.' }).trim(),
    job_title: z.string().min(2, { error: 'Le rôle est requis.' }).trim(),
    email: z.email({ error: 'Adresse email invalide.' }),
    password: z
      .string()
      .min(8, { error: 'Au moins 8 caractères.' })
      .regex(/[a-zA-Z]/, { error: 'Au moins une lettre.' })
      .regex(/\d/, { error: 'Au moins un chiffre.' }),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    error: 'Les mots de passe ne correspondent pas.',
    path: ['confirm_password'],
  })

export const forgotPasswordSchema = z.object({
  email: z.email({ error: 'Adresse email invalide.' }),
})

export const claimSchema = z.object({
  restaurant_id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { message: 'Veuillez sélectionner un restaurant.' }),
  siret: z.string().regex(/^\d{14}$/, { message: 'Le SIRET doit contenir exactement 14 chiffres.' }),
})

export type SignInState =
  | { errors?: { email?: string[]; password?: string[] }; message?: string }
  | undefined

export type SignUpState =
  | {
      errors?: {
        nom?: string[]
        prenom?: string[]
        date_naissance?: string[]
        email?: string[]
        password?: string[]
        confirm_password?: string[]
      }
      message?: string
      pendingConfirmation?: boolean
      values?: {
        nom?: string
        prenom?: string
        date_naissance?: string
        email?: string
      }
    }
  | undefined

export type SignUpRestaurantState =
  | {
      errors?: {
        nom?: string[]
        job_title?: string[]
        email?: string[]
        password?: string[]
        confirm_password?: string[]
      }
      message?: string
      values?: {
        nom?: string
        job_title?: string
        email?: string
      }
    }
  | undefined

export type ForgotPasswordState =
  | { errors?: { email?: string[] }; message?: string; success?: boolean }
  | undefined

export type ClaimState =
  | {
      errors?: {
        restaurant_id?: string[]
        siret?: string[]
        docs?: Record<string, string[]>
      }
      message?: string
      success?: boolean
      restaurantId?: string
    }
  | undefined

export type RestaurantRegistrationState =
  | {
      errors?: {
        // Step 1
        nom?: string[]
        job_title?: string[]
        email?: string[]
        password?: string[]
        confirm_password?: string[]
        // Step 2
        restaurant_id?: string[]
        siret?: string[]
        docs?: Record<string, string[]>
      }
      message?: string
    }
  | undefined
