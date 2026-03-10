"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCompany } from "@/app/app/companies/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

export default function DeleteCompanyButton(props: { id: string }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const [err, setErr] = useState<string | null>(null);

    function onDelete() {
        setErr(null);
        startTransition(() => {
            void (async () => {
                try {
                    await deleteCompany(props.id);
                } catch (e: any) {
                    setErr(e?.message ?? "Failed to delete");
                    router.refresh();
                }
            })();
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Delete</Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete company?</DialogTitle>
                    <DialogDescription>
                        This will permanently delete the company and may delete its applications (cascade).
                    </DialogDescription>
                </DialogHeader>

                {err ? (
                    <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm">
                        {err}
                    </div>
                ) : null}

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
                        Cancel
                    </Button>
                    <Button onClick={onDelete} disabled={pending}>
                        {pending ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}