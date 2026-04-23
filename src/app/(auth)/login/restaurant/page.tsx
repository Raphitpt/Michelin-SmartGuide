"use client";

import Link from "next/link";
import { useState } from "react";
import { useActionState } from "react";
import { Eye, EyeOff, Mail, User, Briefcase, Lock } from "lucide-react";
import { signUpRestaurantAction } from "@/lib/auth/actions";
import type { SignUpRestaurantState } from "@/lib/auth/schemas";

function Field({
  id,
  name,
  type = "text",
  autoComplete,
  label,
  icon: Icon,
  error,
  defaultValue,
}: {
  id: string;
  name: string;
  type?: string;
  autoComplete?: string;
  label: string;
  icon?: React.ElementType;
  error?: string;
  defaultValue?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-white/70 text-xs font-medium tracking-wider uppercase"
      >
        {label}
      </label>
      <div
        className={`relative flex items-center rounded-sm border transition-all duration-200 ${focused ? "border-michelin-red/70 bg-white/5" : "border-white/15 bg-white/5"}`}
      >
        {Icon && (
          <Icon
            size={15}
            strokeWidth={1.5}
            className={`absolute left-3.5 shrink-0 transition-colors duration-200 ${focused ? "text-michelin-red/80" : "text-white/30"}`}
          />
        )}
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          defaultValue={defaultValue}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full bg-transparent py-4 text-sm text-white placeholder-white/25 outline-none ${Icon ? "pl-10" : "pl-4"} pr-4`}
        />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

function PasswordField({
  id,
  name,
  autoComplete,
  label,
  error,
}: {
  id: string;
  name: string;
  autoComplete: string;
  label: string;
  error?: string | string[];
}) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-white/70 text-xs font-medium tracking-wider uppercase"
      >
        {label}
      </label>
      <div
        className={`relative flex items-center rounded-sm border transition-all duration-200 ${focused ? "border-michelin-red/70 bg-white/5" : "border-white/15 bg-white/5"}`}
      >
        <Lock
          size={15}
          strokeWidth={1.5}
          className={`absolute left-3.5 transition-colors duration-200 ${focused ? "text-michelin-red/80" : "text-white/30"}`}
        />
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent py-4 pl-10 pr-11 text-sm text-white placeholder-white/25 outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 text-white/30 hover:text-white/60 transition-colors"
          aria-label={visible ? "Masquer" : "Afficher"}
        >
          {visible ? (
            <EyeOff size={15} strokeWidth={1.5} />
          ) : (
            <Eye size={15} strokeWidth={1.5} />
          )}
        </button>
      </div>
      {Array.isArray(error)
        ? error.length > 0 && (
            <ul className="text-red-400 text-xs list-disc list-inside">
              {error.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )
        : error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

export default function RestaurantLoginPage() {
  const [state, action, pending] = useActionState<
    SignUpRestaurantState,
    FormData
  >(signUpRestaurantAction, undefined);
  const v = state?.values;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, #2a1810 0%, #1C0907 40%, #110503 100%)",
      }}
    >
      {/* Header */}
      <header className="bg-white/[0.03] border-b border-white/5 px-5 py-4 flex items-center shrink-0">
        <Link href="/login" className="flex items-center gap-1.5">
          <span className="text-michelin-red font-bold text-sm tracking-widest uppercase">
            Michelin
          </span>
          <span className="font-normal text-sm text-white/70">SmartGuide</span>
        </Link>
      </header>

      <div className="flex-1 flex flex-col px-6 py-8">
        <div className="mb-8">
          <p className="text-white/40 text-xs tracking-widest uppercase font-medium mb-2">
            Restaurateur
          </p>
          <h1 className="text-white font-bold text-2xl leading-snug">
            Revendiquez
            <br />
            votre restaurant
          </h1>
        </div>

        <form action={action} className="flex flex-col gap-4">
          {state?.message && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-sm px-4 py-3">
              {state.message}
            </div>
          )}

          <Field
            id="nom"
            name="nom"
            autoComplete="name"
            label="Nom du responsable"
            icon={User}
            error={state?.errors?.nom?.[0]}
            defaultValue={v?.nom}
          />
          <Field
            id="job_title"
            name="job_title"
            label="Rôle du responsable"
            icon={Briefcase}
            error={state?.errors?.job_title?.[0]}
            defaultValue={v?.job_title}
          />
          <Field
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            label="Email"
            icon={Mail}
            error={state?.errors?.email?.[0]}
            defaultValue={v?.email}
          />

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/20 text-xs">sécurité</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <PasswordField
            id="password"
            name="password"
            autoComplete="new-password"
            label="Mot de passe"
            error={state?.errors?.password}
          />
          <PasswordField
            id="confirm_password"
            name="confirm_password"
            autoComplete="new-password"
            label="Confirmer le mot de passe"
            error={state?.errors?.confirm_password?.[0]}
          />

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-michelin-red text-white text-sm font-semibold py-4 rounded-sm mt-2 hover:bg-red-700 active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
          >
            {pending ? "Création du compte…" : "Revendiquer ce restaurant"}
          </button>

          <p className="text-center text-white/35 text-sm">
            Déjà un compte ?{" "}
            <Link
              href="/login/client"
              className="text-white/70 hover:text-white transition-colors underline underline-offset-2"
            >
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
