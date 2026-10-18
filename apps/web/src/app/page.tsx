import { ChatView } from "@/features/chat/components/ChatView";
import { RequireAuth } from "@/features/auth/AuthProvider";

export default function Home() {
  return <RequireAuth><ChatView /></RequireAuth>;
}
