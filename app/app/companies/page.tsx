import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SearchParams = { q?: string };

export default async function Page({
    searchParams,
}: {
    searchParams: SearchParams | Promise<SearchParams>;
}) {
    const { userId } = await auth();
    if (!userId) return null;

    const sp = await Promise.resolve(searchParams);
    const q = (sp.q ?? "").trim();

    const companies = await prisma.company.findMany({
        where: {
            userId,
            ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
        },
        orderBy: { updatedAt: "desc" },
        take: 200,
        include: { _count: { select: { applications: true } } },
    });

    return (
        <div className="p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Companies</h1>
                    <div className="text-xs opacity-70">{companies.length} total</div>
                </div>

                <div className="flex gap-2">
                    <form className="flex gap-2" action="/app/companies" method="get">
                        <Input
                            name="q"
                            defaultValue={q}
                            placeholder="Search companies..."
                            className="w-64"
                        />
                        <Button variant="outline" type="submit">
                            Search
                        </Button>
                    </form>

                    <Link href="/app/companies/new">
                        <Button>Add</Button>
                    </Link>
                </div>
            </div>

            <div className="mt-6 rounded-lg border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="hidden md:table-cell">Website</TableHead>
                            <TableHead className="hidden md:table-cell">Location</TableHead>
                            <TableHead>Apps</TableHead>
                            <TableHead>Updated</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {companies.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-10 text-center">
                                    <div className="opacity-70">No companies yet.</div>
                                    <div className="mt-3">
                                        <Link href="/app/companies/new">
                                            <Button>Add company</Button>
                                        </Link>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            companies.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium">{c.name}</TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {c.website ? (
                                            <a
                                                className="underline"
                                                href={c.website}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                {c.website}
                                            </a>
                                        ) : (
                                            <span className="opacity-60">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {c.location ?? <span className="opacity-60">—</span>}
                                    </TableCell>
                                    <TableCell>{c._count.applications}</TableCell>
                                    <TableCell>
                                        {new Date(c.updatedAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right space-x-3">
                                        <Link
                                            className="underline"
                                            href={`/app/applications?q=${encodeURIComponent(c.name)}`}
                                        >
                                            View apps
                                        </Link>
                                        <Link className="underline" href={`/app/companies/${c.id}`}>
                                            Edit
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-6 text-sm opacity-70">
                Companies are also created automatically when you add an application.
            </div>
        </div>
    );
}