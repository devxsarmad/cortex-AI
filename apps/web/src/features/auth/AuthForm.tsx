"use client";
import Link from "next/link";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "./AuthProvider";

const loginSchema = z.object({
  name: z.string(),
  organizationName: z.string(),
  email: z.string().trim().email("Enter a valid email address.").max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Password must contain at least 8 characters.").max(128)
});
const registerSchema = loginSchema.extend({
  name: z.string().trim().min(1, "Enter your name.").max(100),
  organizationName: z.string().trim().min(1, "Enter an organization name.").max(120)
});
type AuthFormValues = z.input<typeof registerSchema>;
const inputClassName = "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const { register: registerField, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<AuthFormValues>({
    resolver: zodResolver(mode === "login" ? loginSchema : registerSchema),
    defaultValues: { name: "", organizationName: "", email: "", password: "" }
  });
  const onSubmit = handleSubmit(async (values) => {
    try {
      if (mode === "login") await login({ email: values.email, password: values.password });
      else await register({ name: values.name.trim(), organizationName: values.organizationName.trim(), email: values.email, password: values.password });
    } catch (cause) {
      setError("root.server", { message: cause instanceof Error ? cause.message : "Authentication failed." });
    }
  });

  return <main className="grid min-h-screen place-items-center bg-[#f5f7f7] px-4"><form onSubmit={onSubmit} noValidate className="w-full max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
    <div className="flex items-center gap-3"><Image src="/icon.svg" alt="" width={40} height={40} /><h1 className="text-2xl font-semibold">{mode === "login" ? "Sign in to Cortex" : "Create your workspace"}</h1></div>
    {mode === "register" && <>
      <label className="block text-sm">Your name<input {...registerField("name")} placeholder="Ada Lovelace" autoComplete="name" className={inputClassName} />{errors.name && <span className="mt-1 block text-xs text-red-600">{errors.name.message}</span>}</label>
      <label className="block text-sm">Organization name<input {...registerField("organizationName")} placeholder="Acme Research" autoComplete="organization" className={inputClassName} />{errors.organizationName && <span className="mt-1 block text-xs text-red-600">{errors.organizationName.message}</span>}</label>
    </>}
    <label className="block text-sm">Email<input {...registerField("email")} type="email" placeholder="you@example.com" autoComplete="email" className={inputClassName} />{errors.email && <span className="mt-1 block text-xs text-red-600">{errors.email.message}</span>}</label>
    <label className="block text-sm">Password<input {...registerField("password")} type="password" placeholder="At least 8 characters" autoComplete={mode === "login" ? "current-password" : "new-password"} className={inputClassName} />{errors.password && <span className="mt-1 block text-xs text-red-600">{errors.password.message}</span>}</label>
    {errors.root?.server && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{errors.root.server.message}</p>}
    <button disabled={isSubmitting} className="w-full rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-50">{isSubmitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
    <p className="text-center text-sm text-slate-600">{mode === "login" ? <>New to Cortex? <Link className="text-teal-700" href="/register">Register</Link></> : <>Already registered? <Link className="text-teal-700" href="/login">Sign in</Link></>}</p>
  </form></main>;
}
