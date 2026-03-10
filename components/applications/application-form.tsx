"use client";

import * as React from "react";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createApplication, updateApplication } from "@/app/app/applications/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const StatusEnum = z.enum([
    "Draft",
    "Applied",
    "Interview",
    "Offer",
    "Rejected",
    "Archived",
]);

const FormSchema = z
    .object({
        roleTitle: z.string().min(2, "Role is required"),
        status: StatusEnum.default("Applied"),
        appliedAt: z.string().min(1, "Applied date is required"),
        companyId: z.string().optional(),
        newCompanyName: z.string().optional(),
        jobUrl: z
            .string()
            .trim()
            .optional()
            .refine((v) => !v || /^https?:\/\//i.test(v), "Invalid URL"),
        notes: z.string().optional(),
        salaryMin: z
            .string()
            .optional()
            .refine((v) => !v || /^\d+$/.test(v), "Must be a number"),
        salaryMax: z
            .string()
            .optional()
            .refine((v) => !v || /^\d+$/.test(v), "Must be a number"),
    })
    .refine(
        (d) => {
            const min = d.salaryMin ? Number(d.salaryMin) : undefined;
            const max = d.salaryMax ? Number(d.salaryMax) : undefined;
            return min === undefined || max === undefined || min <= max;
        },
        {
            message: "salaryMin must be <= salaryMax", path: ["salaryMax"]

        })
    .refine(
        (d) =>
            (d.companyId && d.companyId !== "__new") ||
            (d.newCompanyName && d.newCompanyName.trim().length > 0),
        { message: "Pick a company or add a new one", path: ["newCompanyName"] }
    );

type FormValues = z.infer<typeof FormSchema>;

type CompanyOption = { id: string; name: string };

function todayYYYYMMDD() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export default function ApplicationForm(props: {
    mode: "create" | "edit";
    appId?: string;
    companies: CompanyOption[];
    initial?: Partial<FormValues>;
}) {
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const companyOptions = useMemo(
        () => [{ id: "__new", name: "+ Add new company" }, ...props.companies],
        [props.companies]
    );

    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            roleTitle: props.initial?.roleTitle ?? "",
            status: (props.initial?.status as any) ?? "Applied",
            appliedAt: props.initial?.appliedAt ?? todayYYYYMMDD(),
            companyId: props.initial?.companyId ?? (props.companies[0]?.id ?? "__new"),
            newCompanyName: props.initial?.newCompanyName ?? "",
            jobUrl: props.initial?.jobUrl ?? "",
            notes: props.initial?.notes ?? "",
            salaryMin: props.initial?.salaryMin ?? "",
            salaryMax: props.initial?.salaryMax ?? "",
        },
    });

    const companyId = form.watch("companyId");
    const needsNewCompany = companyId === "__new";

    function onSubmit(values: FormValues) {
        setError(null);

        const payload = {
            roleTitle: values.roleTitle,
            status: values.status,
            appliedAt: values.appliedAt,
            companyId: needsNewCompany ? undefined : values.companyId,
            newCompanyName: needsNewCompany ? values.newCompanyName : undefined,
            jobUrl: values.jobUrl || undefined,
            notes: values.notes || undefined,
            salaryMin: values.salaryMin || undefined,
            salaryMax: values.salaryMax || undefined,
        };

        startTransition(() => {
            void (async () => {
                try {
                    if (props.mode === "create") {
                        await createApplication(payload);
                    } else {
                        await updateApplication(props.appId!, payload);
                    }
                } catch (e: any) {
                    setError(e?.message ?? "Something went wrong");
                }
            })();
        });
    }

    return (
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            {error ? (
                <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm">
                    {error}
                </div>
            ) : null}

            <div className="grid gap-2">
                <Label>Role title</Label>
                <Input {...form.register("roleTitle")} placeholder="Frontend Developer" />
                {form.formState.errors.roleTitle ? (
                    <p className="text-xs text-red-400">{form.formState.errors.roleTitle.message}</p>
                ) : null}
            </div>

            <div className="grid gap-2">
                <Label>Company</Label>
                <select
                    className="h-10 rounded-md border bg-transparent px-3 text-sm"
                    {...form.register("companyId", {
                        onChange: (e) => {
                            form.clearErrors(["companyId", "newCompanyName"]);
                            if (e.target.value === "__new") form.trigger("newCompanyName");
                        },
                    })}
                >
                    {companyOptions.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>

                {needsNewCompany ? (
                    <div className="mt-2 grid gap-2">
                        <Label>New company name</Label>
                        <Input {...form.register("newCompanyName", {
                            onChange: () => form.trigger("newCompanyName"),
                        })} placeholder="Demo Co" />
                        {form.formState.errors.newCompanyName ? (
                            <p className="text-xs text-red-400">
                                {form.formState.errors.newCompanyName.message}
                            </p>
                        ) : null}
                        {form.formState.errors.companyId ? (
                            <p className="text-xs text-red-400">
                                {form.formState.errors.companyId.message}
                            </p>
                        ) : null}
                    </div>
                ) : null}
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
                <div className="grid gap-2">
                    <Label>Status</Label>
                    <select className="h-10 rounded-md border bg-transparent px-3 text-sm" {...form.register("status")}>
                        <option value="Draft">Draft</option>
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Archived">Archived</option>
                    </select>
                </div>

                <div className="grid gap-2 sm:col-span-2">
                    <Label>Applied date</Label>
                    <Input type="date" {...form.register("appliedAt")} />
                    {form.formState.errors.appliedAt ? (
                        <p className="text-xs text-red-400">
                            {form.formState.errors.appliedAt.message}
                        </p>
                    ) : null}
                </div>
            </div>

            <div className="grid gap-2">
                <Label>Job URL (optional)</Label>
                <Input {...form.register("jobUrl")} placeholder="https://..." />
                {form.formState.errors.jobUrl ? (
                    <p className="text-xs text-red-400">
                        {form.formState.errors.jobUrl.message}
                    </p>
                ) : null}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label>Salary min (optional)</Label>
                    <Input inputMode="numeric" {...form.register("salaryMin")} placeholder="e.g. 3000" />
                    <p className="min-h-4 text-xs text-red-400">
                        {form.formState.errors.salaryMin?.message ?? ""}
                    </p>
                </div>
                <div className="grid gap-2">
                    <Label>Salary max (optional)</Label>
                    <Input inputMode="numeric" {...form.register("salaryMax")} placeholder="e.g. 5000" />
                    <p className="min-h-4 text-xs text-red-400">
                        {form.formState.errors.salaryMax?.message ?? ""}
                    </p>
                </div>
            </div>

            <div className="grid gap-2">
                <Label>Notes (optional)</Label>
                <textarea
                    className="min-h-24 rounded-md border bg-transparent p-3 text-sm"
                    {...form.register("notes")}
                    placeholder="Interview notes, follow-ups..."
                />
            </div>

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={pending || !form.formState.isValid}>
                    {pending ? "Saving..." : props.mode === "create" ? "Create" : "Save"}
                </Button>
            </div>
        </form>
    );
}