import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import ApplicationForm from "@/components/applications/application-form";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Page() {
    const { userId } = await auth();
    if (!userId) return null;

    const companies = await prisma.company.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        select: { id: true, name: true },
        take: 200,
    });

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">New application</h1>
            <div className="max-w-2xl rounded-xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-white/5">
                <ApplicationForm mode="create" companies={companies} />
            </div>
        </div>
    );
}