import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export default async function Page() {
    const { userId } = await auth();
    if (!userId) return null;

    const apps = await prisma.application.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 20,
        include: { company: true },
    });

    return (
        <div>
            <h1 className="text-xl font-semibold">Applications</h1>
            <p>{userId}</p>
            <pre className="mt-4 text-sm">{JSON.stringify(apps, null, 2)}</pre>
        </div>
    );
}