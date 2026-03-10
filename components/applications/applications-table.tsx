"use client";

import * as React from "react";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type Status =
    | ""
    | "Draft"
    | "Applied"
    | "Interview"
    | "Offer"
    | "Rejected"
    | "Archived";

type SortKey = "company" | "roleTitle" | "status" | "appliedAt" | "updatedAt";
type SortDir = "asc" | "desc";

type Row = {
    id: string;
    companyName: string;
    roleTitle: string;
    status: Exclude<Status, "">;
    appliedAt: string | null;
    updatedAt: string | null;
    nextReminderAt: string | null;
};

type QueryKey = "q" | "status" | "page" | "pageSize" | "sort" | "dir";

function fmtDate(iso: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString();
}

function buildUrl(sp: URLSearchParams) {
    const s = sp.toString();
    return s ? `?${s}` : "";
}

export default function ApplicationsTable(props: {
    userId: string;
    data: Row[];
    total: number;
    page: number;
    pageSize: number;
    q: string;
    status: Status;
    sort: SortKey;
    dir: SortDir;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [q, setQ] = useState(props.q);
    const [status, setStatus] = useState<Status>(props.status);

    useEffect(() => setQ(props.q), [props.q]);
    useEffect(() => setStatus(props.status), [props.status]);

    const setParam = useCallback(
        (next: Partial<Record<QueryKey, string | null>>) => {
            const sp = new URLSearchParams(searchParams.toString());
            for (const [k, v] of Object.entries(next) as [QueryKey, string | null][]) {
                if (!v) sp.delete(k);
                else sp.set(k, v);
            }
            router.push(buildUrl(sp));
        },
        [router, searchParams]
    );

    useEffect(() => {
        const t = setTimeout(() => {
            setParam({ q: q.trim() ? q.trim() : null, page: "1" });
        }, 300);
        return () => clearTimeout(t);
    }, [q, setParam]);

    const columns = useMemo<ColumnDef<Row, unknown>[]>(
        () => [
            {
                accessorKey: "companyName",
                header: () => (
                    <SortHeader
                        label="Company"
                        sortKey="company"
                        currentSort={props.sort}
                        dir={props.dir}
                        onSort={(sortKey, dir) => setParam({ sort: sortKey, dir, page: "1" })}
                    />
                ),
                cell: ({ row }) => (
                    <span className="font-medium">{row.original.companyName}</span>
                ),
            },
            {
                accessorKey: "roleTitle",
                header: () => (
                    <SortHeader
                        label="Role"
                        sortKey="roleTitle"
                        currentSort={props.sort}
                        dir={props.dir}
                        onSort={(sortKey, dir) => setParam({ sort: sortKey, dir, page: "1" })}
                    />
                ),
                cell: ({ row }) => <span>{row.original.roleTitle}</span>,
            },
            {
                accessorKey: "status",
                header: () => (
                    <SortHeader
                        label="Status"
                        sortKey="status"
                        currentSort={props.sort}
                        dir={props.dir}
                        onSort={(sortKey, dir) => setParam({ sort: sortKey, dir, page: "1" })}
                    />
                ),
                cell: ({ row }) => <span>{row.original.status}</span>,
            },
            {
                accessorKey: "appliedAt",
                header: () => (
                    <SortHeader
                        label="Applied"
                        sortKey="appliedAt"
                        currentSort={props.sort}
                        dir={props.dir}
                        onSort={(sortKey, dir) => setParam({ sort: sortKey, dir, page: "1" })}
                    />
                ),
                cell: ({ row }) => fmtDate(row.original.appliedAt),
            },
            {
                accessorKey: "nextReminderAt",
                header: "Next reminder",
                cell: ({ row }) => fmtDate(row.original.nextReminderAt),
            },
            {
                accessorKey: "updatedAt",
                header: () => (
                    <SortHeader
                        label="Updated"
                        sortKey="updatedAt"
                        currentSort={props.sort}
                        dir={props.dir}
                        onSort={(sortKey, dir) => setParam({ sort: sortKey, dir, page: "1" })}
                    />
                ),
                cell: ({ row }) => fmtDate(row.original.updatedAt),
            },
        ],
        [props.sort, props.dir, setParam]
    );

    const pageCount = Math.max(1, Math.ceil(props.total / props.pageSize));

    const table = useReactTable<Row>({
        data: props.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    function onFilterStatus(v: Status) {
        setStatus(v);
        setParam({ status: v || null, page: "1" });
    }

    function goToPage(p: number) {
        const clamped = Math.min(Math.max(p, 1), pageCount);
        setParam({ page: String(clamped) });
    }

    function setPageSize(sz: number) {
        setParam({ pageSize: String(sz), page: "1" });
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Applications</h1>
                    <div className="text-xs opacity-70">{props.userId}</div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search company or role..."
                        className="w-full sm:w-64"
                    />

                    <select
                        value={status}
                        onChange={(e) => onFilterStatus(e.target.value as Status)}
                        className="h-10 rounded-md border bg-transparent px-3 text-sm"
                    >
                        <option value="">All statuses</option>
                        <option value="Draft">Draft</option>
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Archived">Archived</option>
                    </select>

                    <Button className="cursor-pointer" onClick={() => router.push("/app/applications/new")}>
                        Add
                    </Button>
                </div>
            </div>

            <div className="rounded-lg border overflow-x-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((h) => (
                                    <TableHead key={h.id}>
                                        {flexRender(h.column.columnDef.header, h.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {props.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="py-10 text-center">
                                    <div className="opacity-70">No applications yet.</div>
                                    <div className="mt-3">
                                        <Button onClick={() => router.push("/app/applications/new")}>
                                            Add application
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((r) => (
                                <TableRow
                                    key={r.id}
                                    className="cursor-pointer hover:bg-white/5"
                                    onClick={() => router.push(`/app/applications/${r.original.id}`)}
                                >
                                    {r.getVisibleCells().map((c) => (
                                        <TableCell key={c.id}>
                                            {flexRender(c.column.columnDef.cell, c.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm opacity-70">
                    {props.total === 0
                        ? "0 results"
                        : `Showing ${(props.page - 1) * props.pageSize + 1}–${Math.min(
                            props.page * props.pageSize,
                            props.total
                        )} of ${props.total}`}
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={props.pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="h-9 rounded-md border bg-transparent px-2 text-sm"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>

                    <Button variant="outline" onClick={() => goToPage(props.page - 1)} disabled={props.page <= 1}>
                        Prev
                    </Button>

                    <div className="text-sm">
                        Page <span className="font-medium">{props.page}</span> / {pageCount}
                    </div>

                    <Button variant="outline" onClick={() => goToPage(props.page + 1)} disabled={props.page >= pageCount}>
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}

function SortHeader(props: {
    label: string;
    sortKey: SortKey;
    currentSort: SortKey;
    dir: SortDir;
    onSort: (sortKey: SortKey, dir: SortDir) => void;
}) {
    const active = props.currentSort === props.sortKey;
    const nextDir: SortDir = active && props.dir === "asc" ? "desc" : "asc";

    return (
        <button
            type="button"
            className="inline-flex items-center gap-1"
            onClick={() => props.onSort(props.sortKey, nextDir)}
        >
            <span>{props.label}</span>
            <span className="text-xs opacity-60">{active ? (props.dir === "asc" ? "↑" : "↓") : ""}</span>
        </button>
    );
}