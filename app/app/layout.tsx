import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-zinc-50">
            <header className="border-b bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <nav className="flex items-center gap-4">
                        <Link className="font-semibold" href="/app/applications">
                            Job Tracker
                        </Link>
                        <Link className="text-sm text-zinc-600 hover:text-zinc-900" href="/app/applications">
                            Applications
                        </Link>
                        <Link className="text-sm text-zinc-600 hover:text-zinc-900" href="/app/companies">
                            Companies
                        </Link>
                    </nav>
                    <UserButton />
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </div>
    );
}