import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect(
      session.user.role === "ADMIN" || session.user.role === "STAFF"
        ? "/desk"
        : "/portal",
    );
  }

  const params = await searchParams;

  return <LoginForm registered={params.registered === "1"} />;
}
