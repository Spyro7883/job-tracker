"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createReminder, toggleReminderDone } from "@/app/app/applications/actions";
import { toast } from "sonner";

type ReminderType = "Email" | "Call" | "DM" | "Other";

export type ReminderRow = {
    id: string;
    dueAt: string;
    type: ReminderType;
    done: boolean;
};

function fmtDT(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
}

function toDateTimeLocalValue(iso: string) {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
    )}:${pad(d.getMinutes())}`;
}

export default function RemindersPanel(props: {
    applicationId: string;
    reminders: ReminderRow[];
}) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [err, setErr] = useState<string | null>(null);

    const [type, setType] = useState<ReminderType>("Email");
    const [dueAt, setDueAt] = useState<string>(() =>
        toDateTimeLocalValue(new Date().toISOString())
    );

    function onAdd() {
        setErr(null);

        startTransition(() => {
            void (async () => {
                try {
                    await createReminder({
                        applicationId: props.applicationId,
                        type,
                        dueAt: new Date(dueAt).toISOString(),
                    });
                    toast.success("Reminder added");
                    router.refresh();
                } catch (e: any) {
                    setErr(e?.message ?? "Failed to create reminder");
                }
            })();
        });
    }

    function onToggle(reminderId: string, done: boolean) {
        setErr(null);

        startTransition(() => {
            void (async () => {
                try {
                    await toggleReminderDone({ reminderId, done });
                    toast.success(done ? "Marked as done" : "Marked as pending");
                    router.refresh();
                } catch (e: any) {
                    setErr(e?.message ?? "Failed to update reminder");
                }
            })();
        });
    }

    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-lg font-semibold">Reminders</h2>

            {err ? (
                <div className="mt-3 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm">
                    {err}
                </div>
            ) : null}

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="grid gap-2 sm:col-span-2">
                    <Label>Due date</Label>
                    <input
                        type="datetime-local"
                        className="h-10 rounded-md border bg-transparent px-3 text-sm"
                        value={dueAt}
                        onChange={(e) => setDueAt(e.target.value)}
                    />
                </div>

                <div className="grid gap-2">
                    <Label>Type</Label>
                    <select
                        className="h-10 rounded-md border bg-transparent px-3 text-sm"
                        value={type}
                        onChange={(e) => setType(e.target.value as ReminderType)}
                    >
                        <option value="Email">Email</option>
                        <option value="Call">Call</option>
                        <option value="DM">DM</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="sm:col-span-3">
                    <Button onClick={onAdd} disabled={pending}>
                        {pending ? "Adding..." : "Add reminder"}
                    </Button>
                </div>
            </div>

            <div className="mt-6">
                {props.reminders.length === 0 ? (
                    <div className="text-sm opacity-70">No reminders yet.</div>
                ) : (
                    <ul className="space-y-2">
                        {props.reminders.map((r) => (
                            <li key={r.id} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/5 p-3">
                                <div className="min-w-0">
                                    <div className="truncate font-medium">
                                        {fmtDT(r.dueAt)} · {r.type}
                                    </div>
                                    <div className="text-xs opacity-70">{r.done ? "Done" : "Pending"}</div>
                                </div>

                                <Button
                                    variant="outline"
                                    disabled={pending}
                                    onClick={() => onToggle(r.id, !r.done)}
                                >
                                    {r.done ? "Undo" : "Done"}
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}