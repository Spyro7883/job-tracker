import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import ApplicationsTable from "@/components/applications/applications-table";
import type { Prisma } from "@/lib/generated/prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SearchParams = {
    q?: string;
    status?: string;
    page?: string;
    pageSize?: string;
    sort?: string;
    dir?: string;
};

const ALLOWED_STATUS = new Set([
    "Draft",
    "Applied",
    "Interview",
    "Offer",
    "Rejected",
    "Archived",
]);

function parseIntSafe(v: string | undefined, fallback: number) {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export default async function Page({
    searchParams,
}: {
    searchParams: SearchParams | Promise<SearchParams>;
}) {
    const { userId } = await auth();
    if (!userId) return null;

    const sp = await Promise.resolve(searchParams);

    const q = (sp.q ?? "").trim();
    const status = sp.status && ALLOWED_STATUS.has(sp.status) ? sp.status : "";
    const page = parseIntSafe(sp.page, 1);
    const pageSize = Math.min(parseIntSafe(sp.pageSize, 10), 50);

    const sort = (sp.sort ?? "updatedAt").trim();
    const dir: Prisma.SortOrder =
        (sp.dir ?? "").toLowerCase() === "asc" ? "asc" : "desc";

    const where: Prisma.ApplicationWhereInput = {
        userId,
        ...(status ? { status: status as any } : {}),
        ...(q
            ? {
                OR: [
                    { roleTitle: { contains: q, mode: "insensitive" } },
                    { company: { name: { contains: q, mode: "insensitive" } } },
                ],
            }
            : {}),
    };

    const orderBy: Prisma.ApplicationOrderByWithRelationInput[] =
        sort === "company"
            ? [{ company: { name: dir } }]
            : sort === "roleTitle"
                ? [{ roleTitle: dir }]
                : sort === "status"
                    ? [{ status: dir }]
                    : sort === "appliedAt"
                        ? [{ appliedAt: dir }]
                        : [{ updatedAt: dir }];

    const skip = (page - 1) * pageSize;

    const [items, total] = await prisma.$transaction([
        prisma.application.findMany({
            where,
            orderBy,
            skip,
            take: pageSize,
            include: {
                company: true,
                reminders: {
                    where: { done: false },
                    orderBy: { dueAt: "asc" },
                    take: 1,
                },
            },
        }),
        prisma.application.count({ where }),
    ]);

    const rows = items.map((a) => ({
        id: a.id,
        companyName: a.company?.name ?? "—",
        roleTitle: a.roleTitle,
        status: a.status,
        appliedAt: a.appliedAt?.toISOString() ?? null,
        updatedAt: a.updatedAt?.toISOString() ?? null,
        nextReminderAt: a.reminders?.[0]?.dueAt?.toISOString() ?? null,
    }));

    return (
        <div className="p-6">
            <ApplicationsTable
                userId={userId}
                data={rows}
                total={total}
                page={page}
                pageSize={pageSize}
                q={q}
                status={status}
                sort={sort}
                dir={dir}
            />
        </div>
    );
}