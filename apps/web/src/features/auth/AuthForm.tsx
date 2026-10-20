"use client";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, FileCheck2, LockKeyhole, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, InlineError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "./AuthProvider";

const loginSchema = z.object({ name: z.string(), organizationName: z.string(), email: z.string().trim().email("Enter a valid work email.").max(254).transform((value) => value.toLowerCase()), password: z.string().min(8, "Password must contain at least 8 characters.").max(128) });
const registerSchema = loginSchema.extend({ name: z.string().trim().min(1, "Enter your full name.").max(100), organizationName: z.string().trim().min(1, "Enter your organization name.").max(120) });
type AuthFormValues = z.input<typeof registerSchema>;
const trustPoints = [[LockKeyhole, "Your documents stay inside your organization"], [FileCheck2, "Answers cite their sources"], [ShieldCheck, "Role-based access for your team"]] as const;

function StandardAuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const { register: registerField, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<AuthFormValues>({ resolver: zodResolver(mode === "login" ? loginSchema : registerSchema), mode: "onBlur", defaultValues: { name: "", organizationName: "", email: "", password: "" } });
  const onSubmit = handleSubmit(async (values) => { try { if (mode === "login") await login({ email: values.email, password: values.password }); else await register({ name: values.name.trim(), organizationName: values.organizationName.trim(), email: values.email, password: values.password }); } catch (cause) { setError("root.server", { message: cause instanceof Error ? cause.message : "Authentication failed." }); } });
  return <main className="grid min-h-screen bg-surface lg:grid-cols-[45%_55%]">
    <section className="relative hidden overflow-hidden bg-ink px-12 py-10 text-text-on-brand lg:flex lg:flex-col lg:justify-between" aria-label="About Cortex AI">
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full opacity-[0.08]" viewBox="0 0 600 900" fill="none"><path d="M-40 160C130 40 260 280 650 80M-60 410C180 210 330 570 650 310M-20 690C190 510 420 850 680 590" stroke="currentColor" strokeWidth="1"/><circle cx="470" cy="195" r="110" stroke="currentColor"/><circle cx="470" cy="195" r="62" stroke="currentColor"/></svg>
      <div className="relative flex items-center gap-3"><Image src="/icon.svg" alt="" width={36} height={36} className="rounded-control"/><span className="text-body-large font-semibold">Cortex AI</span></div>
      <div className="relative max-w-md"><h1 className="text-auth font-semibold">Answers your healthcare team can verify.</h1><p className="mt-3 text-body-large text-white/70">Search internal knowledge with clear sources, controlled access, and less uncertainty.</p><div className="mt-10 space-y-5">{trustPoints.map(([Icon, text]) => <div key={text} className="flex items-center gap-3 text-body"><span className="flex h-8 w-8 items-center justify-center rounded-control border border-white/20"><Icon className="h-4 w-4" strokeWidth={1.75}/></span><span>{text}</span></div>)}</div></div>
      <p className="relative text-caption text-white/60">Secure, organization-isolated workspaces</p>
    </section>
    <section className="flex min-h-screen flex-col"><div className="flex flex-1 items-center justify-center px-6 py-10"><div className="w-full max-w-[400px]">
      <div className="mb-8 flex items-center gap-3 lg:hidden"><Image src="/icon.svg" alt="" width={36} height={36} className="rounded-control"/><span className="font-semibold">Cortex AI</span></div>
      <p className="text-small font-medium text-primary">{mode === "login" ? "Welcome back" : "Get started"}</p><h2 className="mt-1 text-page font-semibold">{mode === "login" ? "Sign in to your workspace" : "Create your workspace"}</h2><p className="mt-2 text-body text-text-secondary">{mode === "login" ? "Use your organization credentials to continue." : "Set up a secure space for your team’s knowledge."}</p>
      <form onSubmit={onSubmit} noValidate className="mt-7 space-y-field">{errors.root?.server && <div className="rounded-control border border-danger/20 bg-danger-soft p-3"><InlineError>{errors.root.server.message}</InlineError></div>}{mode === "register" && <><Field label="Full name" htmlFor="name" error={errors.name?.message}><Input id="name" {...registerField("name")} placeholder="Ada Lovelace" autoComplete="name" aria-invalid={Boolean(errors.name)}/></Field><Field label="Organization name" htmlFor="organization" error={errors.organizationName?.message}><Input id="organization" {...registerField("organizationName")} placeholder="Northwind Clinic" autoComplete="organization" aria-invalid={Boolean(errors.organizationName)}/></Field></>}<Field label="Work email" htmlFor="email" error={errors.email?.message}><Input id="email" {...registerField("email")} type="email" placeholder="you@clinic.org" autoComplete="email" aria-invalid={Boolean(errors.email)}/></Field><Field label="Password" htmlFor="password" error={errors.password?.message} helper={mode === "register" ? "Use at least 8 characters." : undefined}><Input id="password" {...registerField("password")} type="password" revealable placeholder="Enter your password" autoComplete={mode === "login" ? "current-password" : "new-password"} aria-invalid={Boolean(errors.password)}/></Field>{mode === "register" && !errors.password && <p className="flex items-center gap-1.5 text-caption text-text-secondary"><CheckCircle2 className="h-3.5 w-3.5 text-success"/>Password strength improves with length and variety.</p>}<Button type="submit" loading={isSubmitting} className="h-control-lg w-full">{mode === "login" ? "Sign in" : "Create account"}</Button><p className="text-center text-small text-text-secondary">{mode === "login" ? <>New to Cortex? <Link className="font-medium text-primary hover:underline" href="/register">Create an account</Link></> : <>Already registered? <Link className="font-medium text-primary hover:underline" href="/login">Sign in</Link></>}</p></form>
    </div></div><footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-6 py-4 text-caption text-text-muted"><span>Not a clinical decision system. For informational use.</span><span><a href="#" className="hover:text-text-primary">Terms</a> · <a href="#" className="hover:text-text-primary">Privacy</a></span></footer></section>
  </main>;
}

const invitationSchema = z.object({ name: z.string().trim().min(1, "Enter your full name."), password: z.string().min(8, "Password must contain at least 8 characters.") });
function InvitationForm({ token }: { token: string }) {
  const { acceptInvitation } = useAuth();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<z.infer<typeof invitationSchema>>({ resolver: zodResolver(invitationSchema), defaultValues: { name: "", password: "" } });
  const submit = handleSubmit(async (values) => { try { await acceptInvitation({ token, ...values }); } catch (cause) { setError("root.server", { message: cause instanceof Error ? cause.message : "Could not accept invitation." }); } });
  return <main className="flex min-h-screen items-center justify-center bg-canvas px-6"><section className="w-full max-w-md rounded-card border border-border bg-surface p-7 shadow-overlay"><div className="flex items-center gap-3"><Image src="/icon.svg" alt="Cortex AI" width={36} height={36} className="rounded-control"/><span className="font-semibold">Cortex AI</span></div><p className="mt-8 text-small font-medium text-primary">Workspace invitation</p><h1 className="mt-1 text-page font-semibold">Join your team</h1><p className="mt-2 text-body text-text-secondary">Create your account, or enter your existing account password, to accept this invitation.</p><form onSubmit={submit} className="mt-6 space-y-field">{errors.root?.server && <div className="rounded-control bg-danger-soft p-3"><InlineError>{errors.root.server.message}</InlineError></div>}<Field label="Full name" htmlFor="invite-name" error={errors.name?.message}><Input id="invite-name" {...register("name")} autoComplete="name"/></Field><Field label="Password" htmlFor="invite-password" error={errors.password?.message} helper="Use your existing password if you already have an account."><Input id="invite-password" {...register("password")} type="password" revealable autoComplete="current-password"/></Field><Button type="submit" loading={isSubmitting} className="w-full">Accept invitation</Button></form></section></main>;
}

export function AuthForm({ mode, inviteToken }: { mode: "login" | "register"; inviteToken?: string }) {
  return inviteToken ? <InvitationForm token={inviteToken}/> : <StandardAuthForm mode={mode}/>;
}
