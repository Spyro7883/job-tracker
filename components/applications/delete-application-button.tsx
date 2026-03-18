"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteApplication } from "@/app/app/applications/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

export default function DeleteApplicationButton(props: { id: string }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const [err, setErr] = useState<string | null>(null);

    function onDelete() {
        setErr(null);
        startTransition(() => {
            void (async () => {
                try {
                    await deleteApplication(props.id);
                    router.push("/app/applications");
                } catch (e: any) {
                    setErr(e?.message ?? "Failed to delete");
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
                    <DialogTitle>Delete application?</DialogTitle>
                    <DialogDescription>
                        This will permanently delete the application and its reminders.
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