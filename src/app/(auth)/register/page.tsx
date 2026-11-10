import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = { title: "Apply for membership" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
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
  const defaultTier = params.tier === "VIP" ? "VIP" : "PREMIUM";

  return <RegisterForm defaultTier={defaultTier} />;
}
