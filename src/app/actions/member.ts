"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import type { FormState } from "@/app/actions/auth";

export async function updateProfileAction(
  _prevState: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Please sign in to update your profile." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (name.length < 2) {
    return {
      fieldErrors: { name: "Please enter your full name." },
      error: "Please review the highlighted fields.",
    };
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { name, phone: phone || null },
  });

  revalidatePath("/portal");
  return { success: "Profile updated." };
}
