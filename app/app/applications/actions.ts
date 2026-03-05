"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const StatusEnum = z.enum([
  "Draft",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Archived",
]);

const BaseSchema = z
  .object({
    roleTitle: z.string().min(2),
    status: StatusEnum.default("Applied"),
    appliedAt: z.string().min(1),
    companyId: z.string().optional(),
    newCompanyName: z.string().optional(),
    jobUrl: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || /^https?:\/\//i.test(v), "Invalid URL"),
    notes: z.string().optional(),
    salaryMin: z
      .preprocess((v) => (v === "" || v === null || v === undefined ? undefined : Number(v)), z.number().int().nonnegative().optional()),
    salaryMax: z
      .preprocess((v) => (v === "" || v === null || v === undefined ? undefined : Number(v)), z.number().int().nonnegative().optional()),
  })
  .refine(
    (d) =>
      d.salaryMin === undefined ||
      d.salaryMax === undefined ||
      d.salaryMin <= d.salaryMax,
    {
      message: "salaryMin must be <= salaryMax", path: ["salaryMax"]
      
    })
  .refine(
    (d) =>
      !!(d.companyId && d.companyId.trim()) ||
      !!(d.newCompanyName && d.newCompanyName.trim()),
    { message: "Company is required", path: ["companyId"] }
  );

function parseDateYYYYMMDD(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}

async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function createApplication(input: unknown) {
  const userId = await requireUser();
  const data = BaseSchema.parse(input);

  const company =
    data.newCompanyName && data.newCompanyName.trim()
      ? await prisma.company.upsert({
          where: { userId_name: { userId, name: data.newCompanyName.trim() } },
          update: {},
          create: { userId, name: data.newCompanyName.trim() },
        })
      : await prisma.company.findFirst({
          where: { id: data.companyId, userId },
        });

  if (!company) throw new Error("Company not found");

  const app = await prisma.application.create({
    data: {
      userId,
      companyId: company.id,
      roleTitle: data.roleTitle.trim(),
      status: data.status,
      appliedAt: parseDateYYYYMMDD(data.appliedAt),
      jobUrl: data.jobUrl?.trim() || null,
      notes: data.notes?.trim() || null,
      salaryMin: data.salaryMin ?? null,
      salaryMax: data.salaryMax ?? null,
    },
  });

  revalidatePath("/app/applications");
  redirect(`/app/applications/${app.id}`);
}

export async function updateApplication(id: string, input: unknown) {
  const userId = await requireUser();
  const data = BaseSchema.parse(input);

  const existing = await prisma.application.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) throw new Error("Not found");

  const company =
    data.newCompanyName && data.newCompanyName.trim()
      ? await prisma.company.upsert({
          where: { userId_name: { userId, name: data.newCompanyName.trim() } },
          update: {},
          create: { userId, name: data.newCompanyName.trim() },
        })
      : await prisma.company.findFirst({
          where: { id: data.companyId, userId },
        });

  if (!company) throw new Error("Company not found");

  await prisma.application.update({
    where: { id },
    data: {
      companyId: company.id,
      roleTitle: data.roleTitle.trim(),
      status: data.status,
      appliedAt: parseDateYYYYMMDD(data.appliedAt),
      jobUrl: data.jobUrl?.trim() || null,
      notes: data.notes?.trim() || null,
      salaryMin: data.salaryMin ?? null,
      salaryMax: data.salaryMax ?? null,
    },
  });

  revalidatePath("/app/applications");
  revalidatePath(`/app/applications/${id}`);
  redirect(`/app/applications/${id}`);
}