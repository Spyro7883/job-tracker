"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";

const CompanySchema = z.object({
  name: z.string().min(2, "Name is required"),
  website: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^https?:\/\//i.test(v), "Invalid URL"),
  location: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export async function createCompany(input: unknown) {
  const userId = await requireUserId();
  const data = CompanySchema.parse(input);

  const company = await prisma.company.upsert({
    where: { userId_name: { userId, name: data.name.trim() } },
    update: {
      website: data.website?.trim() || null,
      location: data.location?.trim() || null,
      notes: data.notes?.trim() || null,
    },
    create: {
      userId,
      name: data.name.trim(),
      website: data.website?.trim() || null,
      location: data.location?.trim() || null,
      notes: data.notes?.trim() || null,
    },
  });

  revalidatePath("/app/companies");
  return { id: company.id };
}

export async function updateCompany(id: string, input: unknown) {
  const userId = await requireUserId();
  const data = CompanySchema.parse(input);

  const existing = await prisma.company.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Not found");

  const company = await prisma.company.update({
    where: { id },
    data: {
      name: data.name.trim(),
      website: data.website?.trim() || null,
      location: data.location?.trim() || null,
      notes: data.notes?.trim() || null,
    },
  });

  revalidatePath("/app/companies");
   return { id: company.id };
}

export async function deleteCompany(id: string) {
  const userId = await requireUserId();

  const existing = await prisma.company.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) throw new Error("Not found");

  await prisma.company.delete({ where: { id } });

  revalidatePath("/app/companies");
  revalidatePath("/app/applications");
  return { ok: true };
}