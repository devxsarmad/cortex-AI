import { AuthForm } from "@/features/auth/AuthForm";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ invite?: string }> }) {
  const { invite } = await searchParams;
  return <AuthForm mode="register" inviteToken={invite}/>;
}
