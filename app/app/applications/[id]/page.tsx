import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ApplicationForm from "@/components/applications/application-form";
import RemindersPanel from "@/components/reminders/reminders-panel";
import DeleteApplicationButton from "@/components/applications/delete-application-button";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Page({
    params,
}: {
    params: { id: string } | Promise<{ id: string }>;
}) {
    const { id } = await Promise.resolve(params);

    const { userId } = await auth();
    if (!userId) return null;

    const [app, companies] = await prisma.$transaction([
        prisma.application.findFirst({
            where: { id, userId },
            include: {
                company: true,
                reminders: { orderBy: { dueAt: "asc" } },
            },
        }),
        prisma.company.findMany({
            where: { userId },
            orderBy: { updatedAt: "desc" },
            select: { id: true, name: true },
            take: 200,
        }),
    ]);

    if (!app) {
        return (
            <div className="space-y-6">
                <p className="text-sm opacity-80">Not found.</p>
                <Link className="underline" href="/app/applications">
                    Back
                </Link>
            </div>
        );
    }

    const appliedAt = new Date(app.appliedAt);
    const y = appliedAt.getUTCFullYear();
    const m = String(appliedAt.getUTCMonth() + 1).padStart(2, "0");
    const d = String(appliedAt.getUTCDate()).padStart(2, "0");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Edit application</h1>
                    <p className="mt-1 text-sm opacity-70">
                        {app.company.name} · {app.roleTitle}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <DeleteApplicationButton id={app.id} />
                    <Link className="underline" href="/app/applications">Back</Link>
                </div>
            </div>

            <div className="max-w-2xl space-y-6">
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                    <ApplicationForm
                        mode="edit"
                        appId={app.id}
                        companies={companies}
                        initial={{
                            roleTitle: app.roleTitle,
                            status: app.status as any,
                            appliedAt: `${y}-${m}-${d}`,
                            companyId: app.companyId,
                            jobUrl: app.jobUrl ?? "",
                            notes: app.notes ?? "",
                            salaryMin: app.salaryMin?.toString() ?? "",
                            salaryMax: app.salaryMax?.toString() ?? "",
                        }}
                    />
                </div>
                <RemindersPanel
                    applicationId={app.id}
                    reminders={app.reminders.map((r: { id: string; dueAt: Date; type: string; done: boolean }) => ({
                        id: r.id,
                        dueAt: r.dueAt.toISOString(),
                        type: r.type as any,
                        done: r.done,
                    }))}
                />
            </div>
        </div>
    );
}