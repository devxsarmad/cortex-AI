"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "./AuthProvider";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth(); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError(""); const values = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    try { if (mode === "login") await login({ email: values.email, password: values.password }); else await register({ name: values.name, organizationName: values.organizationName, email: values.email, password: values.password }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Authentication failed."); } finally { setBusy(false); }
  };
  return <main className="grid min-h-screen place-items-center bg-[#f5f7f7] px-4"><form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
    <div className="flex items-center gap-3"><Image src="/icon.svg" alt="" width={40} height={40} /><h1 className="text-2xl font-semibold">{mode === "login" ? "Sign in to Cortex" : "Create your workspace"}</h1></div>
    {mode === "register" && <><label className="block text-sm">Your name<input required name="name" autoComplete="name" className="mt-1 w-full rounded-md border p-2" /></label><label className="block text-sm">Organization name<input required name="organizationName" className="mt-1 w-full rounded-md border p-2" /></label></>}
    <label className="block text-sm">Email<input required type="email" name="email" autoComplete="email" className="mt-1 w-full rounded-md border p-2" /></label>
    <label className="block text-sm">Password<input required minLength={8} type="password" name="password" autoComplete={mode === "login" ? "current-password" : "new-password"} className="mt-1 w-full rounded-md border p-2" /></label>
    {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <button disabled={busy} className="w-full rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-50">{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
    <p className="text-center text-sm text-slate-600">{mode === "login" ? <>New to Cortex? <Link className="text-teal-700" href="/register">Register</Link></> : <>Already registered? <Link className="text-teal-700" href="/login">Sign in</Link></>}</p>
  </form></main>;
}
