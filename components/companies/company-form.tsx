"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCompany, updateCompany } from "@/app/app/companies/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Schema = z.object({
  name: z.string().min(2, "Name is required"),
  website: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^https?:\/\//i.test(v), "Invalid URL"),
  location: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

type Values = z.infer<typeof Schema>;

export default function CompanyForm(props: {
  mode: "create" | "edit";
  companyId?: string;
  initial?: Partial<Values>;
}) {
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(Schema),
    mode: "onChange",
    defaultValues: {
      name: props.initial?.name ?? "",
      website: props.initial?.website ?? "",
      location: props.initial?.location ?? "",
      notes: props.initial?.notes ?? "",
    },
  });

  function onSubmit(values: Values) {
    setErr(null);
    startTransition(() => {
      void (async () => {
        try {
          if (props.mode === "create") await createCompany(values);
          else await updateCompany(props.companyId!, values);
        } catch (e: any) {
          setErr(e?.message ?? "Something went wrong");
        }
      })();
    });
  }

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      {err ? (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm">
          {err}
        </div>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...form.register("name")} placeholder="Demo Co" />
        <p className="min-h-4 text-xs text-red-400">
          {form.formState.errors.name?.message ?? ""}
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="website">Website (optional)</Label>
        <Input id="website" {...form.register("website")} placeholder="https://..." />
        <p className="min-h-4 text-xs text-red-400">
          {form.formState.errors.website?.message ?? ""}
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="location">Location (optional)</Label>
        <Input id="location" {...form.register("location")} placeholder="Bucharest" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <textarea
          id="notes"
          className="min-h-24 rounded-md border bg-transparent p-3 text-sm"
          {...form.register("notes")}
        />
      </div>

      <Button type="submit" disabled={pending || !form.formState.isValid}>
        {pending ? "Saving..." : props.mode === "create" ? "Create" : "Save"}
      </Button>
    </form>
  );
}