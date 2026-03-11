import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50">
            <header className="border-b border-white/10 bg-zinc-950/60 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <nav className="flex items-center gap-4">
                        <Link className="font-semibold" href="/app/applications">
                            Job Tracker
                        </Link>
                        <Link className="text-sm opacity-70 hover:opacity-100" href="/app/applications">
                            Applications
                        </Link>
                        <Link className="text-sm opacity-70 hover:opacity-100" href="/app/companies">
                            Companies
                        </Link>
                    </nav>
                    <UserButton />
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
        </div>
    );
}